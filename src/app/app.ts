import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private translate = inject(TranslateService);

  ngOnInit() {
    // Set language
    this.translate.use('es');
    
    // Initialize page view tracking on route changes
    this.analyticsService.initPageViewTracking();
  }
}
