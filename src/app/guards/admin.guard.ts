import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take, switchMap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    switchMap(currentUser => {
      if (!currentUser) {
        router.navigate(['/client/login'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      }
      
      return from(authService.isAdmin(currentUser.uid)).pipe(
        map(isAdmin => {
          if (isAdmin) {
            return true;
          } else {
            router.navigate(['/']);
            return false;
          }
        })
      );
    })
  );
};
