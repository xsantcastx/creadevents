import { Injectable, inject, signal, computed } from '@angular/core';
import { 
  Analytics, 
  getAnalytics, 
  logEvent, 
  setUserProperties, 
  setUserId,
  setAnalyticsCollectionEnabled,
  isSupported
} from '@angular/fire/analytics';
import { Router, NavigationEnd } from '@angular/router';
import { filter, debounceTime } from 'rxjs/operators';

export interface AnalyticsEvent {
  name: string;
  parameters?: { [key: string]: any };
  timestamp: Date;
}

export interface UserEngagementMetrics {
  pageViews: number;
  sessionDuration: number;
  bounceRate: number;
  eventsCount: number;
  lastActivity: Date;
}

export interface ContentMetrics {
  mostViewedPages: { page: string; views: number; }[];
  searchQueries: { query: string; count: number; }[];
  serviceInquiries: { service: string; count: number; }[];
  portfolioViews: { project: string; views: number; }[];
}

export interface ConversionMetrics {
  contactFormSubmissions: number;
  phoneCallClicks: number;
  emailClicks: number;
  servicePageViews: number;
  portfolioEngagement: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analytics = inject(Analytics);
  private router = inject(Router);

  // Analytics state
  private isInitialized = signal(false);
  private isCollectionEnabled = signal(true);
  private sessionStartTime = signal<Date | null>(null);
  private currentUserId = signal<string | null>(null);
  
  // Event tracking
  private eventHistory = signal<AnalyticsEvent[]>([]);
  private pageViews = signal<{ [page: string]: number }>({});
  private searchQueries = signal<{ [query: string]: number }>({});
  private userEngagement = signal<UserEngagementMetrics>({
    pageViews: 0,
    sessionDuration: 0,
    bounceRate: 0,
    eventsCount: 0,
    lastActivity: new Date()
  });

  // Computed properties
  totalEvents = computed(() => this.eventHistory().length);
  totalPageViews = computed(() => 
    Object.values(this.pageViews()).reduce((sum, views) => sum + views, 0)
  );
  currentSessionDuration = computed(() => {
    const start = this.sessionStartTime();
    return start ? Date.now() - start.getTime() : 0;
  });

  // Content metrics
  mostViewedPages = computed(() => 
    Object.entries(this.pageViews())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  );

