import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Core 5-page public site with prerendering
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
    path: 'contact',
    renderMode: RenderMode.Prerender
  },
  // Legacy dynamic routes with SSR (kept for existing content)
  {
    path: 'services/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'portfolio/:slug',
    renderMode: RenderMode.Server
  },
  // Admin routes should be client-side only
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  // Auth routes should be client-side only
  {
    path: 'auth/**',
    renderMode: RenderMode.Client
  },
  // Debug routes should be client-side only
  {
    path: 'debug/**',
    renderMode: RenderMode.Client
  },
  // Fallback for other routes
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
