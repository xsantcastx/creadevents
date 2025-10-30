import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth, user, authState } from '@angular/fire/auth';
import { map, take, switchMap, filter } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth state to be determined (not null/undefined during initialization)
  return authState(auth).pipe(
    // Wait for at least one emission (auth initialized)
    take(1),
    switchMap(currentUser => {
      if (!currentUser) {
        // Not authenticated - redirect to login
        router.navigate(['/client/login'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      }
      
      // Check if user is admin
      return from(authService.isAdmin(currentUser.uid)).pipe(
        map(isAdmin => {
          if (isAdmin) {
            return true;
          } else {
            // Authenticated but not admin - redirect to home
            router.navigate(['/']);
            return false;
          }
        })
      );
    })
  );
};