  topSearchQueries = computed(() =>
    Object.entries(this.searchQueries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  );

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeAnalytics();
      this.setupRouteTracking();
      this.startSession();
    }
  }

  private async initializeAnalytics(): Promise<void> {
    try {
      // Check if Analytics is supported
      const supported = await isSupported();
      if (!supported) {
        console.warn('Firebase Analytics is not supported in this environment');
        return;
      }

      // Enable analytics collection by default
      await setAnalyticsCollectionEnabled(this.analytics, true);
      this.isInitialized.set(true);
      this.isCollectionEnabled.set(true);

      console.log('Firebase Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }

  private setupRouteTracking(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      debounceTime(100)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  private startSession(): void {
    this.sessionStartTime.set(new Date());
    // Only log session start in browser environment
    if (typeof window !== 'undefined') {
      this.logEvent('session_start', {
        engagement_time_msec: 0
      });
    }
  }

  // Core Analytics Methods
  async logEvent(eventName: string, parameters: { [key: string]: any } = {}): Promise<void> {
    if (!this.isInitialized() || !this.isCollectionEnabled()) {
      return;
    }

    // Only log events in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      // Add timestamp and session info to parameters
      const enrichedParameters = {
        ...parameters,
        timestamp: Date.now(),
        session_duration: this.currentSessionDuration(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        page_title: document.title
      };

      await logEvent(this.analytics, eventName, enrichedParameters);

      // Update local tracking
      const event: AnalyticsEvent = {
        name: eventName,
        parameters: enrichedParameters,
        timestamp: new Date()
      };

      this.eventHistory.update(events => [...events, event]);
      this.updateUserEngagement();

      console.log(`Analytics event logged: ${eventName}`, enrichedParameters);
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  async setUserId(userId: string | null): Promise<void> {
    if (!this.isInitialized()) return;

    try {
      await setUserId(this.analytics, userId);
      this.currentUserId.set(userId);
      
      if (userId) {
        this.logEvent('login', { method: 'firebase_auth' });
      } else {
        this.logEvent('logout');
      }
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  async setUserProperties(properties: { [key: string]: any }): Promise<void> {
    if (!this.isInitialized()) return;

    try {
      await setUserProperties(this.analytics, properties);
      console.log('User properties set:', properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  async setAnalyticsCollection(enabled: boolean): Promise<void> {
    try {
      await setAnalyticsCollectionEnabled(this.analytics, enabled);
      this.isCollectionEnabled.set(enabled);
      
      this.logEvent('analytics_collection_changed', { enabled });
    } catch (error) {
      console.error('Failed to set analytics collection:', error);
    }
  }

  // Page Tracking
  async trackPageView(page: string): Promise<void> {
    // Update page views counter
    this.pageViews.update(views => ({
      ...views,
      [page]: (views[page] || 0) + 1
    }));

    // Log to Firebase Analytics (only in browser)
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      await this.logEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: page
      });
    }
  }

  // User Interaction Tracking
  async trackButtonClick(buttonName: string, location: string): Promise<void> {
    await this.logEvent('button_click', {
      button_name: buttonName,
      location: location
    });
  }

  async trackLinkClick(linkUrl: string, linkText: string, isExternal: boolean = false): Promise<void> {
    await this.logEvent('link_click', {
      link_url: linkUrl,
      link_text: linkText,
      is_external: isExternal
    });
  }

  async trackFormSubmission(formName: string, success: boolean = true): Promise<void> {
    await this.logEvent('form_submit', {
      form_name: formName,
      success: success
    });
  }

  async trackDownload(fileName: string, fileType: string): Promise<void> {
    await this.logEvent('file_download', {
      file_name: fileName,
      file_type: fileType
    });
  }

  // Content Engagement Tracking
  async trackContentView(contentType: string, contentId: string, contentTitle: string): Promise<void> {
    await this.logEvent('view_item', {
      item_id: contentId,
      item_name: contentTitle,
      item_category: contentType,
      content_type: contentType
    });
  }

  async trackSearch(searchTerm: string, resultsCount: number): Promise<void> {
    // Update search queries counter
    this.searchQueries.update(queries => ({
      ...queries,
      [searchTerm]: (queries[searchTerm] || 0) + 1
    }));

    await this.logEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  async trackServiceInquiry(serviceName: string, inquiryType: string): Promise<void> {
    await this.logEvent('service_inquiry', {
      service_name: serviceName,
      inquiry_type: inquiryType
    });
  }

  async trackPortfolioInteraction(projectId: string, projectTitle: string, interactionType: string): Promise<void> {
    await this.logEvent('portfolio_interaction', {
      project_id: projectId,
      project_title: projectTitle,
      interaction_type: interactionType
    });
  }

  // E-commerce and Conversion Tracking
  async trackContactForm(formType: string, source: string): Promise<void> {
    await this.logEvent('generate_lead', {
      form_type: formType,
      source: source,
      value: 1,
      currency: 'USD'
    });
  }

  async trackPhoneCall(source: string): Promise<void> {
    await this.logEvent('phone_call', {
      source: source,
      value: 1,
      currency: 'USD'
    });
  }

  async trackEmailClick(source: string): Promise<void> {
    await this.logEvent('email_click', {
      source: source
    });
  }

  // Session and Engagement Tracking
  async trackScrollDepth(page: string, scrollPercentage: number): Promise<void> {
    if (scrollPercentage >= 25 && scrollPercentage % 25 === 0) {
      await this.logEvent('scroll', {
        page_path: page,
        scroll_depth: scrollPercentage
      });
    }
  }

  async trackTimeOnPage(page: string, timeSpent: number): Promise<void> {
    await this.logEvent('page_engagement', {
      page_path: page,
      engagement_time_msec: timeSpent
    });
  }

  async trackSocialShare(platform: string, contentType: string, contentId: string): Promise<void> {
    await this.logEvent('share', {
      method: platform,
      content_type: contentType,
      item_id: contentId
    });
  }

  // Error and Performance Tracking
  async trackError(errorType: string, errorMessage: string, page: string): Promise<void> {
    await this.logEvent('exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
      page_path: page
    });
  }

  async trackPerformance(metricName: string, value: number, unit: string = 'ms'): Promise<void> {
    await this.logEvent('timing_complete', {
      name: metricName,
      value: value,
      unit: unit
    });
  }

  // Session Management
  private updateUserEngagement(): void {
    this.userEngagement.update(engagement => ({
      ...engagement,
      pageViews: this.totalPageViews(),
      sessionDuration: this.currentSessionDuration(),
      eventsCount: this.totalEvents(),
      lastActivity: new Date()
    }));
  }

  endSession(): void {
    const sessionDuration = this.currentSessionDuration();
    this.logEvent('session_end', {
      engagement_time_msec: sessionDuration,
      page_views: this.totalPageViews(),
      events_count: this.totalEvents()
    });
  }

  // Analytics Data Access
  getEventHistory(): AnalyticsEvent[] {
    return this.eventHistory();
  }

  getUserEngagementMetrics(): UserEngagementMetrics {
    return this.userEngagement();
  }

  getContentMetrics(): ContentMetrics {
    return {
      mostViewedPages: this.mostViewedPages(),
      searchQueries: this.topSearchQueries(),
      serviceInquiries: [], // Would be populated from events
      portfolioViews: [] // Would be populated from events
    };
  }

  // Cleanup
  destroy(): void {
    this.endSession();
  }
}