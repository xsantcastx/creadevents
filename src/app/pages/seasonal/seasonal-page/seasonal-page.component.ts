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
  templateUrl: './seasonal-page.component.html',
  styleUrls: ['./seasonal-page.component.css']
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