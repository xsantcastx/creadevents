import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SearchService, SearchResult, SearchFilters, SearchSuggestion } from '../../services/search.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchService = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Component state
  searchFocused = signal(false);
  showSuggestions = signal(false);
  viewMode = signal<'list' | 'grid'>('list');
  hasSearched = signal(false);

  // Search state
  currentQuery = signal('');
  isLoading = signal(false);
  loadingSuggestions = signal(false);
  selectedSuggestionIndex = signal(-1);

  // Search results
  searchResults = signal<SearchResult[]>([]);
  totalResults = signal(0);
  currentPage = signal(1);
  totalPages = computed(() => Math.ceil(this.totalResults() / this.resultsPerPage));
  resultsPerPage = 12;

  // Filters
  selectedTypes = signal<string[]>([]);
  selectedCategories = signal<string[]>([]);
  currentSort = signal('relevance');

  // Suggestions
  searchSuggestions = signal<SearchSuggestion[]>([]);
  recentSearches = signal<string[]>([]);
  popularSearches = signal<{ term: string; count: number }[]>([]);

  // Computed properties
  displayedResults = computed(() => {
    const results = this.searchResults();
    const page = this.currentPage();
    const startIndex = (page - 1) * this.resultsPerPage;
    return results.slice(startIndex, startIndex + this.resultsPerPage);
  });

  hasActiveFilters = computed(() => 
    this.selectedTypes().length > 0 || 
    this.selectedCategories().length > 0 || 
    this.currentSort() !== 'relevance'
  );

  availableCategories = signal<string[]>([]);

  // Configuration
  contentTypes = [
    { key: 'projects', label: 'Projects', icon: 'fa-folder', count: 0 },
    { key: 'services', label: 'Services', icon: 'fa-cogs', count: 0 },
    { key: 'blog', label: 'Blog Posts', icon: 'fa-newspaper', count: 0 },
    { key: 'testimonials', label: 'Testimonials', icon: 'fa-comments', count: 0 }
  ];

  sortOptions = [
    { key: 'relevance', label: 'Relevance', value: 'relevance' },
    { key: 'date', label: 'Date', value: 'date' },
    { key: 'title', label: 'Title', value: 'title' },
    { key: 'popularity', label: 'Popularity', value: 'popularity' }
  ];

  // Search form
  searchForm: FormGroup;

  constructor() {
    this.searchForm = this.fb.group({
      query: ['']
    });

    // Setup search debouncing
    this.searchForm.get('query')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.currentQuery.set(query || '');
        if (query?.length >= 2) {
          this.loadSuggestions(query);
        } else {
          this.searchSuggestions.set([]);
          this.showSuggestions.set(false);
        }
      });

    // Load popular searches on init
    effect(() => {
      this.loadPopularSearches();
    });
  }

  ngOnInit() {
    // Check for search query in URL
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['q']) {
          this.searchForm.patchValue({ query: params['q'] });
          this.performSearchWithTerm(params['q']);
        }
        if (params['type']) {
          this.selectedTypes.set([params['type']]);
        }
        if (params['category']) {
          this.selectedCategories.set([params['category']]);
        }
        if (params['sort']) {
          this.currentSort.set(params['sort']);
        }
        if (params['page']) {
          this.currentPage.set(parseInt(params['page'], 10));
        }
      });

    // Load recent searches from localStorage
    this.loadRecentSearches();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Search input handlers
  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchForm.patchValue({ query: target.value });
  }

  onSearchFocus() {
    this.searchFocused.set(true);
    if (this.currentQuery().length >= 2) {
      this.showSuggestions.set(true);
    }
  }

  onSearchBlur() {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      this.searchFocused.set(false);
      this.showSuggestions.set(false);
      this.selectedSuggestionIndex.set(-1);
    }, 200);
  }

  onSearchKeydown(event: KeyboardEvent) {
    const suggestions = this.searchSuggestions();
    const selectedIndex = this.selectedSuggestionIndex();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (selectedIndex < suggestions.length - 1) {
          this.selectedSuggestionIndex.set(selectedIndex + 1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (selectedIndex > 0) {
          this.selectedSuggestionIndex.set(selectedIndex - 1);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          this.selectSuggestion(suggestions[selectedIndex]);
        } else {
          this.performSearch();
        }
        break;
      case 'Escape':
        this.showSuggestions.set(false);
        this.selectedSuggestionIndex.set(-1);
        break;
    }
  }

  // Search operations
  async performSearch() {
    const query = this.currentQuery().trim();
    if (!query) return;

    this.hasSearched.set(true);
    this.isLoading.set(true);
    this.showSuggestions.set(false);
    this.currentPage.set(1);

    // Add to recent searches
    this.addToRecentSearches(query);

    // Update URL
    this.updateUrl();

    // Perform the search
    const filters = {
      contentTypes: this.selectedTypes() as ('project' | 'service' | 'blog' | 'testimonial')[],
      categories: this.selectedCategories(),
      sortBy: this.currentSort() as 'relevance' | 'date' | 'title',
      sortOrder: 'desc' as const
    };

    try {
      const results = await this.searchService.search(query, filters);
      this.searchResults.set(results);
      this.totalResults.set(results.length);
      this.isLoading.set(false);
      
      // Update content type counts
      this.updateContentTypeCounts(results);
    } catch (error) {
      console.error('Search error:', error);
      this.isLoading.set(false);
      this.searchResults.set([]);
      this.totalResults.set(0);
    }
  }

  performSearchWithTerm(term: string) {
    this.searchForm.patchValue({ query: term });
    this.currentQuery.set(term);
    this.performSearch();
  }

  clearSearch() {
    this.searchForm.reset();
    this.currentQuery.set('');
    this.searchResults.set([]);
    this.totalResults.set(0);
    this.hasSearched.set(false);
    this.showSuggestions.set(false);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  // Suggestions
  async loadSuggestions(query: string) {
    this.loadingSuggestions.set(true);
    
    try {
      const suggestions = await this.searchService.generateSuggestions(query);
      this.searchSuggestions.set(suggestions);
      this.showSuggestions.set(true);
      this.loadingSuggestions.set(false);
    } catch (error) {
      this.loadingSuggestions.set(false);
      this.searchSuggestions.set([]);
    }
  }

  selectSuggestion(suggestion: SearchSuggestion) {
    this.performSearchWithTerm(suggestion.text);
    this.showSuggestions.set(false);
  }

  // Filters
  toggleContentType(type: string) {
    const types = this.selectedTypes();
    if (types.includes(type)) {
      this.selectedTypes.set(types.filter(t => t !== type));
    } else {
      this.selectedTypes.set([...types, type]);
    }
    this.currentPage.set(1);
    if (this.hasSearched()) {
      this.performSearch();
    }
  }

  toggleCategory(categoryId: string, event?: any) {
    const categories = this.selectedCategories();
    const isChecked = event?.target?.checked;
    
    if (isChecked) {
      this.selectedCategories.set([...categories, categoryId]);
    } else {
      this.selectedCategories.set(categories.filter(c => c !== categoryId));
    }
    
    this.currentPage.set(1);
    if (this.hasSearched()) {
      this.performSearch();
    }
  }

  onSortChange(sort: string) {
    this.currentSort.set(sort);
    this.currentPage.set(1);
    if (this.hasSearched()) {
      this.performSearch();
    }
  }

  clearAllFilters() {
    this.selectedTypes.set([]);
    this.selectedCategories.set([]);
    this.currentSort.set('relevance');
    this.currentPage.set(1);
    if (this.hasSearched()) {
      this.performSearch();
    }
  }

  // View controls
  setViewMode(mode: 'list' | 'grid') {
    this.viewMode.set(mode);
    // Save preference to localStorage
    localStorage.setItem('searchViewMode', mode);
  }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updateUrl();
      this.performSearch();
    }
  }

  getVisiblePages(): (number | string)[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const visible: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        visible.push(i);
      }
    } else {
      visible.push(1);
      
      if (current > 4) {
        visible.push('...');
      }
      
      const start = Math.max(2, current - 2);
      const end = Math.min(total - 1, current + 2);
      
      for (let i = start; i <= end; i++) {
        visible.push(i);
      }
      
      if (current < total - 3) {
        visible.push('...');
      }
      
      visible.push(total);
    }

    return visible;
  }

  // Utility methods
  highlightSearchTerms(text: string): string {
    const query = this.currentQuery().toLowerCase();
    if (!query || !text) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  private updateUrl() {
    const queryParams: any = {};
    
    if (this.currentQuery()) {
      queryParams.q = this.currentQuery();
    }
    if (this.selectedTypes().length > 0) {
      queryParams.type = this.selectedTypes().join(',');
    }
    if (this.selectedCategories().length > 0) {
      queryParams.category = this.selectedCategories().join(',');
    }
    if (this.currentSort() !== 'relevance') {
      queryParams.sort = this.currentSort();
    }
    if (this.currentPage() > 1) {
      queryParams.page = this.currentPage();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  private updateContentTypeCounts(results: SearchResult[]) {
    // Count results by type
    const typeCounts = results.reduce((counts, result) => {
      counts[result.type] = (counts[result.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Update content types with counts
    this.contentTypes.forEach(type => {
      type.count = typeCounts[type.key] || 0;
    });
  }

  private loadRecentSearches() {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      try {
        this.recentSearches.set(JSON.parse(recent));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }

    // Load view mode preference
    const viewMode = localStorage.getItem('searchViewMode') as 'list' | 'grid';
    if (viewMode) {
      this.viewMode.set(viewMode);
    }
  }

  private addToRecentSearches(query: string) {
    const recent = this.recentSearches();
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, 5);
    this.recentSearches.set(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }

  private loadPopularSearches() {
    try {
      // Get popular searches from service signal and map to expected format
      const popularStrings = this.searchService.popularSearches();
      const popularFormatted = popularStrings.map(term => ({ term, count: 0 }));
      this.popularSearches.set(popularFormatted);
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  }

  // Utility methods for template
  isSearching = computed(() => this.isLoading());
  hasResults = computed(() => this.searchResults().length > 0);
  resultCount = computed(() => this.searchResults().length);
  
  selectedFilters = computed(() => ({
    contentTypes: this.selectedTypes(),
    categories: this.selectedCategories(),
    sortBy: this.currentSort()
  }));

  getTypeCount(typeKey: string): number {
    const type = this.contentTypes.find(t => t.key === typeKey);
    return type?.count || 0;
  }

  getTypeLabel(type: string): string {
    const typeConfig = this.contentTypes.find(t => t.key === type);
    return typeConfig?.label || type;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  updateSortBy(sortBy: string): void {
    this.currentSort.set(sortBy);
    this.performSearch();
  }

  clearFilters(): void {
    this.clearAllFilters();
  }

  performSearchQuery(query: string): void {
    this.performSearchWithTerm(query);
  }
}