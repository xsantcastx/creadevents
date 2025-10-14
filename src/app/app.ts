import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // Set language from localStorage or default to English (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('selectedLanguage') || 'en';
      this.translate.setDefaultLang('en');
      this.translate.use(savedLang);
    } else {
      // Server-side: just use default English
      this.translate.setDefaultLang('en');
      this.translate.use('en');
    }
    
    // Initialize page view tracking on route changes
    this.analyticsService.initPageViewTracking();
  }
}
