import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './shared/navigation/navigation.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AnalyticsTrackingService } from './services/analytics-tracking.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, FooterComponent],
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
