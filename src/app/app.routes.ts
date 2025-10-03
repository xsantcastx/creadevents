import { Routes } from '@angular/router';

export const routes: Routes = [
  // Core 5-page public site
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'CreaDEvents - Floral Design & Event Decorations'
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services-list/services-list.component').then(m => m.ServicesListComponent),
    title: 'Our Services - CreaDEvents'
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio/gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Portfolio & Gallery - CreaDEvents'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About Us - CreaDEvents'
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact & Inquiry - CreaDEvents'
  },

  // Admin area (hidden from public nav, accessible via direct URL)
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
    title: 'Admin Dashboard - CreaDEvents'
  },

  // Auth routes (for admin access)
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes),
    title: 'Authentication - CreaDEvents'
  },

  // Legacy routes for existing content (can be removed later)
  {
    path: 'services/:slug',
    loadComponent: () => import('./pages/services/service-detail/service-detail.component').then(m => m.ServiceDetailComponent),
    title: 'Service Details - CreaDEvents'
  },
  {
    path: 'portfolio/:slug',
    loadComponent: () => import('./pages/portfolio/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    title: 'Project Details - CreaDEvents'
  },

  // Development/debug (can be removed in production)
  {
    path: 'debug/auth',
    loadComponent: () => import('./debug/auth-debug.component').then(m => m.AuthDebugComponent),
    title: 'Auth Debug - CreaDEvents'
  },

  // 404 fallback
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - CreaDEvents'
  }
];
