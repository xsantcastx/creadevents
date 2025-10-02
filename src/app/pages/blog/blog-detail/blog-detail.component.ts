import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { BlogPost } from '../../../models/data.models';

@Component({
  selector: 'app-blog-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="blog-detail-page">
      @if (blogPost()) {
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-image">
            <img [src]="blogPost()!.coverImage" [alt]="blogPost()!.title" loading="eager">
            <div class="hero-overlay">
              <div class="hero-content">
                <div class="breadcrumb">
                  <a routerLink="/blog">Blog</a>
                  <span class="divider">›</span>
                  <span>{{ blogPost()!.title }}</span>
                </div>
                
                <div class="post-meta">
                  <div class="category-tags">
                    @for (tag of blogPost()!.tags; track tag) {
                      <span class="category-tag">{{ getCategoryLabel(tag) }}</span>
                    }
                  </div>
                  <div class="post-details">
                    <span class="post-date">{{ formatDate(blogPost()!.createdAt!) }}</span>
                    <span class="read-time">{{ getReadTime(blogPost()!.body) }} min read</span>
                  </div>
                </div>
                
                <h1 class="hero-title">{{ blogPost()!.title }}</h1>
                <p class="hero-subtitle">{{ blogPost()!.excerpt }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Article Content -->
        <article class="article-content">
          <div class="container">
            <div class="content-wrapper">
              
              <!-- Main Content -->
              <div class="main-content">
                <div class="article-body" [innerHTML]="getFormattedContent(blogPost()!.body)"></div>
                
                <!-- Social Share -->
                <div class="social-share">
                  <h4>Share this post</h4>
                  <div class="share-buttons">
                    <button (click)="sharePost('facebook')" class="share-btn facebook">
                      📘 Facebook
                    </button>
                    <button (click)="sharePost('twitter')" class="share-btn twitter">
                      🐦 Twitter
                    </button>
                    <button (click)="sharePost('linkedin')" class="share-btn linkedin">
                      💼 LinkedIn
                    </button>
                    <button (click)="sharePost('email')" class="share-btn email">
                      ✉️ Email
                    </button>
                  </div>
                </div>

                <!-- Tags -->
                <div class="post-tags-section">
                  <h4>Tags</h4>
                  <div class="tags-list">
                    @for (tag of blogPost()!.tags; track tag) {
                      <a [routerLink]="['/blog']" [queryParams]="{category: tag}" class="tag-link">
                        {{ getCategoryLabel(tag) }}
                      </a>
                    }
                  </div>
                </div>
              </div>

              <!-- Sidebar -->
              <aside class="sidebar">
                
                <!-- Author Info -->
                <div class="author-card">
                  <div class="author-avatar">
                    <img src="/assets/fb_4888_8929514942_2_48x2_48.jpg" alt="Creation Design & Events Team" loading="lazy">
                  </div>
                  <div class="author-info">
                    <h4>Creation Design & Events</h4>
                    <p>Our passionate team of floral designers and event planners brings over 15 years of experience creating unforgettable celebrations in Miami.</p>
                    <a routerLink="/about" class="author-link">Learn More About Us</a>
                  </div>
                </div>

                <!-- Related Posts -->
                @if (relatedPosts().length > 0) {
                  <div class="related-posts">
                    <h4>Related Posts</h4>
                    <div class="related-list">
                      @for (post of relatedPosts(); track post.id) {
                        <a [routerLink]="['/blog', post.slug]" class="related-post">
                          <div class="related-image">
                            <img [src]="post.coverImage" [alt]="post.title" loading="lazy">
                          </div>
                          <div class="related-content">
                            <h5>{{ post.title }}</h5>
                            <span class="related-date">{{ formatDate(post.createdAt!) }}</span>
                          </div>
                        </a>
                      }
                    </div>
                  </div>
                }

                <!-- Newsletter Signup -->
                <div class="newsletter-card">
                  <h4>Stay Updated</h4>
                  <p>Get the latest floral trends and design tips delivered to your inbox.</p>
                  <form class="newsletter-form" (submit)="subscribeNewsletter($event)">
                    <input 
                      type="email" 
                      placeholder="Your email address"
                      #emailInput
                      required>
                    <button type="submit" class="btn btn-primary">Subscribe</button>
                  </form>
                </div>

                <!-- Contact CTA -->
                <div class="contact-cta">
                  <h4>Inspired by this post?</h4>
                  <p>Let's discuss how we can bring these ideas to life for your next event.</p>
                  <div class="cta-actions">
                    <a href="tel:7863562958" class="btn btn-primary">Call Us</a>
                    <a routerLink="/contact" class="btn btn-outline">Get a Quote</a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </article>

      } @else if (loading()) {
        <div class="loading-state">
          <div class="container">
            <h1>Loading post...</h1>
          </div>
        </div>
      } @else {
        <div class="error-state">
          <div class="container">
            <h1>Post not found</h1>
            <p>The blog post you're looking for doesn't exist or has been removed.</p>
            <a routerLink="/blog" class="btn btn-primary">Back to Blog</a>
          </div>
        </div>
      }

      <!-- Navigation -->
      <section class="post-navigation">
        <div class="container">
          <div class="nav-actions">
            <a routerLink="/blog" class="btn btn-outline">
              ← Back to Blog
            </a>
            @if (nextPost()) {
              <a [routerLink]="['/blog', nextPost()!.slug]" class="btn btn-primary">
                Next Post: {{ nextPost()!.title }} →
              </a>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .blog-detail-page {
      min-height: 100vh;
      padding-top: 70px;
    }

    .hero-section {
      position: relative;
      height: 60vh;
      min-height: 400px;
    }

    .hero-image {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        rgba(0,0,0,0.7) 0%,
        rgba(0,0,0,0.3) 50%,
        rgba(0,0,0,0.5) 100%
      );
      display: flex;
      align-items: flex-end;
    }

    .hero-content {
      color: white;
      padding: 3rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .breadcrumb {
      margin-bottom: 1rem;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .breadcrumb a {
      color: white;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .divider {
      margin: 0 0.5rem;
    }

    .post-meta {
      margin-bottom: 2rem;
    }

    .category-tags {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .category-tag {
      background: var(--theme-accent, #FFEAA7);
      color: var(--theme-text, #2D3436);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .post-details {
      display: flex;
      gap: 2rem;
      font-size: 1rem;
      opacity: 0.9;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      line-height: 1.6;
      opacity: 0.95;
      max-width: 800px;
    }

    .article-content {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .content-wrapper {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 4rem;
      align-items: start;
    }

    .main-content {
      background: white;
      padding: 3rem;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .article-body {
      line-height: 1.8;
      color: var(--theme-text, #2D3436);
      font-size: 1.1rem;
      margin-bottom: 3rem;
    }

    .article-body h2,
    .article-body h3,
    .article-body h4 {
      color: var(--theme-text, #2D3436);
      margin: 2rem 0 1rem 0;
    }

    .article-body h2 {
      font-size: 1.8rem;
      border-bottom: 2px solid var(--theme-primary, #7FB069);
      padding-bottom: 0.5rem;
    }

    .article-body p {
      margin-bottom: 1.5rem;
    }

    .article-body ul,
    .article-body ol {
      margin-bottom: 1.5rem;
      padding-left: 2rem;
    }

    .article-body li {
      margin-bottom: 0.5rem;
    }

    .social-share {
      border-top: 1px solid #E0E0E0;
      padding-top: 2rem;
      margin-bottom: 2rem;
    }

    .social-share h4 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .share-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .share-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .share-btn:hover {
      opacity: 0.8;
    }

    .share-btn.facebook {
      background: #1877F2;
    }

    .share-btn.twitter {
      background: #1DA1F2;
    }

    .share-btn.linkedin {
      background: #0A66C2;
    }

    .share-btn.email {
      background: #6c757d;
    }

    .post-tags-section {
      border-top: 1px solid #E0E0E0;
      padding-top: 2rem;
    }

    .post-tags-section h4 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .tags-list {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag-link {
      background: var(--theme-secondary, #F7E9E3);
      color: var(--theme-text, #2D3436);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }

    .tag-link:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .author-card,
    .related-posts,
    .newsletter-card,
    .contact-cta {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .author-card h4,
    .related-posts h4,
    .newsletter-card h4,
    .contact-cta h4 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }

    .author-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: 1rem;
      border: 3px solid var(--theme-primary, #7FB069);
    }

    .author-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .author-info p {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .author-link {
      color: var(--theme-primary, #7FB069);
      text-decoration: none;
      font-weight: 600;
    }

    .author-link:hover {
      text-decoration: underline;
    }

    .related-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .related-post {
      display: flex;
      gap: 1rem;
      text-decoration: none;
      color: inherit;
      transition: background-color 0.3s ease;
      padding: 0.5rem;
      border-radius: 8px;
    }

    .related-post:hover {
      background: var(--theme-secondary, #F7E9E3);
    }

    .related-image {
      width: 80px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .related-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .related-content h5 {
      color: var(--theme-text, #2D3436);
      font-size: 1rem;
      line-height: 1.4;
      margin-bottom: 0.5rem;
    }

    .related-date {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.8rem;
    }

    .newsletter-card p,
    .contact-cta p {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .newsletter-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .newsletter-form input {
      padding: 0.875rem;
      border: 2px solid #E0E0E0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .newsletter-form input:focus {
      outline: none;
      border-color: var(--theme-primary, #7FB069);
    }

    .cta-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
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

    .btn-outline {
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-outline:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .loading-state,
    .error-state {
      padding: 4rem 0;
      text-align: center;
    }

    .error-state h1 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .error-state p {
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
    }

    .post-navigation {
      background: var(--theme-secondary, #F7E9E3);
      padding: 2rem 0;
    }

    .nav-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }

      .content-wrapper {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .main-content {
        padding: 2rem;
      }

      .post-details {
        flex-direction: column;
        gap: 0.5rem;
      }

      .share-buttons {
        flex-direction: column;
      }

      .nav-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .nav-actions .btn {
        text-align: center;
      }
    }
  `]
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
      coverImage: '/assets/fb_4888_8929514942_2_48x2_48.jpg',
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
      coverImage: '/assets/ig_18_44253247569932.jpg',
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
      coverImage: '/assets/WhatsApp%2_Image%2_2_24-12-19%2_at%2_13.18.18_f31e159.jpg',
      tags: ['behind-scenes', 'seasonal'],
      featured: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    }
  ];

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

    // In real application, would load from Firestore
    const foundPost = this.samplePosts.find(p => p.slug === slug);
    if (foundPost) {
      this.blogPost.set(foundPost);
      this.loadRelatedPosts(foundPost);
      this.loadNextPost(foundPost);
    }
    this.loading.set(false);
  }

  private loadRelatedPosts(currentPost: BlogPost): void {
    const related = this.samplePosts
      .filter(p => p.id !== currentPost.id && 
               p.tags.some(tag => currentPost.tags.includes(tag)))
      .slice(0, 3);
    this.relatedPosts.set(related);
  }

  private loadNextPost(currentPost: BlogPost): void {
    const currentIndex = this.samplePosts.findIndex(p => p.id === currentPost.id);
    if (currentIndex >= 0 && currentIndex < this.samplePosts.length - 1) {
      this.nextPost.set(this.samplePosts[currentIndex + 1]);
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