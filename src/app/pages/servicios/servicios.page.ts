import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceService, ServiceItem } from '../../services/service.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './servicios.page.html',
  styleUrl: './servicios.page.scss'
})
export class ServiciosPageComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private settingsService = inject(SettingsService);

  sections: ServiceItem[] = [];
  isLoading = true;

  // Hero settings
  heroImage = '/assets/services/hero-services.jpg';
  heroTitle = 'Tailored event design and floral artistry';
  heroSubtitle = 'Full-service planning, luxury florals, and seasonal decor crafted for weddings, brands, private celebrations, and interiors.';

  private fallback: ServiceItem[] = [
    {
      anchor: 'event-planning',
      title: 'Full-Service Event Planning',
      subtitle: 'Private celebrations, destination events, and milestone moments.',
      description: 'End-to-end coordination that blends logistics with design: venue scouting, timelines, production, vendor orchestration, and VIP guest experience.',
      image: '/assets/services/event-planning.jpg',
      bullets: [
        'Concept-to-execution planning with on-site production',
        'Venue scouting, layouts, and run-of-show',
        'Catering, entertainment, AV, rentals, and transport'
      ],
      ctaLabel: 'Plan my event',
      ctaHref: '/contacto',
      order: 1
    },
    {
      anchor: 'weddings',
      title: 'Weddings & Social Experiences',
      subtitle: 'Ceremonies and receptions layered with romance and detail.',
      description: 'From floral artistry to guest journey, we craft an atmosphere that feels personal—aisle florals, statement backdrops, and curated tablescapes.',
      image: '/assets/services/weddings.jpg',
      bullets: [
        'Custom floral design and bridal party florals',
        'Ceremony arches, chuppahs, and photo-worthy moments',
        'Day-of coordination and trusted vendor partnerships'
      ],
      ctaLabel: 'Design my wedding',
      ctaHref: '/contacto',
      order: 2
    },
    {
      anchor: 'corporate',
      title: 'Corporate & Brand Events',
      subtitle: 'Polished experiences for launches, galas, and conferences.',
      description: 'We translate brand DNA into environment design: stage sets, branded touchpoints, premium lounges, and hospitality for executives and VIPs.',
      image: '/assets/services/corporate.jpg',
      bullets: [
        'Brand-aligned decor and signage moments',
        'Executive hospitality and greenroom styling',
        'Gala florals, centerpieces, and stage decor'
      ],
      ctaLabel: 'Book a discovery call',
      ctaHref: '/contacto',
      order: 3
    },
    {
      anchor: 'floral',
      title: 'Luxury Floral Design',
      subtitle: 'Signature arrangements that feel sculptural and intentional.',
      description: 'From weekly florals to grand installations, we source premium stems and design in-house to suit homes, venues, and corporate spaces.',
      image: '/assets/services/floral.jpg',
      bullets: [
        'Signature arrangements and centerpieces',
        'Orchid compositions and statement entry pieces',
        'Weekly refresh programs for residences and venues'
      ],
      ctaLabel: 'Request floral design',
      ctaHref: '/contacto',
      order: 4
    },
    {
      anchor: 'seasonal',
      title: 'Seasonal & Holiday Decor',
      subtitle: 'Immersive festive scenes for lobbies, homes, yachts, and venues.',
      description: 'Trees, garlands, and tablescapes built with refined palettes, premium ornaments, and elevated lighting for a warm, polished feel.',
      image: '/assets/services/seasonal.jpg',
      bullets: [
        'Tree design, installation, and takedown',
        'Lobby and storefront festive styling',
        'Holiday tablescapes and bar styling'
      ],
      ctaLabel: 'Schedule a holiday install',
      ctaHref: '/contacto',
      order: 5
    },
    {
      anchor: 'plants',
      title: 'Interior Plant & Orchid Styling',
      subtitle: 'Long-lasting botanicals tailored to architecture and light.',
      description: 'We curate vessels, install plant programs, and maintain orchids for residences, yachts, hotels, and corporate environments.',
      image: '/assets/services/plants.jpg',
      bullets: [
        'Orchid rotations and centerpiece programs',
        'Planter curation that matches your interiors',
        'Ongoing care and refresh services available'
      ],
      ctaLabel: 'Start a plant program',
      ctaHref: '/contacto',
      order: 6
    }
  ];

  ngOnInit(): void {
    this.loadHeroSettings();
    this.serviceService.getServices().subscribe({
      next: (items) => {
        this.isLoading = false;
        if (items?.length) {
          this.sections = items
            .map(i => ({ ...i, anchor: i.anchor || i.id }))
            .sort((a, b) => (a.order || 999) - (b.order || 999));
        } else {
          this.sections = this.fallback;
        }
      },
      error: (err) => {
        console.error('Failed to load services', err);
        this.sections = this.fallback;
        this.isLoading = false;
      }
    });
  }

  private async loadHeroSettings() {
    try {
      const settings = await this.settingsService.getSettings();
      this.heroImage = settings.serviciosHeroImage || this.heroImage;
      this.heroTitle = settings.serviciosHeroTitle || this.heroTitle;
      this.heroSubtitle = settings.serviciosHeroSubtitle || this.heroSubtitle;
    } catch (error) {
      console.error('[Servicios] Error loading hero settings:', error);
    }
  }
}
