import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private readonly MAINTENANCE_KEY = 'maintenance_mode';
  private maintenanceMode$ = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    // Check if maintenance mode is enabled on service init
    this.checkMaintenanceMode();
  }

  /**
   * Check if maintenance mode is currently enabled
   */
  private checkMaintenanceMode(): void {
    if (typeof window !== 'undefined') {
      const isEnabled = localStorage.getItem(this.MAINTENANCE_KEY) === 'true';
      this.maintenanceMode$.next(isEnabled);
    }
  }

  /**
   * Enable maintenance mode
   */
  enableMaintenanceMode(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.MAINTENANCE_KEY, 'true');
      this.maintenanceMode$.next(true);
      this.router.navigate(['/maintenance']);
    }
  }

  /**
   * Disable maintenance mode
   */
  disableMaintenanceMode(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.MAINTENANCE_KEY);
      this.maintenanceMode$.next(false);
      this.router.navigate(['/']);
    }
  }

  /**
   * Check if maintenance mode is active
   */
  isMaintenanceModeActive(): boolean {
    return this.maintenanceMode$.value;
  }

  /**
   * Get maintenance mode observable
   */
  getMaintenanceModeObservable(): Observable<boolean> {
    return this.maintenanceMode$.asObservable();
  }

  /**
   * Check if current route should be allowed during maintenance
   * (e.g., admin routes should still work)
   */
  isRouteAllowedDuringMaintenance(url: string): boolean {
    const allowedRoutes = [
      '/maintenance',
      '/admin',
      '/client/login'
    ];
    
    return allowedRoutes.some(route => url.startsWith(route));
  }
}
