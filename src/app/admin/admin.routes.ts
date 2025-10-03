import { Routes } from '@angular/router';
import { adminGuard } from '../guards/auth.guards';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminGuard],
    title: 'Admin Dashboard - Creation Design & Events'
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
    canActivate: [adminGuard],
    title: 'Analytics Dashboard - Creation Design & Events'
  },
  {
    path: 'images',
    loadComponent: () => import('./image-manager/image-manager.component').then(m => m.ImageManagerComponent),
    canActivate: [adminGuard],
    title: 'Image Manager - Creation Design & Events'
  }
];