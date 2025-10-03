import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { Season, Project } from '../../../models/data.models';

interface SeasonalContent {
  season: Season;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  palette: string[];
  characteristics: string[];
  inspiration: {
    title: string;
    description: string;
    image: string;
  }[];
  featuredFlowers: string[];
}

@Component({
  selector: 'app-seasonal-page',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="seasonal-page" [attr.data-season]="currentSeason()">
      
      <!-- Hero Section -->
      <section class="hero-section" [style.background-image]="'url(' + seasonalContent()!.heroImage + ')'">
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="season-indicator">{{ currentSeason() | titlecase }} Collection</div>
            <h1 class="hero-title">{{ seasonalContent()!.title }}</h1>
            <p class="hero-subtitle">{{ seasonalContent()!.subtitle }}</p>
            <div class="hero-actions">
              <a routerLink="/contact" class="btn btn-primary">Book This Season's Look</a>
              <a routerLink="/portfolio" class="btn btn-outline">View Gallery</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Season Navigation -->
      <section class="season-nav">
        <div class="container">
          <div class="season-tabs">
            @for (season of allSeasons; track season) {
              <a 
                [routerLink]="['/season', season]" 
                class="season-tab"
                [class.active]="season === currentSeason()">
                <span class="season-icon">{{ getSeasonIcon(season) }}</span>
                <span class="season-name">{{ season | titlecase }}</span>
              </a>
            }
          </div>
        </div>
      </section>

      @if (seasonalContent()) {
        <!-- Seasonal Description -->
        <section class="description-section">
          <div class="container">
            <div class="description-content">
              <h2>{{ seasonalContent()!.season | titlecase }} Aesthetic</h2>
              <p class="lead">{{ seasonalContent()!.description }}</p>
              
              <!-- Color Palette -->
              <div class="color-palette">
                <h3>Signature Color Palette</h3>
                <div class="palette-swatches">
                  @for (color of seasonalContent()!.palette; track color) {
                    <div class="color-swatch" [style.background-color]="color" [title]="color">
                      <span class="color-code">{{ color }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Characteristics -->
              <div class="characteristics">
                <h3>Key Characteristics</h3>
                <div class="characteristics-grid">
                  @for (characteristic of seasonalContent()!.characteristics; track characteristic) {
                    <div class="characteristic-item">
                      <i class="check-icon">✓</i>
                      <span>{{ characteristic }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Featured Flowers -->
        <section class="flowers-section">
          <div class="container">
            <h2>Featured {{ currentSeason() | titlecase }} Flowers</h2>
            <div class="flowers-grid">
              @for (flower of seasonalContent()!.featuredFlowers; track flower) {
                <div class="flower-card">
                  <div class="flower-name">{{ flower }}</div>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Inspiration Gallery -->
        <section class="inspiration-section">
          <div class="container">
            <h2>Design Inspiration</h2>
            <div class="inspiration-grid">
              @for (inspiration of seasonalContent()!.inspiration; track inspiration.title) {
                <div class="inspiration-card">
                  <div class="inspiration-image">
                    <img [src]="inspiration.image" [alt]="inspiration.title" loading="lazy">
                    <div class="inspiration-overlay">
                      <div class="inspiration-content">
                        <h3>{{ inspiration.title }}</h3>
                        <p>{{ inspiration.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Seasonal Projects -->
        <section class="projects-section">
          <div class="container">
            <h2>{{ currentSeason() | titlecase }} Projects</h2>
            @if (seasonalProjects().length > 0) {
              <div class="projects-grid">
                @for (project of seasonalProjects(); track project.id) {
                  <a [routerLink]="['/portfolio', project.slug]" class="project-card">
                    <div class="project-image">
                      <img [src]="project.heroImage" [alt]="project.title" loading="lazy">
                    </div>
                    <div class="project-info">
                      <h3>{{ project.title }}</h3>
                      <p>{{ project.eventType | titlecase }} • {{ project.location }}</p>
                    </div>
                  </a>
                }
              </div>
            } @else {
              <div class="no-projects">
                <p>No {{ currentSeason() }} projects available yet. Check back soon for new inspiring work!</p>
              </div>
            }
          </div>
        </section>

      } @else {
        <div class="loading-state">
          <div class="container">
            <p>Loading seasonal content...</p>
          </div>
        </div>
      }

      <!-- Call to Action -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Embrace {{ currentSeason() | titlecase }}?</h2>
            <p>
              Let us create a {{ currentSeason() }} celebration that captures the essence of the season. 
              Book your consultation today and bring this aesthetic to life.
            </p>
            <div class="cta-actions">
              <a href="tel:7863562958" class="btn btn-primary">Call (786) 356-2958</a>
              <a routerLink="/contact" class="btn btn-outline">Schedule Consultation</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .seasonal-page {
      min-height: 100vh;
      padding-top: 70px;
    }

    .hero-section {
      height: 70vh;
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      position: relative;
      display: flex;
      align-items: center;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        rgba(0,0,0,0.6) 0%,
        rgba(0,0,0,0.3) 50%,
        rgba(0,0,0,0.5) 100%
      );
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-content {
      text-align: center;
      color: white;
      max-width: 800px;
      padding: 0 2rem;
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

    .hero-title {
      font-size: 4rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      line-height: 1.1;
    }

    .hero-subtitle {
      font-size: 1.4rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      opacity: 0.95;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .season-nav {
      background: white;
      padding: 2rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 70px;
      z-index: 100;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .season-tabs {
      display: flex;
      justify-content: center;
      gap: 2rem;
    }

    .season-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      text-decoration: none;
      color: var(--theme-text-secondary, #636E72);
      border-radius: 15px;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .season-tab:hover,
    .season-tab.active {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .season-icon {
      font-size: 2rem;
    }

    .season-name {
      font-weight: 600;
      font-size: 1rem;
    }

    .description-section {
      padding: 4rem 0;
    }

    .description-content h2 {
      color: var(--theme-text, #2D3436);
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .lead {
      font-size: 1.3rem;
      line-height: 1.7;
      color: var(--theme-text-secondary, #636E72);
      text-align: center;
      max-width: 800px;
      margin: 0 auto 3rem;
    }

    .color-palette,
    .characteristics {
      margin-top: 3rem;
    }

    .color-palette h3,
    .characteristics h3 {
      color: var(--theme-text, #2D3436);
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .palette-swatches {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .color-swatch {
      width: 100px;
      height: 100px;
      border-radius: 15px;
      position: relative;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      display: flex;
      align-items: end;
      justify-content: center;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .color-swatch:hover {
      transform: scale(1.05);
    }

    .color-code {
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      font-family: monospace;
      border-radius: 5px 5px 0 0;
    }

    .characteristics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .characteristic-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .check-icon {
      background: var(--theme-primary, #7FB069);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      flex-shrink: 0;
    }

    .flowers-section {
      background: #f8f9fa;
      padding: 4rem 0;
    }

    .flowers-section h2 {
      text-align: center;
      color: var(--theme-text, #2D3436);
      font-size: 2.5rem;
      margin-bottom: 3rem;
    }

    .flowers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .flower-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .flower-card:hover {
      transform: translateY(-5px);
    }

    .flower-name {
      font-weight: 600;
      color: var(--theme-text, #2D3436);
      font-size: 1.1rem;
    }

    .inspiration-section {
      padding: 4rem 0;
    }

    .inspiration-section h2 {
      text-align: center;
      color: var(--theme-text, #2D3436);
      font-size: 2.5rem;
      margin-bottom: 3rem;
    }

    .inspiration-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .inspiration-card {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      transition: transform 0.3s ease;
    }

    .inspiration-card:hover {
      transform: translateY(-8px);
    }

    .inspiration-image {
      position: relative;
      height: 300px;
      overflow: hidden;
    }

    .inspiration-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .inspiration-card:hover .inspiration-image img {
      transform: scale(1.1);
    }

    .inspiration-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: white;
      padding: 2rem;
    }

    .inspiration-content h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }

    .inspiration-content p {
      font-size: 0.9rem;
      opacity: 0.9;
      line-height: 1.5;
    }

    .projects-section {
      background: #f8f9fa;
      padding: 4rem 0;
    }

    .projects-section h2 {
      text-align: center;
      color: var(--theme-text, #2D3436);
      font-size: 2.5rem;
      margin-bottom: 3rem;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .project-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      text-decoration: none;
      transition: transform 0.3s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .project-card:hover {
      transform: translateY(-5px);
    }

    .project-image {
      height: 200px;
      overflow: hidden;
    }

    .project-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .project-card:hover .project-image img {
      transform: scale(1.1);
    }

    .project-info {
      padding: 1.5rem;
    }

    .project-info h3 {
      color: var(--theme-text, #2D3436);
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }

    .project-info p {
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .no-projects {
      text-align: center;
      padding: 3rem;
      color: var(--theme-text-secondary, #636E72);
    }

    .cta-section {
      background: var(--theme-secondary, #F7E9E3);
      padding: 4rem 0;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      color: var(--theme-text, #2D3436);
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.1rem;
      color: var(--theme-text-secondary, #636E72);
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
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

    .btn-outline {
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-color: var(--theme-primary, #7FB069);
    }

    .btn-outline:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .loading-state {
      padding: 4rem 0;
      text-align: center;
      color: var(--theme-text-secondary, #636E72);
    }

    /* Seasonal Themes */
    .seasonal-page[data-season="spring"] {
      --seasonal-primary: #7FB069;
      --seasonal-secondary: #F7E9E3;
      --seasonal-accent: #E8175D;
    }

    .seasonal-page[data-season="summer"] {
      --seasonal-primary: #FF6B6B;
      --seasonal-secondary: #FFF3E0;
      --seasonal-accent: #FFD93D;
    }

    .seasonal-page[data-season="autumn"] {
      --seasonal-primary: #D2691E;
      --seasonal-secondary: #F4E4C1;
      --seasonal-accent: #A0522D;
    }

    .seasonal-page[data-season="winter"] {
      --seasonal-primary: #4A90E2;
      --seasonal-secondary: #F8F9FE;
      --seasonal-accent: #E8F4F8;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .hero-actions .btn {
        width: 100%;
        max-width: 300px;
      }

      .season-tabs {
        flex-wrap: wrap;
        gap: 1rem;
      }

      .season-tab {
        min-width: 100px;
        padding: 0.75rem 1rem;
      }

      .palette-swatches {
        gap: 0.5rem;
      }

      .color-swatch {
        width: 70px;
        height: 70px;
      }

      .characteristics-grid {
        grid-template-columns: 1fr;
      }

      .inspiration-grid,
      .projects-grid {
        grid-template-columns: 1fr;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }

      .cta-actions .btn {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class SeasonalPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);

  currentSeason = signal<Season>('spring');
  seasonalProjects = signal<Project[]>([]);
  
  allSeasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  // Seasonal content data
  seasonalData: { [key in Season]: SeasonalContent } = {
    spring: {
      season: 'spring',
      title: 'Light, Airy Blooms for Fresh Beginnings',
      subtitle: 'Celebrate renewal and growth with delicate pastels, garden roses, and flowing greenery',
      description: 'Spring celebrations embody hope, renewal, and the joy of new beginnings. Our spring aesthetic features soft pastels, delicate blooms, and lush greenery that captures the essence of the season\'s gentle awakening.',
      heroImage: '/assets/logo3.jpg',
      palette: ['#F8BBD9', '#E8175D', '#7FB069', '#F7E9E3', '#474747'],
      characteristics: [
        'Soft pastel color palettes',
        'Delicate and romantic florals',
        'Fresh garden-style arrangements',
        'Light, airy design elements',
        'Natural textures and greenery',
        'Vintage-inspired details'
      ],
      inspiration: [
        {
          title: 'Garden Party Elegance',
          description: 'Whimsical outdoor celebrations with cascading florals and natural beauty',
          image: '/assets/logo3.jpg'
        },
        {
          title: 'Romantic Wedding Ceremonies',
          description: 'Soft pink and white arrangements perfect for intimate spring weddings',
          image: '/assets/logo1.jpg'
        },
        {
          title: 'Fresh Corporate Events',
          description: 'Clean, modern arrangements that bring the outdoors in',
          image: '/assets/ig_17883536292_1336_.jpg'
        }
      ],
      featuredFlowers: [
        'Garden Roses',
        'Peonies',
        'Tulips',
        'Cherry Blossoms',
        'Daffodils',
        'Sweet Peas',
        'Ranunculus',
        'Baby\'s Breath'
      ]
    },
    summer: {
      season: 'summer',
      title: 'Bold Color, Joyful Abundance',
      subtitle: 'Embrace vibrant hues, tropical blooms, and sun-kissed celebrations',
      description: 'Summer events are all about bold, vibrant energy and tropical sophistication. Think bright coral, sunny yellows, and lush tropical foliage that captures the warmth and joy of the season.',
      heroImage: '/assets/logo4.jpg',
      palette: ['#FF6B6B', '#FFD93D', '#4ECDC4', '#45B7D1', '#FFF3E0'],
      characteristics: [
        'Vibrant, energetic color schemes',
        'Tropical and exotic flowers',
        'Bold, statement arrangements',
        'Outdoor and poolside styling',
        'Sun-kissed golden accents',
        'Beach and resort aesthetics'
      ],
      inspiration: [
        {
          title: 'Tropical Paradise Weddings',
          description: 'Vibrant tropical florals perfect for outdoor summer celebrations',
          image: '/assets/logo4.jpg'
        },
        {
          title: 'Poolside Corporate Events',
          description: 'Bright, refreshing arrangements for summer networking events',
          image: '/assets/ig_17883536292_1336_.jpg'
        },
        {
          title: 'Beach House Parties',
          description: 'Coastal-inspired designs with tropical flair',
          image: '/assets/logo1.jpg'
        }
      ],
      featuredFlowers: [
        'Birds of Paradise',
        'Sunflowers',
        'Tropical Hibiscus',
        'Protea',
        'Coral Roses',
        'Ginger Flowers',
        'Anthurium',
        'Marigolds'
      ]
    },
    autumn: {
      season: 'autumn',
      title: 'Textured Warmth, Copper and Amber Tones',
      subtitle: 'Rich, sophisticated palettes with seasonal harvest elements',
      description: 'Autumn celebrations embrace the richness of the harvest season with warm copper, deep burgundy, and golden amber tones. Our autumn designs feature textured elements and seasonal sophistication.',
      heroImage: '/assets/logo1.jpg',
      palette: ['#D2691E', '#A0522D', '#CD853F', '#F4E4C1', '#8B4513'],
      characteristics: [
        'Rich, warm color palettes',
        'Textured and rustic elements',
        'Harvest-inspired designs',
        'Copper and gold accents',
        'Sophisticated earth tones',
        'Cozy, intimate atmospheres'
      ],
      inspiration: [
        {
          title: 'Harvest Celebrations',
          description: 'Rustic elegance with seasonal fruits and rich florals',
          image: '/assets/logo1.jpg'
        },
        {
          title: 'Intimate Fall Weddings',
          description: 'Warm, cozy ceremonies with autumn\'s natural beauty',
          image: '/assets/logo1.jpg'
        },
        {
          title: 'Corporate Galas',
          description: 'Sophisticated autumn styling for formal events',
          image: '/assets/ig_17883536292_1336_.jpg'
        }
      ],
      featuredFlowers: [
        'Chrysanthemums',
        'Burgundy Dahlias',
        'Autumn Roses',
        'Marigolds',
        'Sunflowers',
        'Orange Lilies',
        'Wheat Grass',
        'Persimmon Branches'
      ]
    },
    winter: {
      season: 'winter',
      title: 'Elegant Whites, Evergreens, and Sparkle',
      subtitle: 'Sophisticated winter wonderlands with metallic accents and evergreen elegance',
      description: 'Winter events embrace elegance and sophistication with crisp whites, rich evergreens, and sparkling metallic accents. Our winter designs create magical atmospheres perfect for the season.',
      heroImage: '/assets/logo3.jpg',
      palette: ['#4A90E2', '#E8F4F8', '#C0C0C0', '#F8F9FE', '#2F4F4F'],
      characteristics: [
        'Crisp white and silver palettes',
        'Evergreen and pine elements',
        'Metallic and sparkle accents',
        'Elegant winter sophistication',
        'Cozy indoor atmospheres',
        'Holiday and celebration themes'
      ],
      inspiration: [
        {
          title: 'Winter Wonderland Weddings',
          description: 'Magical white and silver celebrations with evergreen elegance',
          image: '/assets/logo3.jpg'
        },
        {
          title: 'Holiday Corporate Events',
          description: 'Sophisticated seasonal styling for end-of-year celebrations',
          image: '/assets/logo1.jpg'
        },
        {
          title: 'Intimate Winter Gatherings',
          description: 'Cozy, elegant arrangements for family celebrations',
          image: '/assets/logo4.jpg'
        }
      ],
      featuredFlowers: [
        'White Roses',
        'Evergreen Branches',
        'White Orchids',
        'Pine Cones',
        'Silver Dollar Eucalyptus',
        'White Hydrangeas',
        'Holly Berries',
        'Winter Jasmine'
      ]
    }
  };

  seasonalContent = computed(() => {
    return this.seasonalData[this.currentSeason()];
  });

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.loadSeasonFromRoute();
    this.loadSeasonalProjects();
  }

  private loadSeasonFromRoute(): void {
    const seasonParam = this.route.snapshot.paramMap.get('id') as Season;
    if (seasonParam && this.allSeasons.includes(seasonParam)) {
      this.currentSeason.set(seasonParam);
    } else {
      // Default to current season
      this.currentSeason.set(this.getCurrentSeason());
    }
  }

  private getCurrentSeason(): Season {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  private loadSeasonalProjects(): void {
    // Sample seasonal projects - in real app would query Firestore
    const sampleProjects: Project[] = [
      {
        id: '1',
        title: 'Elegant Spring Wedding',
        slug: 'elegant-spring-wedding',
        eventType: 'wedding',
        season: ['spring'],
        palette: ['#F8BBD9', '#E8175D'],
        location: 'Miami Beach, FL',
        date: new Date('2024-04-15'),
        heroImage: '/assets/logo1.jpg',
        gallery: [],
        featured: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Summer Corporate Gala',
        slug: 'summer-corporate-gala',
        eventType: 'corporate',
        season: ['summer'],
        palette: ['#FF6B6B', '#FFD93D'],
        location: 'Downtown Miami, FL',
        date: new Date('2024-07-20'),
        heroImage: '/assets/ig_17883536292_1336_.jpg',
        gallery: [],
        featured: false,
        createdAt: new Date()
      }
    ];

    const seasonalFiltered = sampleProjects.filter(project => 
      project.season.includes(this.currentSeason())
    );
    
    this.seasonalProjects.set(seasonalFiltered);
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