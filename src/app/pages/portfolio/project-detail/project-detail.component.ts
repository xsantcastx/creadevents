import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { SeasonalThemeService } from '../../../services/seasonal-theme.service';
import { FirestoreService } from '../../../services/firestore.service';
import { Project, Testimonial } from '../../../models/data.models';

@Component({
  selector: 'app-project-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seasonalThemeService = inject(SeasonalThemeService);
  private firestoreService = inject(FirestoreService);

  project = signal<Project | null>(null);
  projectTestimonial = signal<Testimonial | null>(null);
  relatedProjects = signal<Project[]>([]);
  loading = signal(true);
  lightboxOpen = signal(false);
  currentImageIndex = signal(0);

  allProjects: Project[] = [];

  ngOnInit(): void {
    this.seasonalThemeService.applyThemeToDocument();
    this.loadProject();
  }

  private loadProject(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading.set(false);
      return;
    }

    // Load all projects first to find by slug and get related projects
    this.firestoreService.getProjects().subscribe(projects => {
      this.allProjects = projects;
      const foundProject = projects.find(p => p.slug === slug);
      
      if (foundProject) {
        this.project.set(foundProject);
        if (foundProject.testimonialRef) {
          this.loadTestimonial(foundProject.testimonialRef);
        }
        this.loadRelatedProjects(foundProject);
      }
      this.loading.set(false);
    });
  }

  private loadTestimonial(testimonialRef?: string): void {
    if (!testimonialRef) return;

    this.firestoreService.getTestimonials().subscribe(testimonials => {
      const testimonial = testimonials.find(t => t.id === testimonialRef);
      if (testimonial) {
        this.projectTestimonial.set(testimonial);
      }
    });
  }

  private loadRelatedProjects(currentProject?: Project | null): void {
    if (!currentProject) return;

    // Filter related projects from Firebase data
    const related = this.allProjects
      .filter(p => p.id !== currentProject.id && p.eventType === currentProject.eventType)
      .slice(0, 3);
    
    this.relatedProjects.set(related);
  }

  getEventTypeLabel(eventType: string): string {
    const labels: { [key: string]: string } = {
      'wedding': 'Wedding',
      'corporate': 'Corporate Event',
      'private-party': 'Private Party',
      'installation': 'Installation',
      'funeral': 'Memorial Service',
      'celebration-of-life': 'Celebration of Life',
      'other': 'Special Event'
    };
    return labels[eventType] || eventType;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  openLightbox(index: number): void {
    this.currentImageIndex.set(index);
    this.lightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  previousImage(): void {
    const current = this.currentImageIndex();
    if (current > 0) {
      this.currentImageIndex.set(current - 1);
    }
  }

  nextImage(): void {
    const current = this.currentImageIndex();
    const project = this.project();
    if (project && current < project.gallery.length - 1) {
      this.currentImageIndex.set(current + 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/portfolio']);
  }

  shareProject(platform: string): void {
    const project = this.project();
    if (!project) return;

    const url = window.location.href;
    const title = `Check out this beautiful ${this.getEventTypeLabel(project.eventType).toLowerCase()}: ${project.title}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
    }
  }
}