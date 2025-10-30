import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { map, switchMap, catchError } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

const waitForAuthState = async (auth: Auth): Promise<User | null> => {
  const maybeAuthStateReady = (auth as Auth & { authStateReady?: () => Promise<void> }).authStateReady;

  if (typeof maybeAuthStateReady === 'function') {
    try {
      await maybeAuthStateReady.call(auth);
      return auth.currentUser;
    } catch (error) {
      console.error('[AdminGuard] authStateReady() failed, falling back to listener:', error);
    }
  }

  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (err) => {
        console.error('[AdminGuard] onAuthStateChanged error:', err);
        unsubscribe();
        resolve(null);
      }
    );
  });
};

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);

  const loginUrlTree = router.createUrlTree(['/client/login'], {
    queryParams: { returnUrl: state.url }
  });

  return from(waitForAuthState(auth)).pipe(
    switchMap((currentUser) => {
      if (!currentUser) {
        console.warn('[AdminGuard] No authenticated user; redirecting to login');
        return of(loginUrlTree);
      }

      return from(authService.isAdmin(currentUser.uid)).pipe(
        map((isAdmin) => {
          if (isAdmin) {
            return true;
          }

          console.warn('[AdminGuard] Authenticated user lacks admin role; redirecting to home');
          return router.createUrlTree(['/']);
        }),
        catchError((error) => {
          console.error('[AdminGuard] Error validating admin status:', error);
          return of(loginUrlTree);
        })
      );
    })
  );
};
