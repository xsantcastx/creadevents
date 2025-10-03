import { Injectable, inject, signal, computed } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Project, Service, BlogPost, Testimonial } from '../models/data.models';
import { Observable, combineLatest, map, debounceTime, distinctUntilChanged, startWith } from 'rxjs';

export interface SearchResult {
  id: string;
  type: 'project' | 'service' | 'blog' | 'testimonial';
  title: string;
  description: string;
  excerpt?: string;
  imageUrl?: string;
  url: string;
  relevanceScore: number;
  highlightedTitle?: string;
  highlightedDescription?: string;
  tags?: string[];
  category?: string;
  date?: Date;
  author?: string;
}

export interface SearchFilters {
  contentTypes: ('project' | 'service' | 'blog' | 'testimonial')[];
  categories: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: 'relevance' | 'date' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'tag';
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private firestoreService = inject(FirestoreService);

  // Search state
  currentQuery = signal('');
  isSearching = signal(false);
  searchResults = signal<SearchResult[]>([]);
  searchSuggestions = signal<SearchSuggestion[]>([]);
  selectedFilters = signal<SearchFilters>({
    contentTypes: ['project', 'service', 'blog', 'testimonial'],
    categories: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  // Search history
  recentSearches = signal<string[]>([]);
  popularSearches = signal<string[]>([
    'wedding', 'corporate event', 'floral design', 'decoration', 'spring', 'summer'
  ]);

  // Computed properties
  hasResults = computed(() => this.searchResults().length > 0);
  resultCount = computed(() => this.searchResults().length);
  filteredResultsByType = computed(() => {
    const results = this.searchResults();
    return {
      projects: results.filter(r => r.type === 'project'),
      services: results.filter(r => r.type === 'service'),
      blogs: results.filter(r => r.type === 'blog'),
      testimonials: results.filter(r => r.type === 'testimonial')
    };
  });

  constructor() {
    this.loadRecentSearches();
  }

  // Main search method
  async search(query: string, filters?: Partial<SearchFilters>): Promise<SearchResult[]> {
    if (!query.trim()) {
      this.searchResults.set([]);
      return [];
    }

    this.isSearching.set(true);
    this.currentQuery.set(query);

    try {
      // Update filters if provided
      if (filters) {
        this.selectedFilters.update(current => ({ ...current, ...filters }));
      }

      // Add to recent searches
      this.addToRecentSearches(query);

      // Get all content
      const [projects, services, blogPosts, testimonials] = await Promise.all([
        this.firestoreService.getProjects().toPromise(),
        this.firestoreService.getServices().toPromise(),
        this.firestoreService.getBlogPosts().toPromise(),
        this.firestoreService.getTestimonials().toPromise()
      ]);

      // Search through all content
      const results: SearchResult[] = [];

      // Search projects
      if (this.selectedFilters().contentTypes.includes('project')) {
        results.push(...this.searchProjects(projects || [], query));
      }

      // Search services
      if (this.selectedFilters().contentTypes.includes('service')) {
        results.push(...this.searchServices(services || [], query));
      }

      // Search blog posts
      if (this.selectedFilters().contentTypes.includes('blog')) {
        results.push(...this.searchBlogPosts(blogPosts || [], query));
      }

      // Search testimonials
      if (this.selectedFilters().contentTypes.includes('testimonial')) {
        results.push(...this.searchTestimonials(testimonials || [], query));
      }

      // Apply additional filters and sorting
      const filteredResults = this.applyFiltersAndSort(results, query);

      this.searchResults.set(filteredResults);
      return filteredResults;

    } catch (error) {
      console.error('Search error:', error);
      this.searchResults.set([]);
      return [];
    } finally {
      this.isSearching.set(false);
    }
  }

  // Search individual content types
  private searchProjects(projects: Project[], query: string): SearchResult[] {
    return projects
      .map(project => ({
        ...this.calculateRelevance(project, query, ['title', 'description', 'client']),
        id: project.id!,
        type: 'project' as const,
        title: project.title,
        description: project.description || '',
        imageUrl: project.imageUrls?.[0] || '',
        url: `/portfolio/${project.slug}`,
        category: project.category,
        date: project.eventDate || project.createdAt,
        tags: []
      }))
      .filter(result => result.relevanceScore > 0);
  }

  private searchServices(services: Service[], query: string): SearchResult[] {
    return services
      .map(service => ({
        ...this.calculateRelevance(service, query, ['name', 'description', 'features']),
        id: service.id!,
        type: 'service' as const,
        title: service.name || '',
        description: service.description || '',
        imageUrl: service.imageUrl || '',
        url: `/services/${service.slug}`,
        category: service.category,
        tags: service.features || []
      }))
      .filter(result => result.relevanceScore > 0);
  }

  private searchBlogPosts(blogPosts: BlogPost[], query: string): SearchResult[] {
    return blogPosts
      .map(post => ({
        ...this.calculateRelevance(post, query, ['title', 'excerpt', 'body', 'tags']),
        id: post.id!,
        type: 'blog' as const,
        title: post.title,
        description: post.excerpt || '',
        excerpt: post.excerpt,
        imageUrl: post.coverImage,
        url: `/blog/${post.slug}`,
        category: 'blog',
        date: post.createdAt,
        author: 'Admin',
        tags: post.tags || []
      }))
      .filter(result => result.relevanceScore > 0);
  }

  private searchTestimonials(testimonials: Testimonial[], query: string): SearchResult[] {
    return testimonials
      .map(testimonial => ({
        ...this.calculateRelevance(testimonial, query, ['author', 'quote', 'event']),
        id: testimonial.id!,
        type: 'testimonial' as const,
        title: `Testimonial from ${testimonial.author}`,
        description: testimonial.quote,
        url: `/testimonials#${testimonial.id}`,
        author: testimonial.author,
        date: testimonial.createdAt
      }))
      .filter(result => result.relevanceScore > 0);
  }

  // Advanced relevance calculation
  private calculateRelevance(item: any, query: string, searchFields: string[]): {
    relevanceScore: number;
    highlightedTitle?: string;
    highlightedDescription?: string;
  } {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    let totalScore = 0;
    let highlightedTitle = '';
    let highlightedDescription = '';

    // Calculate score for each field
    for (const field of searchFields) {
      const fieldValue = this.getNestedValue(item, field);
      if (!fieldValue) continue;

      const fieldText = Array.isArray(fieldValue) ? fieldValue.join(' ') : String(fieldValue);
      const fieldScore = this.calculateFieldScore(fieldText, queryWords, field);
      
      totalScore += fieldScore;

      // Generate highlighted text for title and description
      if (field === 'title' || field === 'name') {
        highlightedTitle = this.highlightText(fieldText, queryWords);
      } else if (field === 'description' || field === 'excerpt' || field === 'quote') {
        highlightedDescription = this.highlightText(fieldText, queryWords);
      }
    }

    return {
      relevanceScore: totalScore,
      highlightedTitle: highlightedTitle || undefined,
      highlightedDescription: highlightedDescription || undefined
    };
  }

  private calculateFieldScore(text: string, queryWords: string[], fieldName: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;

    // Field weight multipliers
    const fieldWeights: { [key: string]: number } = {
      title: 3,
      name: 3,
      description: 2,
      excerpt: 2,
      quote: 2,
      tags: 1.5,
      features: 1.5,
      client: 1,
      author: 1,
      event: 1,
      body: 0.5
    };

    const weight = fieldWeights[fieldName] || 1;

    for (const word of queryWords) {
      // Exact phrase match (highest score)
      if (lowerText.includes(queryWords.join(' '))) {
        score += 10 * weight;
      }

      // Exact word match
      const wordRegex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
      const wordMatches = lowerText.match(wordRegex);
      if (wordMatches) {
        score += wordMatches.length * 5 * weight;
      }

      // Partial word match
      if (lowerText.includes(word)) {
        score += 2 * weight;
      }

      // Fuzzy match (Levenshtein distance)
      const words = lowerText.split(/\s+/);
      for (const textWord of words) {
        const distance = this.levenshteinDistance(word, textWord);
        if (distance <= 2 && textWord.length > 3) {
          score += (3 - distance) * weight;
        }
      }
    }

    return score;
  }

  // Text highlighting for search results
  private highlightText(text: string, queryWords: string[]): string {
    let highlightedText = text;

    for (const word of queryWords) {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    return highlightedText;
  }

  // Search suggestions
  async generateSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (query.length < 2) {
      return this.getDefaultSuggestions();
    }

    try {
      const suggestions: SearchSuggestion[] = [];

      // Add query completions
      const queryCompletions = this.getQueryCompletions(query);
      suggestions.push(...queryCompletions);

      // Add category suggestions
      const categoryMatches = this.getCategorySuggestions(query);
      suggestions.push(...categoryMatches);

      // Add tag suggestions
      const tagMatches = await this.getTagSuggestions(query);
      suggestions.push(...tagMatches);

      this.searchSuggestions.set(suggestions.slice(0, 8));
      return suggestions;

    } catch (error) {
      console.error('Error generating suggestions:', error);
      return this.getDefaultSuggestions();
    }
  }

  private getQueryCompletions(query: string): SearchSuggestion[] {
    const completions = [
      'wedding decoration', 'corporate events', 'floral arrangements',
      'birthday parties', 'anniversary celebrations', 'spring flowers',
      'summer events', 'winter wonderland', 'autumn themes'
    ];

    return completions
      .filter(completion => completion.toLowerCase().includes(query.toLowerCase()))
      .map(completion => ({ text: completion, type: 'query' as const }));
  }

  private getCategorySuggestions(query: string): SearchSuggestion[] {
    const categories = ['wedding', 'corporate', 'birthday', 'anniversary', 'seasonal', 'holiday'];

    return categories
      .filter(category => category.toLowerCase().includes(query.toLowerCase()))
      .map(category => ({ text: category, type: 'category' as const }));
  }

  private async getTagSuggestions(query: string): Promise<SearchSuggestion[]> {
    // This would ideally fetch from a tags collection in Firestore
    const commonTags = [
      'flowers', 'decoration', 'elegant', 'rustic', 'modern', 'vintage',
      'outdoor', 'indoor', 'centerpieces', 'bouquets', 'lighting'
    ];

    return commonTags
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
      .map(tag => ({ text: tag, type: 'tag' as const }));
  }

  private getDefaultSuggestions(): SearchSuggestion[] {
    return this.popularSearches().map(search => ({ text: search, type: 'query' as const }));
  }

  // Utility methods
  private applyFiltersAndSort(results: SearchResult[], query: string): SearchResult[] {
    const filters = this.selectedFilters();
    let filteredResults = [...results];

    // Apply category filter
    if (filters.categories.length > 0) {
      filteredResults = filteredResults.filter(result => 
        result.category && filters.categories.includes(result.category)
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      filteredResults = filteredResults.filter(result => {
        if (!result.date) return true;
        const resultDate = new Date(result.date);
        return resultDate >= filters.dateRange!.start && resultDate <= filters.dateRange!.end;
      });
    }

    // Sort results
    filteredResults.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case 'date':
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          comparison = dateB - dateA;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return filters.sortOrder === 'desc' ? comparison : -comparison;
    });

    return filteredResults;
  }

  private addToRecentSearches(query: string): void {
    const recent = this.recentSearches();
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, 10);
    this.recentSearches.set(updated);
    this.saveRecentSearches(updated);
  }

  private loadRecentSearches(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('creadevents_recent_searches');
      if (saved) {
        try {
          this.recentSearches.set(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading recent searches:', error);
        }
      }
    }
  }

  private saveRecentSearches(searches: string[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('creadevents_recent_searches', JSON.stringify(searches));
    }
  }

  // Helper methods
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Public API methods
  clearSearch(): void {
    this.currentQuery.set('');
    this.searchResults.set([]);
  }

  updateFilters(filters: Partial<SearchFilters>): void {
    this.selectedFilters.update(current => ({ ...current, ...filters }));
    const query = this.currentQuery();
    if (query) {
      this.search(query);
    }
  }

  clearRecentSearches(): void {
    this.recentSearches.set([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('creadevents_recent_searches');
    }
  }

  getSearchUrl(query: string, filters?: Partial<SearchFilters>): string {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (filters?.contentTypes && filters.contentTypes.length < 4) {
      params.set('types', filters.contentTypes.join(','));
    }
    
    if (filters?.categories && filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    }
    
    if (filters?.sortBy && filters.sortBy !== 'relevance') {
      params.set('sort', filters.sortBy);
    }

    return `/search?${params.toString()}`;
  }
}