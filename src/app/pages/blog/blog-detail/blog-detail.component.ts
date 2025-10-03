import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { BlogPost } from '../../../models/data.models';

@Component({
  selector: 'app-blog-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);

  blogPost = signal<BlogPost | null>(null);
  relatedPosts = signal<BlogPost[]>([]);
  nextPost = signal<BlogPost | null>(null);
  loading = signal(true);

  // Sample blog posts (same as in blog-list component)
  samplePosts: BlogPost[] = [
    {
      id: '1',
      title: 'Spring Wedding Trends 2024: Fresh Ideas for Your Big Day',
      slug: 'spring-wedding-trends-2024',
      excerpt: 'Discover the hottest spring wedding trends for 2024, from garden-inspired florals to sustainable decorations that will make your celebration unforgettable.',
      body: 'Spring weddings are experiencing a renaissance of natural beauty and sustainable practices. This season, couples are embracing garden-inspired aesthetics with wild, organic arrangements that seem to have been picked straight from an English cottage garden.\n\nThe trend towards sustainability is reshaping how we think about wedding florals. Couples are choosing locally-sourced blooms, potted plants that guests can take home, and arrangements that can be repurposed after the ceremony. This not only reduces environmental impact but often creates more meaningful, personal touches.\n\nColor palettes are softer and more nuanced than ever before. Gone are the stark contrasts of previous years, replaced by gentle gradients of blush, sage, and cream. These understated combinations create an atmosphere of refined elegance that photographs beautifully in natural light.\n\nTexture plays a crucial role in modern spring arrangements. We\'re seeing combinations of delicate flowers with unexpected elements like wheat grass, eucalyptus, and even herbs like rosemary and lavender that add both visual interest and wonderful fragrance.\n\nVenue choices are also evolving, with many couples opting for garden settings, greenhouses, and outdoor spaces that complement rather than compete with their floral designs. The key is creating harmony between the natural environment and your carefully curated arrangements.',
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
      body: 'Miami Beach offers an unparalleled backdrop for weddings, with its pristine white sands, crystal-clear waters, and Art Deco architecture. When planning a beach wedding, the key is to work with the natural beauty rather than against it.\n\nThe golden hour lighting on Miami Beach is legendary among photographers, creating a warm, romantic glow that makes every moment feel magical. This natural lighting means your floral arrangements should complement rather than compete with the stunning natural backdrop.\n\nWind is always a consideration for beach ceremonies. We recommend sturdy arrangements with low profiles and flowers that can withstand gentle breezes. Tropical blooms like birds of paradise and orchids are not only appropriate for the setting but also naturally resilient.\n\nColor choices should reflect the oceanic setting. Coral, turquoise, and sandy beige create a cohesive palette that feels authentic to the location. White arrangements pop beautifully against the blue sky and ocean backdrop.',
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
      body: 'Creating a winter wonderland in Miami\'s tropical climate requires creativity, planning, and a touch of magic. Our recent holiday event challenged us to transform a warm-weather venue into a snowy paradise.\n\nThe project began with extensive mood boarding and color palette development. We chose a sophisticated combination of silver, white, and deep forest green to create depth and elegance. The challenge was creating \'snow\' effects that would look authentic under Miami\'s bright lights.\n\nWe used a combination of white florals, silver branches, and specialized lighting to create the illusion of a winter landscape. Strings of white lights mimicked falling snow, while white orchids and silver-painted branches created the feeling of frost-covered trees.\n\nThe most challenging aspect was temperature control. Many winter flowers don\'t thrive in Miami\'s heat, so we had to carefully time deliveries and installations to ensure everything looked perfect for the event.',
      coverImage: '/assets/logo3.jpg',
      tags: ['behind-scenes', 'seasonal'],
      featured: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    }
  ];

  allPosts: BlogPost[] = [];

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.loadBlogPost();
  }

  private loadBlogPost(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading.set(false);
      return;
    }

    this.firestoreService.getBlogPosts().subscribe(posts => {
      this.allPosts = posts;
      const foundPost = posts.find(p => p.slug === slug);
      
      if (foundPost) {
        this.blogPost.set(foundPost);
        this.loadRelatedPosts(foundPost);
        this.loadNextPost(foundPost);
      }
      this.loading.set(false);
    });
  }

  private loadRelatedPosts(currentPost: BlogPost): void {
    const related = this.allPosts
      .filter(p => p.id !== currentPost.id && 
               p.tags.some(tag => currentPost.tags.includes(tag)))
      .slice(0, 3);
    this.relatedPosts.set(related);
  }

  private loadNextPost(currentPost: BlogPost): void {
    const currentIndex = this.allPosts.findIndex(p => p.id === currentPost.id);
    if (currentIndex >= 0 && currentIndex < this.allPosts.length - 1) {
      this.nextPost.set(this.allPosts[currentIndex + 1]);
    }
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

  getFormattedContent(content: string): string {
    // Convert line breaks to paragraphs
    return content
      .split('\n\n')
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  }

  sharePost(platform: string): void {
    const post = this.blogPost();
    if (!post) return;

    const url = window.location.href;
    const title = post.title;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
    }
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