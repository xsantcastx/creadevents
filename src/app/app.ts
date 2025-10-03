import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './components/site-header/site-header.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { AdminToolbarComponent } from './shared/admin-toolbar/admin-toolbar.component';
import { NotificationsComponent } from './shared/notifications/notifications.component';
import { AnalyticsTrackingService } from './services/analytics-tracking.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent, AdminToolbarComponent, NotificationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('creadevents');
  private analyticsTracking = inject(AnalyticsTrackingService);

  ngOnInit(): void {
    // Analytics tracking is automatically initialized through service injection
    console.log('CreaDEvents application initialized with analytics tracking');
  }
}
