import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  } else if (authService.isAuthenticated()) {
    router.navigate(['/auth/unauthorized']);
    return false;
  } else {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

export const editorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && (authService.isAdmin() || authService.isEditor())) {
    return true;
  } else if (authService.isAuthenticated()) {
    router.navigate(['/auth/unauthorized']);
    return false;
  } else {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

export const contentManagerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.canManageContent()) {
    return true;
  } else if (authService.isAuthenticated()) {
    router.navigate(['/auth/unauthorized']);
    return false;
  } else {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};