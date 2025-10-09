import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Analytics, logEvent, setUserProperties, setUserId } from '@angular/fire/analytics';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private analytics?: Analytics;
  
  constructor() {
    // Only initialize Analytics in production and browser
    if (environment.production && isPlatformBrowser(this.platformId)) {
      try {
        // Inject Analytics during construction (inside injection context)
        this.analytics = inject(Analytics);
      } catch (error) {
        console.warn('Analytics not available:', error);
      }
    }
  }

  /**
   * Initialize page view tracking on route changes
   */
  initPageViewTracking() {
    if (!this.analytics || !isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Track page view
   */
  trackPageView(path: string) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'page_view', {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  /**
   * Track contact form submission (lead generation)
   */
  trackContactSubmit(method: 'form' | 'whatsapp' | 'email', additionalData?: any) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'generate_lead', {
        method,
        page_location: window.location.href,
        ...additionalData
      });
    } catch (error) {
      console.error('Error tracking contact submit:', error);
    }
  }

  /**
   * Track product/gallery item click
   */
  trackProductClick(productName: string, category?: string) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'select_content', {
        content_type: 'product',
        item_id: productName,
        item_category: category
      });
    } catch (error) {
      console.error('Error tracking product click:', error);
    }
  }

  /**
   * Track gallery/portfolio click
   */
  trackGalleryClick(projectName: string, category?: string) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'select_content', {
        content_type: 'gallery',
        item_id: projectName,
        item_category: category
      });
    } catch (error) {
      console.error('Error tracking gallery click:', error);
    }
  }

  /**
   * Track CTA button clicks
   */
  trackCTAClick(ctaName: string, location?: string) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'cta_click', {
        cta: ctaName,
        cta_location: location || window.location.pathname
      });
    } catch (error) {
      console.error('Error tracking CTA click:', error);
    }
  }

  /**
   * Track outbound link clicks
   */
  trackOutboundLink(url: string, linkText?: string) {
    if (!this.analytics) return;

    try {
      const domain = new URL(url).hostname;
      logEvent(this.analytics, 'click', {
        link_domain: domain,
        link_url: url,
        link_text: linkText,
        outbound: true
      });
    } catch (error) {
      console.error('Error tracking outbound link:', error);
    }
  }

  /**
   * Track file downloads
   */
  trackFileDownload(fileName: string, fileExtension?: string) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'file_download', {
        file_name: fileName,
        file_extension: fileExtension || fileName.split('.').pop(),
        page_location: window.location.href
      });
    } catch (error) {
      console.error('Error tracking file download:', error);
    }
  }

  /**
   * Track 404 / page not found
   */
  trackPageNotFound(path: string) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'page_not_found', {
        page_path: path,
        page_location: window.location.href
      });
    } catch (error) {
      console.error('Error tracking 404:', error);
    }
  }

  /**
   * Track search queries
   */
  trackSearch(searchTerm: string, resultCount?: number) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'search', {
        search_term: searchTerm,
        result_count: resultCount
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  /**
   * Track form interactions
   */
  trackFormStart(formId: string) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'form_start', {
        form_id: formId,
        page_location: window.location.href
      });
    } catch (error) {
      console.error('Error tracking form start:', error);
    }
  }

  trackFormSubmit(formId: string, success: boolean = true) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'form_submit', {
        form_id: formId,
        success,
        page_location: window.location.href
      });
    } catch (error) {
      console.error('Error tracking form submit:', error);
    }
  }

  trackFormError(formId: string, errorField?: string) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, 'form_error', {
        form_id: formId,
        field_name: errorField,
        page_location: window.location.href
      });
    } catch (error) {
      console.error('Error tracking form error:', error);
    }
  }

  /**
   * Set user properties (non-PII)
   */
  setUserProperty(properties: { [key: string]: any }) {
    if (!this.analytics) return;

    try {
      setUserProperties(this.analytics, properties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  /**
   * Set user ID (only after consent and login)
   */
  setUserId(userId: string) {
    if (!this.analytics) return;

    try {
      setUserId(this.analytics, userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  /**
   * Track custom event
   */
  trackCustomEvent(eventName: string, params?: { [key: string]: any }) {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, eventName as any, params);
    } catch (error) {
      console.error('Error tracking custom event:', error);
    }
  }
}
