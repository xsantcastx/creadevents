import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { BlogPost } from '../../../models/data.models';

@Component({
  selector: 'app-blog-list',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="blog-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Behind the Blooms</h1>
          <p class="hero-subtitle">
            Discover the inspiration, trends, and stories behind our most beautiful floral designs. 
            From venue spotlights to seasonal guides, we're sharing our expertise with you.
          </p>
        </div>
      </section>

      <!-- Blog Content -->
      <section class="blog-content">
        <div class="container">
          
          <!-- Featured Post -->
          @if (featuredPost()) {
            <div class="featured-section">
              <h2>Featured Post</h2>
              <article class="featured-post">
                <div class="featured-image">
                  <img [src]="featuredPost()!.coverImage" [alt]="featuredPost()!.title" loading="eager">
                  <div class="featured-overlay">
                    <div class="post-category">{{ getCategoryLabel(featuredPost()!.tags[0]) }}</div>
                  </div>
                </div>
                <div class="featured-content">
                  <div class="post-meta">
                    <span class="post-date">{{ formatDate(featuredPost()!.createdAt!) }}</span>
                    <span class="read-time">{{ getReadTime(featuredPost()!.body) }} min read</span>
                  </div>
                  <h3>
                    <a [routerLink]="['/blog', featuredPost()!.slug]">{{ featuredPost()!.title }}</a>
                  </h3>
                  <p class="post-excerpt">{{ featuredPost()!.excerpt }}</p>
                  <a [routerLink]="['/blog', featuredPost()!.slug]" class="read-more">Read More →</a>
                </div>
              </article>
            </div>
          }

          <!-- Filter Tabs -->
          <div class="filter-section">
            <div class="filter-tabs">
              <button 
                class="filter-tab" 
                [class.active]="selectedCategory() === 'all'"
                (click)="filterPosts('all')">
                All Posts
              </button>
              @for (category of categories; track category) {
                <button 
                  class="filter-tab" 
                  [class.active]="selectedCategory() === category"
                  (click)="filterPosts(category)">
                  {{ getCategoryLabel(category) }}
                </button>
              }
            </div>
          </div>

          <!-- Blog Grid -->
          @if (filteredPosts().length > 0) {
            <div class="blog-grid">
              @for (post of paginatedPosts(); track post.id) {
                <article class="blog-card">
                  <div class="card-image">
                    <img [src]="post.coverImage" [alt]="post.title" loading="lazy">
                    <div class="card-overlay">
                      <div class="post-category">{{ getCategoryLabel(post.tags[0]) }}</div>
                    </div>
                  </div>
                  
                  <div class="card-content">
                    <div class="post-meta">
                      <span class="post-date">{{ formatDate(post.createdAt!) }}</span>
                      <span class="read-time">{{ getReadTime(post.body) }} min read</span>
                    </div>
                    
                    <h3>
                      <a [routerLink]="['/blog', post.slug]">{{ post.title }}</a>
                    </h3>
                    
                    <p class="post-excerpt">{{ post.excerpt }}</p>
                    
                    <div class="post-tags">
                      @for (tag of post.tags.slice(0, 3); track tag) {
                        <span class="tag">{{ getCategoryLabel(tag) }}</span>
                      }
                    </div>
                    
                    <a [routerLink]="['/blog', post.slug]" class="read-more">Read More →</a>
                  </div>
                </article>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="pagination">
                <button 
                  class="page-btn" 
                  [disabled]="currentPage() === 1"
                  (click)="goToPage(currentPage() - 1)">
                  ← Previous
                </button>
                
                <div class="page-numbers">
                  @for (page of getPageNumbers(); track page) {
                    <button 
                      class="page-number" 
                      [class.active]="page === currentPage()"
                      (click)="goToPage(page)">
                      {{ page }}
                    </button>
                  }
                </div>
                
                <button 
                  class="page-btn" 
                  [disabled]="currentPage() === totalPages()"
                  (click)="goToPage(currentPage() + 1)">
                  Next →
                </button>
              </div>
            }
            
          } @else {
            <div class="no-posts">
              <div class="no-posts-content">
                <h3>No posts found</h3>
                <p>We haven't published any posts in this category yet. Check back soon for new content!</p>
                <button (click)="filterPosts('all')" class="btn btn-primary">View All Posts</button>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Newsletter Signup -->
      <section class="newsletter-section">
        <div class="container">
          <div class="newsletter-content">
            <h2>Stay Inspired</h2>
            <p>Subscribe to our newsletter for the latest floral trends, design tips, and exclusive behind-the-scenes content.</p>
            <form class="newsletter-form" (submit)="subscribeNewsletter($event)">
              <input 
                type="email" 
                placeholder="Enter your email address"
                #emailInput
                required>
              <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
            <p class="newsletter-note">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .blog-page {
      min-height: 100vh;
      padding-top: 70px;
    }

    .hero-section {
      background: linear-gradient(
        135deg,
        var(--theme-primary, #7FB069) 0%,
        var(--theme-secondary, #F7E9E3) 100%
      );
      padding: 4rem 0;
      text-align: center;
      color: white;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .hero-subtitle {
      font-size: 1.2rem;
      line-height: 1.6;
      opacity: 0.95;
    }

    .blog-content {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .featured-section {
      margin-bottom: 4rem;
    }

    .featured-section h2 {
      color: var(--theme-text, #2D3436);
      font-size: 2rem;
      margin-bottom: 2rem;
      text-align: center;
    }

    .featured-post {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      min-height: 400px;
    }

    .featured-image {
      position: relative;
      overflow: hidden;
    }

    .featured-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .featured-overlay {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
    }

    .post-category {
      background: var(--theme-accent, #FFEAA7);
      color: var(--theme-text, #2D3436);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .featured-content {
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .post-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .featured-content h3 {
      font-size: 2rem;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    .featured-content h3 a {
      color: var(--theme-text, #2D3436);
      text-decoration: none;
    }

    .featured-content h3 a:hover {
      color: var(--theme-primary, #7FB069);
    }

    .post-excerpt {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .read-more {
      color: var(--theme-primary, #7FB069);
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
    }

    .read-more:hover {
      text-decoration: underline;
    }

    .filter-section {
      margin-bottom: 3rem;
    }

    .filter-tabs {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-tab {
      padding: 0.75rem 1.5rem;
      border: 2px solid var(--theme-primary, #7FB069);
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-radius: 25px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .filter-tab:hover,
    .filter-tab.active {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .blog-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .blog-card:hover {
      transform: translateY(-5px);
    }

    .card-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .blog-card:hover .card-image img {
      transform: scale(1.1);
    }

    .card-overlay {
      position: absolute;
      top: 1rem;
      left: 1rem;
    }

    .card-content {
      padding: 2rem;
    }

    .card-content h3 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .card-content h3 a {
      color: var(--theme-text, #2D3436);
      text-decoration: none;
    }

    .card-content h3 a:hover {
      color: var(--theme-primary, #7FB069);
    }

    .card-content .post-excerpt {
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .post-tags {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .tag {
      background: var(--theme-secondary, #F7E9E3);
      color: var(--theme-text, #2D3436);
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    .page-btn,
    .page-number {
      padding: 0.75rem 1rem;
      border: 2px solid var(--theme-primary, #7FB069);
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .page-btn:hover:not(:disabled),
    .page-number:hover,
    .page-number.active {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.5rem;
    }

    .no-posts {
      text-align: center;
      padding: 4rem 0;
    }

    .no-posts-content h3 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .no-posts-content p {
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
    }

    .newsletter-section {
      background: var(--theme-secondary, #F7E9E3);
      padding: 4rem 0;
    }

    .newsletter-content {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .newsletter-content h2 {
      color: var(--theme-text, #2D3436);
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .newsletter-content p {
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .newsletter-form {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .newsletter-form input {
      flex: 1;
      padding: 1rem;
      border: 2px solid #E0E0E0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .newsletter-form input:focus {
      outline: none;
      border-color: var(--theme-primary, #7FB069);
    }

    .newsletter-note {
      font-size: 0.9rem;
      color: var(--theme-text-secondary, #636E72);
      font-style: italic;
    }

    .btn {
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      display: inline-block;
    }

    .btn-primary {
      background: var(--theme-primary, #7FB069);
      color: white;
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .featured-post {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .featured-content {
        padding: 2rem;
      }

      .featured-content h3 {
        font-size: 1.5rem;
      }

      .filter-tabs {
        justify-content: stretch;
      }

      .filter-tab {
        flex: 1;
        text-align: center;
        min-width: 120px;
      }

      .blog-grid {
        grid-template-columns: 1fr;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
      }

      .newsletter-form {
        flex-direction: column;
      }
    }
  `]
})
export class BlogListComponent implements OnInit {
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);

  allPosts = signal<BlogPost[]>([]);
  filteredPosts = signal<BlogPost[]>([]);
  featuredPost = signal<BlogPost | null>(null);
  selectedCategory = signal('all');
  currentPage = signal(1);
  postsPerPage = 6;

  categories = ['trends', 'venue-spotlight', 'behind-scenes', 'tips', 'seasonal'];

  // Sample blog posts data
  samplePosts: BlogPost[] = [
    {
      id: '1',
      title: 'Spring Wedding Trends 2024: Fresh Ideas for Your Big Day',
      slug: 'spring-wedding-trends-2024',
      excerpt: 'Discover the hottest spring wedding trends for 2024, from garden-inspired florals to sustainable decorations that will make your celebration unforgettable.',
      body: 'Spring weddings are experiencing a renaissance of natural beauty and sustainable practices. This season, couples are embracing garden-inspired aesthetics with wild, organic arrangements that seem to have been picked straight from an English cottage garden...',
      coverImage: '/assets/logo1.jpg',
      tags: ['trends', 'seasonal'],
      featured: true,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: '2',
      title: 'Venue Spotlight: The Magic of Miami Beach Weddings',
      slug: 'venue-spotlight-miami-beach-weddings',
      excerpt: 'Take a behind-the-scenes look at why Miami Beach continues to be one of the most sought-after wedding destinations, and how to make the most of its natural beauty.',
      body: 'Miami Beach offers an unparalleled backdrop for weddings, with its pristine white sands, crystal-clear waters, and Art Deco architecture. When planning a beach wedding, the key is to work with the natural beauty rather than against it...',
      coverImage: '/assets/logo4.jpg',
      tags: ['venue-spotlight'],
      featured: false,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: '3',
      title: 'Behind the Scenes: Creating a Winter Wonderland',
      slug: 'behind-scenes-winter-wonderland',
      excerpt: 'Go behind the scenes of our recent winter wonderland event and discover the creative process, challenges, and magical moments that brought this vision to life.',
      body: 'Creating a winter wonderland in Miami\'s tropical climate requires creativity, planning, and a touch of magic. Our recent holiday event challenged us to transform a warm-weather venue into a snowy paradise...',
      coverImage: '/assets/logo3.jpg',
      tags: ['behind-scenes', 'seasonal'],
      featured: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '4',
      title: '10 Tips for Choosing the Perfect Wedding Flowers',
      slug: 'tips-choosing-perfect-wedding-flowers',
      excerpt: 'Expert advice on selecting flowers that complement your style, venue, and season while staying within budget.',
      body: 'Choosing wedding flowers can feel overwhelming with so many beautiful options available. Here are our top 10 tips to help you make the perfect choice for your special day...',
      coverImage: '/assets/logo3.jpg',
      tags: ['tips'],
      featured: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '5',
      title: 'Corporate Event Florals: Making a Professional Statement',
      slug: 'corporate-event-florals-professional-statement',
      excerpt: 'Learn how the right floral arrangements can elevate your corporate events and create lasting impressions on clients and colleagues.',
      body: 'Corporate events require a different approach to floral design. The arrangements should be sophisticated, professional, and aligned with your brand image while still creating a welcoming atmosphere...',
      coverImage: '/assets/logo2.jpg',
      tags: ['tips'],
      featured: false,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    },
    {
      id: '6',
      title: 'Autumn Color Palettes: Embracing the Season\'s Warmth',
      slug: 'autumn-color-palettes-seasonal-warmth',
      excerpt: 'Explore rich autumn color combinations that will bring warmth and sophistication to your fall celebrations.',
      body: 'Autumn offers some of the most beautiful color palettes in nature. From deep burgundies and warm oranges to golden yellows and rich browns, fall colors create an atmosphere of warmth and abundance...',
      coverImage: '/assets/logo1.jpg',
      tags: ['seasonal', 'trends'],
      featured: false,
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date('2023-12-20')
    }
  ];

  // Computed properties
  totalPages = signal(1);
  paginatedPosts = signal<BlogPost[]>([]);

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.loadBlogPosts();
  }

  private loadBlogPosts(): void {
    this.firestoreService.getBlogPosts().subscribe(posts => {
      this.allPosts.set(posts);
      this.featuredPost.set(posts.find(post => post.featured) || null);
      this.filterPosts('all');
    });
  }

  filterPosts(category: string): void {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    
    if (category === 'all') {
      this.filteredPosts.set(this.allPosts());
    } else {
      this.filteredPosts.set(this.allPosts().filter(post => post.tags.includes(category)));
    }
    
    this.updatePagination();
  }

  private updatePagination(): void {
    const filtered = this.filteredPosts();
    const total = Math.ceil(filtered.length / this.postsPerPage);
    this.totalPages.set(total);
    
    const startIndex = (this.currentPage() - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    this.paginatedPosts.set(filtered.slice(startIndex, endIndex));
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'trends': 'Trends',
      'venue-spotlight': 'Venue Spotlight',
      'behind-scenes': 'Behind the Scenes',
      'tips': 'Tips & Advice',
      'seasonal': 'Seasonal'
    };
    return labels[category] || category;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  subscribeNewsletter(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    
    if (emailInput.value) {
      // In real application, this would send to newsletter service
      alert('Thank you for subscribing! You\'ll receive our latest updates soon.');
      emailInput.value = '';
    }
  }
}