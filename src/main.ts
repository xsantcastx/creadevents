import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { inject } from '@angular/core';
import { AuthService } from './app/services/auth.service';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    // Expose admin setup command globally for development
    if (typeof window !== 'undefined') {
      (window as any).makeAdmin = async () => {
        const authService = appRef.injector.get(AuthService);
        try {
          await authService.makeCurrentUserAdmin();
        } catch (error) {
          console.error('Failed to make user admin:', error);
        }
      };
      
      console.log('🔧 Development command available: makeAdmin()');
    }
  })
  .catch((err) => console.error(err));
