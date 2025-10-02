import { Injectable, inject } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsTrackingService {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  private currentPage = '';
  private pageStartTime = 0;
  private scrollDepths = new Set<number>();

  constructor() {
    // Only setup tracking in browser environment
    if (typeof window !== 'undefined') {
      this.setupAutoTracking();
    }
  }

  private setupAutoTracking(): void {
    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageChange(event.urlAfterRedirects);
    });

    // Track scroll depth (only in browser)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      window.addEventListener('scroll', this.throttle(this.trackScrollDepth.bind(this), 1000));
      
      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.trackPageExit();
      });
    }
  }

  // Page tracking
  private trackPageChange(url: string): void {
    // Track time on previous page
    if (this.currentPage && this.pageStartTime) {
      const timeOnPage = Date.now() - this.pageStartTime;
      this.analyticsService.trackTimeOnPage(this.currentPage, timeOnPage);
    }

    // Reset for new page
    this.currentPage = url;
    this.pageStartTime = Date.now();
    this.scrollDepths.clear();

    // Track new page view
    this.analyticsService.trackPageView(url);
  }

  private trackPageExit(): void {
    if (this.currentPage && this.pageStartTime) {
      const timeOnPage = Date.now() - this.pageStartTime;
      this.analyticsService.trackTimeOnPage(this.currentPage, timeOnPage);
    }
  }

  private trackScrollDepth(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const scrollPercentage = Math.round((scrollTop + windowHeight) / documentHeight * 100);
    
    // Track 25%, 50%, 75%, 100% scroll milestones
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (scrollPercentage >= milestone && !this.scrollDepths.has(milestone)) {
        this.scrollDepths.add(milestone);
        this.analyticsService.trackScrollDepth(this.currentPage, milestone);
      }
    }
  }

  // Content interaction tracking
  trackContentView(contentType: 'project' | 'service' | 'blog' | 'testimonial', contentId: string, contentTitle: string): void {
    this.analyticsService.trackContentView(contentType, contentId, contentTitle);
  }

  trackServiceInquiry(serviceName: string, source: string = 'unknown'): void {
    this.analyticsService.trackServiceInquiry(serviceName, source);
  }

  trackContactForm(source: string, formData?: any): void {
    this.analyticsService.trackContactForm('contact', source);
    
    // Track additional form data if provided
    if (formData) {
      this.analyticsService.logEvent('contact_form_details', {
        source,
        has_message: !!formData.message,
        event_type: formData.eventType || 'unknown',
        budget_range: formData.budgetRange || 'not_specified'
      });
    }
  }

  trackPhoneClick(source: string): void {
    this.analyticsService.trackPhoneCall(source);
  }

  trackEmailClick(source: string): void {
    this.analyticsService.trackEmailClick(source);
  }

  trackPortfolioInteraction(projectId: string, projectTitle: string, action: 'view' | 'image_click' | 'gallery_navigate'): void {
    this.analyticsService.trackPortfolioInteraction(projectId, projectTitle, action);
  }

  // Search tracking
  trackSearch(query: string, resultsCount: number, filters?: any): void {
    this.analyticsService.trackSearch(query, resultsCount);
    
    if (filters) {
      this.analyticsService.logEvent('search_with_filters', {
        search_term: query,
        results_count: resultsCount,
        filters_applied: Object.keys(filters).filter(key => filters[key] && filters[key].length > 0),
        filter_count: Object.keys(filters).filter(key => filters[key] && filters[key].length > 0).length
      });
    }
  }

  trackSearchResultClick(query: string, resultType: string, resultId: string, position: number): void {
    this.analyticsService.logEvent('search_result_click', {
      search_term: query,
      result_type: resultType,
      result_id: resultId,
      position: position
    });
  }

  // Social and sharing tracking
  trackSocialShare(platform: string, contentType: string, contentId: string, source: string = 'unknown'): void {
    this.analyticsService.trackSocialShare(platform, contentType, contentId);
    
    this.analyticsService.logEvent('social_share_detail', {
      platform,
      content_type: contentType,
      content_id: contentId,
      source
    });
  }

  // User interaction tracking
  trackButtonClick(buttonName: string, location: string, additionalData?: any): void {
    this.analyticsService.trackButtonClick(buttonName, location);
    
    if (additionalData) {
      this.analyticsService.logEvent('button_click_detail', {
        button_name: buttonName,
        location,
        ...additionalData
      });
    }
  }

  trackLinkClick(url: string, text: string, location: string): void {
    const isExternal = typeof window !== 'undefined' ? 
      !url.startsWith('/') && !url.includes(window.location.hostname) : 
      !url.startsWith('/');
    
    this.analyticsService.trackLinkClick(url, text, isExternal);
    
    this.analyticsService.logEvent('link_click_detail', {
      url,
      text,
      location,
      is_external: isExternal
    });
  }

  trackFileDownload(fileName: string, fileType: string, source: string): void {
    this.analyticsService.trackDownload(fileName, fileType);
    
    this.analyticsService.logEvent('file_download_detail', {
      file_name: fileName,
      file_type: fileType,
      source
    });
  }

  // E-commerce and conversion tracking
  trackServicePageView(serviceName: string, serviceCategory: string): void {
    this.analyticsService.logEvent('service_page_view', {
      service_name: serviceName,
      service_category: serviceCategory
    });
  }

  trackPricingInquiry(serviceType: string, estimatedBudget?: string): void {
    this.analyticsService.logEvent('pricing_inquiry', {
      service_type: serviceType,
      estimated_budget: estimatedBudget || 'not_specified'
    });
  }

  trackQuoteRequest(services: string[], eventDate?: string, guestCount?: number): void {
    this.analyticsService.logEvent('quote_request', {
      services: services,
      service_count: services.length,
      event_date: eventDate || 'not_specified',
      guest_count: guestCount || 0,
      value: services.length * 50, // Estimate value based on service count
      currency: 'USD'
    });
  }

  // Seasonal and theme tracking
  trackSeasonalThemeChange(fromSeason: string, toSeason: string): void {
    this.analyticsService.logEvent('seasonal_theme_change', {
      from_season: fromSeason,
      to_season: toSeason
    });
  }

  trackSeasonalContentView(season: string, contentType: string): void {
    this.analyticsService.logEvent('seasonal_content_view', {
      season,
      content_type: contentType
    });
  }

  // Admin and management tracking
  trackAdminAction(action: string, contentType: string, success: boolean = true): void {
    this.analyticsService.logEvent('admin_action', {
      action,
      content_type: contentType,
      success
    });
  }

  trackContentManagement(action: 'create' | 'edit' | 'delete', contentType: string, contentId: string): void {
    this.analyticsService.logEvent('content_management', {
      action,
      content_type: contentType,
      content_id: contentId
    });
  }

  // Performance tracking
  trackPerformanceMetric(metricName: string, value: number, context?: any): void {
    this.analyticsService.trackPerformance(metricName, value);
    
    if (context) {
      this.analyticsService.logEvent('performance_detail', {
        metric_name: metricName,
        value,
        ...context
      });
    }
  }

  trackImageLoadTime(imageUrl: string, loadTime: number): void {
    this.analyticsService.logEvent('image_load_performance', {
      image_url: imageUrl,
      load_time_ms: loadTime,
      page_path: this.currentPage
    });
  }

  // Error tracking
  trackError(error: Error, context?: any): void {
    this.analyticsService.trackError('javascript_error', error.message, this.currentPage);
    
    this.analyticsService.logEvent('error_detail', {
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace length
      page_path: this.currentPage,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  trackApiError(endpoint: string, statusCode: number, errorMessage: string): void {
    this.analyticsService.logEvent('api_error', {
      endpoint,
      status_code: statusCode,
      error_message: errorMessage,
      page_path: this.currentPage
    });
  }

  // Utility methods
  private throttle(func: Function, delay: number): (...args: any[]) => void {
    let timeoutId: any;
    let lastExecTime = 0;
    
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // Manual tracking methods for components
  startSession(): void {
    // Session is automatically started by AnalyticsService
  }

  endSession(): void {
    this.analyticsService.endSession();
  }

  setUserProperties(properties: { [key: string]: any }): void {
    this.analyticsService.setUserProperties(properties);
  }

  setUserId(userId: string | null): void {
    this.analyticsService.setUserId(userId);
  }
}