import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';

interface Service {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  features: string[];
  price: string;
  image: string;
  category: 'events' | 'floral' | 'seasonal';
  popular: boolean;
  process?: string[];
  portfolio?: string[];
}

@Component({
  selector: 'app-service-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css']
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seasonalThemeService = inject(SeasonalThemeService);
  
  service: Service | null = null;
  relatedServices: Service[] = [];
  loading: boolean = true;

  // All services data (in a real app, this would come from a service)
  private allServices: Service[] = [
    {
      id: 'wedding-planning',
      title: 'Wedding Planning & Design',
      description: 'Complete wedding planning from intimate ceremonies to grand celebrations. We handle every detail to make your special day perfect.',
      fullDescription: 'Our comprehensive wedding planning service transforms your dream wedding into reality. With over 15 years of experience in Miami, we understand what makes each celebration unique. From the initial consultation to the final send-off, we coordinate every detail with precision and care.',
      features: [
        'Complete wedding planning & coordination',
        'Venue selection & vendor management',
        'Custom floral arrangements & centerpieces',
        'Timeline planning & day-of coordination',
        'Reception setup & breakdown',
        'Emergency support & backup plans',
        'Budget management & cost tracking',
        'Guest accommodation assistance'
      ],
      price: 'Starting at $2,500',
      image: '/assets/logo1.jpg',
      category: 'events',
      popular: true,
      process: [
        'Initial consultation to understand your vision and budget',
        'Venue selection and vendor coordination meetings',
        'Design planning with color schemes and floral arrangements',
        'Timeline creation and guest management',
        'Final walkthrough and day-of coordination',
        'Complete setup, event management, and breakdown'
      ]
    },
    {
      id: 'corporate-events',
      title: 'Corporate Event Planning',
      description: 'Professional corporate events that impress clients and inspire teams. From conferences to holiday parties.',
      fullDescription: 'Elevate your corporate image with professionally planned events that reflect your company\'s values and brand. We specialize in creating memorable experiences that engage your team and impress your clients.',
      features: [
        'Conference & meeting planning',
        'Corporate holiday parties',
        'Product launch events',
        'Team building activities',
        'Professional decor & branding',
        'Audio/visual coordination',
        'Catering management',
        'Registration & check-in services'
      ],
      price: 'Starting at $1,500',
      image: '/assets/logo2.jpg',
      category: 'events',
      popular: false,
      process: [
        'Corporate needs assessment and goal definition',
        'Venue selection and logistics planning',
        'Brand integration and professional styling',
        'Vendor coordination and timeline management',
        'Event execution with professional oversight',
        'Post-event reporting and feedback collection'
      ]
    },
    {
      id: 'floral-arrangements',
      title: 'Custom Floral Arrangements',
      description: 'Beautiful, fresh floral designs for any occasion. From bridal bouquets to corporate displays.',
      fullDescription: 'Our expert floral designers create stunning arrangements that capture the essence of your special moments. Using only the freshest flowers, we craft unique pieces that complement your style and color preferences.',
      features: [
        'Bridal bouquets & boutonnieres',
        'Centerpieces & table arrangements',
        'Ceremony arches & backdrops',
        'Corporate floral displays',
        'Seasonal flower selections',
        'Delivery & setup included',
        'Preservation services available',
        'Custom color matching'
      ],
      price: 'Starting at $75',
      image: '/assets/logo3.jpg',
      category: 'floral',
      popular: true,
      process: [
        'Style consultation and color preference discussion',
        'Fresh flower selection based on season and availability',
        'Custom design creation and approval',
        'Professional arrangement and quality check',
        'Timely delivery and setup at your venue',
        'Optional preservation services for lasting memories'
      ]
    },
    {
      id: 'christmas-decor',
      title: 'Christmas & Holiday Decorating',
      description: 'Transform your space into a winter wonderland with our professional Christmas decorating services.',
      fullDescription: 'Bring the magic of Christmas to your home or business with our comprehensive holiday decorating service. We handle everything from elegant tree decorating to complete venue transformation.',
      features: [
        'Christmas tree decorating',
        'Indoor & outdoor lighting',
        'Garland & wreath installation',
        'Table & mantle styling',
        'Commercial holiday displays',
        'Post-holiday cleanup service',
        'Custom theme development',
        'Storage and organization'
      ],
      price: 'Starting at $300',
      image: '/assets/logo3.jpg',
      category: 'seasonal',
      popular: false,
      process: [
        'Holiday theme consultation and planning',
        'Decoration sourcing and custom piece creation',
        'Professional installation and styling',
        'Lighting setup and testing',
        'Quality inspection and final touches',
        'Complete cleanup and storage services'
      ]
    },
    {
      id: 'party-planning',
      title: 'Birthday & Anniversary Parties',
      description: 'Celebrate life\'s special moments with custom party planning that creates lasting memories.',
      fullDescription: 'From intimate family gatherings to milestone celebrations, we create personalized parties that reflect the guest of honor\'s personality and style preferences.',
      features: [
        'Theme development & styling',
        'Venue decoration & setup',
        'Custom balloon arrangements',
        'Table settings & linens',
        'Entertainment coordination',
        'Photography area setup',
        'Menu planning assistance',
        'Party favor coordination'
      ],
      price: 'Starting at $800',
      image: '/assets/logo1.jpg',
      category: 'events',
      popular: false,
      process: [
        'Personal consultation to understand the celebration vision',
        'Theme development and decoration planning',
        'Venue setup and styling coordination',
        'Entertainment and activity planning',
        'Day-of coordination and management',
        'Cleanup and breakdown services'
      ]
    },
    {
      id: 'seasonal-decor',
      title: 'Seasonal Home Decorating',
      description: 'Refresh your space throughout the year with our seasonal decorating services for every occasion.',
      fullDescription: 'Keep your home beautifully decorated year-round with our seasonal decorating service. We update your decor to match the changing seasons and special occasions.',
      features: [
        'Spring & summer refreshes',
        'Fall & autumn styling',
        'Holiday decorating services',
        'Seasonal floral arrangements',
        'Color palette updates',
        'Storage & organization',
        'Maintenance & refresher visits',
        'Custom seasonal themes'
      ],
      price: 'Starting at $200',
      image: '/assets/logo2.jpg',
      category: 'seasonal',
      popular: false,
      process: [
        'Seasonal planning consultation and calendar creation',
        'Decoration selection and theme development',
        'Professional installation and styling',
        'Maintenance and refresh services',
        'Seasonal transition management',
        'Storage and organization solutions'
      ]
    }
  ];

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    
    this.route.params.subscribe(params => {
      const serviceId = params['id'];
      this.loadService(serviceId);
    });
  }

  private loadService(serviceId: string): void {
    this.loading = true;
    
    // Find the service by ID
    this.service = this.allServices.find(s => s.id === serviceId) || null;
    
    if (this.service) {
      // Load related services (same category, excluding current service)
      this.relatedServices = this.allServices
        .filter(s => s.category === this.service!.category && s.id !== this.service!.id)
        .slice(0, 3);
        
      // If we don't have enough related services, fill with others
      if (this.relatedServices.length < 3) {
        const additional = this.allServices
          .filter(s => s.id !== this.service!.id && !this.relatedServices.includes(s))
          .slice(0, 3 - this.relatedServices.length);
        this.relatedServices = [...this.relatedServices, ...additional];
      }
    }
    
    this.loading = false;
  }
}