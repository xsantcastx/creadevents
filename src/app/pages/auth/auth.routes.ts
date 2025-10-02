import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth.component').then(m => m.AuthComponent),
    title: 'Sign In - Creation Design & Events'
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Access Denied - Creation Design & Events'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];