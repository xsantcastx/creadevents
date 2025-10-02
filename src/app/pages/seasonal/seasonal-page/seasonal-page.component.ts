import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { Season } from '../../../models/data.models';

interface SeasonalContent {
  season: Season;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  inspirations: Array<{
    title: string;
    description: string;
    image: string;
  }>;
  flowers: Array<{
    name: string;
    description: string;
    image: string;
  }>;
}

@Component({
  selector: 'app-seasonal-page',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="seasonal-page">
      @if (seasonalContent()) {
        <!-- Hero Section -->
        <section class="hero-section" [style.background-image]="'url(' + seasonalContent()!.heroImage + ')'">
          <div class="hero-overlay">
            <div class="hero-content">
              <div class="season-indicator">
                {{ getSeasonIcon(seasonalContent()!.season) }} {{ seasonalContent()!.season | titlecase }} Collection
              </div>
              <h1 class="hero-title">{{ seasonalContent()!.title }}</h1>
              <p class="hero-subtitle">{{ seasonalContent()!.subtitle }}</p>
              <a routerLink="/contact" class="cta-button">Start Planning</a>
            </div>
          </div>
        </section>

        <!-- Inspiration Section -->
        <section class="section inspiration-section">
          <div class="container">
            <h2>{{ seasonalContent()!.season | titlecase }} Inspiration</h2>
            <div class="content-grid">
              @for (inspiration of seasonalContent()!.inspirations; track inspiration.title) {
                <div class="content-card">
                  <div class="inspiration-image">
                    <img [src]="inspiration.image" [alt]="inspiration.title" loading="lazy">
                  </div>
                  <div class="card-content">
                    <h3 class="card-title">{{ inspiration.title }}</h3>
                    <p class="card-description">{{ inspiration.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Featured Flowers -->
        <section class="section flowers-section">
          <div class="container">
            <h2>Featured {{ seasonalContent()!.season | titlecase }} Flowers</h2>
            <div class="flower-grid">
              @for (flower of seasonalContent()!.flowers; track flower.name) {
                <div class="flower-card">
                  <div class="flower-image">
                    <img [src]="flower.image" [alt]="flower.name" loading="lazy">
                  </div>
                  <h3 class="flower-name">{{ flower.name }}</h3>
                  <p class="flower-description">{{ flower.description }}</p>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Call to Action -->
        <section class="cta-section section">
          <div class="container">
            <div class="cta-content">
              <h2>Ready to Create Your {{ seasonalContent()!.season | titlecase }} Event?</h2>
              <p class="cta-description">{{ seasonalContent()!.description }}</p>
              <div class="cta-buttons">
                <a routerLink="/contact" class="cta-button">Get a Quote</a>
                <a routerLink="/portfolio" class="cta-button">View Portfolio</a>
              </div>
            </div>
          </div>
        </section>
      } @else {
        <div class="loading-state">
          <div class="container">
            <p>Loading seasonal content...</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .seasonal-page {
      min-height: 100vh;
      padding-top: 70px;
    }

    .season-indicator {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 0.5rem 1.5rem;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      display: inline-block;
    }

    .inspiration-section {
      background: var(--theme-secondary, #F7E9E3);
    }

    .flowers-section {
      background: white;
    }

    .cta-section {
      background: linear-gradient(135deg, var(--theme-primary, #7FB069) 0%, var(--theme-accent, #FFEAA7) 100%);
      color: white;
      text-align: center;
    }

    .cta-section h2 {
      color: white;
    }

    .flower-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .flower-card {
      text-align: center;
      padding: 1.5rem;
    }

    .flower-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1rem auto;
      overflow: hidden;
      border: 3px solid var(--theme-primary, #7FB069);
    }

    .flower-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .flower-name {
      font-weight: 600;
      color: var(--theme-text, #2D3436);
      margin-bottom: 0.5rem;
    }

    .flower-description {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .card-content {
      padding: 1.5rem;
    }

    .card-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--theme-text, #2D3436);
      margin-bottom: 0.75rem;
    }

    .card-description {
      color: var(--theme-text-secondary, #636E72);
      line-height: 1.6;
    }

    .cta-content {
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-description {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .loading-state {
      padding: 4rem 0;
      text-align: center;
    }

    @media (max-width: 768px) {
      .flower-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .flower-image {
        width: 80px;
        height: 80px;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class SeasonalPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seasonalThemeService = inject(SeasonalThemeService);

  seasonalContent = signal<SeasonalContent | null>(null);

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.loadSeasonalContent();
  }

  private loadSeasonalContent(): void {
    const season = this.route.snapshot.data['season'] as Season;
    
    const content: SeasonalContent = {
      season: season,
      title: this.getSeasonTitle(season),
      subtitle: this.getSeasonSubtitle(season),
      description: this.getSeasonDescription(season),
      heroImage: this.getSeasonImage(season),
      inspirations: this.getSeasonInspirations(season),
      flowers: this.getSeasonFlowers(season)
    };

    this.seasonalContent.set(content);
  }

  private getSeasonTitle(season: Season): string {
    const titles = {
      spring: 'Fresh Beginnings',
      summer: 'Vibrant Celebrations',
      autumn: 'Warm Gatherings',
      winter: 'Elegant Sophistication'
    };
    return titles[season];
  }

  private getSeasonSubtitle(season: Season): string {
    const subtitles = {
      spring: 'Soft pastels and garden-fresh arrangements for new beginnings',
      summer: 'Bold colors and tropical blooms for joyful celebrations',
      autumn: 'Rich textures and warm tones for cozy gatherings',
      winter: 'Elegant whites and evergreens for sophisticated events'
    };
    return subtitles[season];
  }

  private getSeasonDescription(season: Season): string {
    const descriptions = {
      spring: 'Let us bring the beauty of spring to your special event with fresh, garden-inspired florals.',
      summer: 'Create unforgettable summer memories with vibrant, tropical-inspired designs.',
      autumn: 'Celebrate the season with rich, textured arrangements that capture autumn\'s warmth.',
      winter: 'Add elegance to your winter event with sophisticated, timeless floral designs.'
    };
    return descriptions[season];
  }

  private getSeasonImage(season: Season): string {
    const images = {
      spring: '/assets/logo1.jpg',
      summer: '/assets/lgoo2.jpg',
      autumn: '/assets/logo3.jpg',
      winter: '/assets/logo4.jpg'
    };
    return images[season];
  }

  private getSeasonInspirations(season: Season): Array<{title: string; description: string; image: string}> {
    const inspirations = {
      spring: [
        {
          title: 'Garden Party Elegance',
          description: 'Soft pastels and natural textures create a romantic garden atmosphere.',
          image: '/assets/logo1.jpg'
        },
        {
          title: 'Fresh & Modern',
          description: 'Clean lines with pops of spring color for contemporary celebrations.',
          image: '/assets/lgoo2.jpg'
        },
        {
          title: 'Rustic Romance',
          description: 'Wildflower arrangements with vintage touches for outdoor weddings.',
          image: '/assets/logo3.jpg'
        }
      ],
      summer: [
        {
          title: 'Tropical Paradise',
          description: 'Bold tropical blooms and lush greenery for beach celebrations.',
          image: '/assets/lgoo2.jpg'
        },
        {
          title: 'Sunset Vibes',
          description: 'Warm oranges and pinks capture the magic of summer sunsets.',
          image: '/assets/logo3.jpg'
        },
        {
          title: 'Garden Abundance',
          description: 'Overflowing arrangements celebrate summer\'s bounty.',
          image: '/assets/logo4.jpg'
        }
      ],
      autumn: [
        {
          title: 'Harvest Celebration',
          description: 'Rich burgundy and gold tones with seasonal textures.',
          image: '/assets/logo3.jpg'
        },
        {
          title: 'Woodland Wonder',
          description: 'Natural elements and warm lighting for cozy gatherings.',
          image: '/assets/logo4.jpg'
        },
        {
          title: 'Elegant Autumn',
          description: 'Sophisticated color palettes for formal fall events.',
          image: '/assets/logo1.jpg'
        }
      ],
      winter: [
        {
          title: 'Winter Wonderland',
          description: 'Elegant whites and silvers with touches of evergreen.',
          image: '/assets/logo4.jpg'
        },
        {
          title: 'Holiday Elegance',
          description: 'Classic red and gold arrangements for festive celebrations.',
          image: '/assets/logo1.jpg'
        },
        {
          title: 'Minimalist Winter',
          description: 'Clean, modern designs with winter branches and whites.',
          image: '/assets/lgoo2.jpg'
        }
      ]
    };
    return inspirations[season];
  }

  private getSeasonFlowers(season: Season): Array<{name: string; description: string; image: string}> {
    const flowers = {
      spring: [
        { name: 'Tulips', description: 'Classic spring blooms in soft pastels', image: '/assets/logo1.jpg' },
        { name: 'Daffodils', description: 'Bright yellow symbols of new beginnings', image: '/assets/lgoo2.jpg' },
        { name: 'Cherry Blossoms', description: 'Delicate pink petals for romantic touches', image: '/assets/logo3.jpg' },
        { name: 'Hyacinths', description: 'Fragrant spikes in spring colors', image: '/assets/logo4.jpg' }
      ],
      summer: [
        { name: 'Sunflowers', description: 'Bold and cheerful summer classics', image: '/assets/lgoo2.jpg' },
        { name: 'Dahlias', description: 'Full blooms in vibrant summer hues', image: '/assets/logo3.jpg' },
        { name: 'Zinnias', description: 'Colorful and long-lasting summer favorites', image: '/assets/logo4.jpg' },
        { name: 'Marigolds', description: 'Warm orange and yellow summer blooms', image: '/assets/logo1.jpg' }
      ],
      autumn: [
        { name: 'Chrysanthemums', description: 'Classic fall blooms in warm tones', image: '/assets/logo3.jpg' },
        { name: 'Asters', description: 'Purple and white autumn stars', image: '/assets/logo4.jpg' },
        { name: 'Celosia', description: 'Textured blooms in rich autumn colors', image: '/assets/logo1.jpg' },
        { name: 'Ornamental Kale', description: 'Unique foliage in purple and cream', image: '/assets/lgoo2.jpg' }
      ],
      winter: [
        { name: 'Poinsettias', description: 'Classic holiday blooms in red and white', image: '/assets/logo4.jpg' },
        { name: 'Amaryllis', description: 'Elegant trumpet-shaped winter blooms', image: '/assets/logo1.jpg' },
        { name: 'Holly', description: 'Traditional evergreen with bright red berries', image: '/assets/lgoo2.jpg' },
        { name: 'White Roses', description: 'Timeless elegance for winter celebrations', image: '/assets/logo3.jpg' }
      ]
    };
    return flowers[season];
  }

  getSeasonIcon(season: Season): string {
    const icons = {
      spring: '🌸',
      summer: '☀️',
      autumn: '🍂',
      winter: '❄️'
    };
    return icons[season];
  }
}