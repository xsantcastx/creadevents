import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: 'services/:slug',
    loadComponent: () => import('./pages/services/service-detail/service-detail.component').then(m => m.ServiceDetailComponent),
    title: 'Service Details - CreaDEvents'
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio/gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Portfolio & Gallery - CreaDEvents'
  },
  {
    path: 'portfolio/:slug',
    loadComponent: () => import('./pages/portfolio/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    title: 'Project Details - CreaDEvents'
  },
  {
    path: 'season/spring',
    loadComponent: () => import('./pages/seasonal/seasonal-page/seasonal-page.component').then(m => m.SeasonalPageComponent),
    data: { season: 'spring' },
    title: 'Spring Collections - CreaDEvents'
  },
  {
    path: 'season/summer',
    loadComponent: () => import('./pages/seasonal/seasonal-page/seasonal-page.component').then(m => m.SeasonalPageComponent),
    data: { season: 'summer' },
    title: 'Summer Collections - CreaDEvents'
  },
  {
    path: 'season/autumn',
    loadComponent: () => import('./pages/seasonal/seasonal-page/seasonal-page.component').then(m => m.SeasonalPageComponent),
    data: { season: 'autumn' },
    title: 'Autumn Collections - CreaDEvents'
  },
  {
    path: 'season/winter',
    loadComponent: () => import('./pages/seasonal/seasonal-page/seasonal-page.component').then(m => m.SeasonalPageComponent),
    data: { season: 'winter' },
    title: 'Winter Collections - CreaDEvents'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About Us - CreaDEvents'
  },
  {
    path: 'testimonials',
    loadComponent: () => import('./pages/testimonials/testimonials.component').then(m => m.TestimonialsComponent),
    title: 'Client Testimonials - CreaDEvents'
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog-list/blog-list.component').then(m => m.BlogListComponent),
    title: 'Blog & Updates - CreaDEvents'
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    title: 'Blog Post - CreaDEvents'
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact & Inquiry - CreaDEvents'
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent),
    title: 'Search - CreaDEvents'
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
    title: 'Admin Dashboard - CreaDEvents'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes),
    title: 'Authentication - CreaDEvents'
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - CreaDEvents'
  }
];
