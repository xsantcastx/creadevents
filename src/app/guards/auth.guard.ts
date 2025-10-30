import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { SettingsService } from '../services/settings.service';
import { from, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const authService = inject(AuthService);
  const settingsService = inject(SettingsService);

  // Wait for auth state to be determined (prevents flash of login page)
  return authState(auth).pipe(
    take(1),
    switchMap(currentUser => {
      if (!currentUser) {
        router.navigate(['/client/login'], { 
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      }
      
      // Check session timeout
      return from(settingsService.getSettings()).pipe(
        switchMap(async settings => {
          const profile = await authService.getUserProfile(currentUser.uid);
          
          if (!profile) {
            await authService.signOutUser();
            router.navigate(['/client/login'], { 
              queryParams: { returnUrl: state.url }
            });
            return false;
          }
          
          // Check if session has timed out
          if (profile.lastLogin && settings.sessionTimeout > 0) {
            const lastLoginTime = profile.lastLogin instanceof Date 
              ? profile.lastLogin.getTime() 
              : (profile.lastLogin as any).toDate().getTime();
            const sessionTimeoutMs = settings.sessionTimeout * 60000; // Convert minutes to milliseconds
            const timeSinceLogin = Date.now() - lastLoginTime;
            
            if (timeSinceLogin > sessionTimeoutMs) {
              console.log('[AuthGuard] Session timeout exceeded, logging out');
              await authService.signOutUser();
              router.navigate(['/client/login'], { 
                queryParams: { 
                  returnUrl: state.url,
                  sessionExpired: 'true'
                }
              });
              return false;
            }
          }
          
          return true;
        })
      );
    })
  );
};
