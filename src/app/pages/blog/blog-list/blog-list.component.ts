import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { BlogPost } from '../../../models/data.models';

@Component({
  selector: 'app-blog-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
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