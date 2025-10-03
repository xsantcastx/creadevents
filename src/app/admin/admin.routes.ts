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
    loadComponent: () => import('./images-dashboard/images-dashboard.component').then(m => m.ImagesDashboardComponent),
    canActivate: [adminGuard],
    title: 'Images Dashboard - Creation Design & Events'
  },
  {
    path: 'slots',
    loadComponent: () => import('./slot-manager/slot-manager.component').then(m => m.SlotManagerComponent),
    canActivate: [adminGuard],
    title: 'Slot Manager - Creation Design & Events'
  }
];