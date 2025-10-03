import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static routes with prerendering
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'services',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'portfolio',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'testimonials',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'blog',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contact',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'season/spring',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'season/summer',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'season/autumn',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'season/winter',
    renderMode: RenderMode.Prerender
  },
  // Dynamic routes with SSR instead of prerendering
  {
    path: 'services/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'portfolio/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Server
  },
  // Admin routes should be client-side only
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  // Fallback for other routes
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
