import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, UserEngagementMetrics, ContentMetrics } from '../../services/analytics.service';
import { Subject, interval, takeUntil } from 'rxjs';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
}

@Component({
  selector: 'app-analytics-dashboard',
  imports: [CommonModule],
  template: `
    <div class="analytics-dashboard">
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Analytics Dashboard</h1>
            <p>Real-time insights into your website performance and user engagement</p>
          </div>
          
          <div class="dashboard-controls">
            <div class="time-range-selector">
              <label for="timeRange">Time Range:</label>
              <select 
                id="timeRange" 
                [value]="selectedTimeRange()" 
                (change)="onTimeRangeChange($event)"
                class="time-range-select">
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 3 months</option>
              </select>
            </div>
            
            <button 
              type="button" 
              (click)="refreshData()" 
              class="refresh-btn"
              [disabled]="isRefreshing()">
              <span class="refresh-icon" [class.spinning]="isRefreshing()">🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        
        <!-- Key Metrics Overview -->
        <section class="metrics-overview">
          <h2>Key Performance Indicators</h2>
          <div class="metrics-grid">
            @for (metric of keyMetrics(); track metric.title) {
              <div class="metric-card" [style.border-left-color]="metric.color">
                <div class="metric-header">
                  <div class="metric-icon" [style.background-color]="metric.color + '20'">
                    {{ metric.icon }}
                  </div>
                  <div class="metric-change" [class]="'change-' + metric.changeType">
                    @if (metric.changeType === 'increase') {
                      ↗ +{{ metric.change }}%
                    } @else if (metric.changeType === 'decrease') {
                      ↘ -{{ metric.change }}%
                    } @else {
                      → {{ metric.change }}%
                    }
                  </div>
                </div>
                <div class="metric-content">
                  <h3>{{ metric.title }}</h3>
                  <div class="metric-value">{{ metric.value }}</div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Real-time Activity -->
        <section class="realtime-section">
          <div class="section-header">
            <h2>Real-time Activity</h2>
            <div class="realtime-indicator">
              <span class="live-dot"></span>
              <span class="live-text">Live</span>
            </div>
          </div>
          
          <div class="realtime-content">
            <div class="realtime-stats">
              <div class="realtime-stat">
                <div class="stat-value">{{ currentActiveUsers() }}</div>
                <div class="stat-label">Active Users</div>
              </div>
              <div class="realtime-stat">
                <div class="stat-value">{{ currentPageViews() }}</div>
                <div class="stat-label">Page Views (Today)</div>
              </div>
              <div class="realtime-stat">
                <div class="stat-value">{{ formatDuration(currentSessionDuration()) }}</div>
                <div class="stat-label">Avg. Session</div>
              </div>
            </div>
            
            @if (recentEvents().length > 0) {
              <div class="recent-events">
                <h4>Recent Events</h4>
                <div class="events-list">
                  @for (event of recentEvents().slice(0, 5); track event.timestamp) {
                    <div class="event-item">
                      <div class="event-time">{{ formatTime(event.timestamp) }}</div>
                      <div class="event-details">
                        <span class="event-name">{{ formatEventName(event.name) }}</span>
                        @if (event.parameters && event.parameters['page_path']) {
                          <span class="event-page">{{ event.parameters['page_path'] }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Content Performance -->
        <section class="content-performance">
          <h2>Content Performance</h2>
          
          <div class="performance-grid">
            <!-- Most Viewed Pages -->
            <div class="performance-card">
              <h3>Top Pages</h3>
              <div class="chart-container">
                @if (topPages().length > 0) {
                  <div class="bar-chart">
                    @for (page of topPages().slice(0, 5); track page.page) {
                      <div class="bar-item">
                        <div class="bar-label">{{ formatPageName(page.page) }}</div>
                        <div class="bar-container">
                          <div 
                            class="bar-fill" 
                            [style.width.%]="getBarWidth(page.views, maxPageViews())">
                          </div>
                        </div>
                        <div class="bar-value">{{ page.views }}</div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="no-data">No page view data available</div>
                }
              </div>
            </div>

            <!-- Search Queries -->
            <div class="performance-card">
              <h3>Top Search Queries</h3>
              <div class="chart-container">
                @if (topSearches().length > 0) {
                  <div class="list-chart">
                    @for (search of topSearches().slice(0, 5); track search.query) {
                      <div class="list-item">
                        <div class="list-label">{{ search.query }}</div>
                        <div class="list-value">{{ search.count }} searches</div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="no-data">No search data available</div>
                }
              </div>
            </div>

            <!-- User Engagement -->
            <div class="performance-card">
              <h3>User Engagement</h3>
              <div class="engagement-metrics">
                <div class="engagement-item">
                  <div class="engagement-label">Average Session Duration</div>
                  <div class="engagement-value">{{ formatDuration(userEngagement().sessionDuration) }}</div>
                </div>
                <div class="engagement-item">
                  <div class="engagement-label">Total Events</div>
                  <div class="engagement-value">{{ userEngagement().eventsCount }}</div>
                </div>
                <div class="engagement-item">
                  <div class="engagement-label">Page Views per Session</div>
                  <div class="engagement-value">{{ calculatePageViewsPerSession() }}</div>
                </div>
                <div class="engagement-item">
                  <div class="engagement-label">Last Activity</div>
                  <div class="engagement-value">{{ formatRelativeTime(userEngagement().lastActivity) }}</div>
                </div>
              </div>
            </div>

            <!-- Conversion Tracking -->
            <div class="performance-card">
              <h3>Conversions</h3>
              <div class="conversion-metrics">
                <div class="conversion-item">
                  <div class="conversion-icon">📧</div>
                  <div class="conversion-info">
                    <div class="conversion-label">Contact Forms</div>
                    <div class="conversion-value">{{ conversionMetrics().contactForms }}</div>
                  </div>
                </div>
                <div class="conversion-item">
                  <div class="conversion-icon">📞</div>
                  <div class="conversion-info">
                    <div class="conversion-label">Phone Calls</div>
                    <div class="conversion-value">{{ conversionMetrics().phoneCalls }}</div>
                  </div>
                </div>
                <div class="conversion-item">
                  <div class="conversion-icon">💼</div>
                  <div class="conversion-info">
                    <div class="conversion-label">Service Inquiries</div>
                    <div class="conversion-value">{{ conversionMetrics().serviceInquiries }}</div>
                  </div>
                </div>
                <div class="conversion-item">
                  <div class="conversion-icon">🎨</div>
                  <div class="conversion-info">
                    <div class="conversion-label">Portfolio Views</div>
                    <div class="conversion-value">{{ conversionMetrics().portfolioViews }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Technical Performance -->
        <section class="technical-performance">
          <h2>Technical Performance</h2>
          
          <div class="technical-grid">
            <div class="technical-card">
              <h3>Page Load Performance</h3>
              <div class="performance-indicators">
                <div class="indicator">
                  <div class="indicator-label">Average Load Time</div>
                  <div class="indicator-value good">1.2s</div>
                </div>
                <div class="indicator">
                  <div class="indicator-label">Core Web Vitals</div>
                  <div class="indicator-value good">Passed</div>
                </div>
                <div class="indicator">
                  <div class="indicator-label">Mobile Performance</div>
                  <div class="indicator-value warning">72/100</div>
                </div>
              </div>
            </div>

            <div class="technical-card">
              <h3>Error Tracking</h3>
              <div class="error-metrics">
                @if (recentErrors().length > 0) {
                  <div class="error-list">
                    @for (error of recentErrors().slice(0, 3); track $index) {
                      <div class="error-item">
                        <div class="error-type">{{ error.type }}</div>
                        <div class="error-message">{{ error.message }}</div>
                        <div class="error-time">{{ formatRelativeTime(error.timestamp) }}</div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="no-errors">
                    <div class="success-icon">✅</div>
                    <p>No errors detected</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- Analytics Settings -->
        <section class="analytics-settings">
          <h2>Analytics Settings</h2>
          
          <div class="settings-grid">
            <div class="setting-card">
              <h3>Data Collection</h3>
              <div class="setting-content">
                <label class="toggle-setting">
                  <input 
                    type="checkbox" 
                    [checked]="analyticsEnabled()"
                    (change)="toggleAnalytics($event)">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Enable Analytics Collection</span>
                </label>
                
                <p class="setting-description">
                  Control whether user interaction data is collected for analysis.
                </p>
              </div>
            </div>

            <div class="setting-card">
              <h3>Data Export</h3>
              <div class="setting-content">
                <button 
                  type="button" 
                  (click)="exportData()" 
                  class="export-btn"
                  [disabled]="isExporting()">
                  @if (isExporting()) {
                    <span class="loading-spinner-small"></span>
                    Exporting...
                  } @else {
                    📥 Export Analytics Data
                  }
                </button>
                
                <p class="setting-description">
                  Export analytics data for external analysis or reporting.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .analytics-dashboard {
      min-height: 100vh;
      background: #F8F9FA;
    }

    /* Dashboard Header */
    .dashboard-header {
      background: white;
      border-bottom: 1px solid #E9ECEF;
      padding: 2rem 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header-info h1 {
      margin: 0 0 0.5rem 0;
      color: var(--theme-text, #2D3436);
      font-size: 2rem;
      font-weight: 600;
    }

    .header-info p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .dashboard-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .time-range-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .time-range-selector label {
      font-weight: 500;
      color: var(--theme-text, #2D3436);
    }

    .time-range-select {
      padding: 0.5rem 1rem;
      border: 1px solid #DDD;
      border-radius: 6px;
      background: white;
      color: var(--theme-text, #2D3436);
      cursor: pointer;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--theme-primary, #7FB069);
      background: var(--theme-primary, #7FB069);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover:not(:disabled) {
      background: #6FA055;
      border-color: #6FA055;
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .refresh-icon.spinning {
      animation: spin 1s linear infinite;
    }

    /* Dashboard Content */
    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-content section {
      margin-bottom: 3rem;
    }

    .dashboard-content h2 {
      margin: 0 0 1.5rem 0;
      color: var(--theme-text, #2D3436);
      font-size: 1.5rem;
      font-weight: 600;
    }

    /* Metrics Overview */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .metric-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid;
      transition: transform 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .metric-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .metric-change {
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }

    .change-increase {
      background: #D4EDDA;
      color: #155724;
    }

    .change-decrease {
      background: #F8D7DA;
      color: #721C24;
    }

    .change-neutral {
      background: #FFF3CD;
      color: #856404;
    }

    .metric-content h3 {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--theme-text, #2D3436);
    }

    /* Real-time Section */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .realtime-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      background: #28A745;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .live-text {
      color: #28A745;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .realtime-content {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .realtime-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .realtime-stat {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--theme-primary, #7FB069);
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .recent-events h4 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
    }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .event-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem;
      background: #F8F9FA;
      border-radius: 6px;
    }

    .event-time {
      font-size: 0.8rem;
      color: #666;
      flex-shrink: 0;
      width: 60px;
    }

    .event-details {
      flex: 1;
    }

    .event-name {
      font-weight: 500;
      color: var(--theme-text, #2D3436);
    }

    .event-page {
      color: #666;
      font-size: 0.9rem;
      margin-left: 0.5rem;
    }

    /* Performance Cards */
    .performance-grid,
    .technical-grid,
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .performance-card,
    .technical-card,
    .setting-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .performance-card h3,
    .technical-card h3,
    .setting-card h3 {
      margin: 0 0 1rem 0;
      color: var(--theme-text, #2D3436);
      font-size: 1.1rem;
    }

    .chart-container {
      height: 200px;
      overflow: hidden;
    }

    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      height: 100%;
    }

    .bar-item {
      display: grid;
      grid-template-columns: 1fr 2fr auto;
      gap: 0.75rem;
      align-items: center;
    }

    .bar-label {
      font-size: 0.9rem;
      color: var(--theme-text, #2D3436);
      font-weight: 500;
    }

    .bar-container {
      background: #F1F3F4;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--theme-primary, #7FB069), #6FA055);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .bar-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--theme-text, #2D3436);
    }

    .list-chart {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #F1F3F4;
    }

    .list-label {
      font-weight: 500;
      color: var(--theme-text, #2D3436);
    }

    .list-value {
      color: #666;
      font-size: 0.9rem;
    }

    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
      font-style: italic;
    }

    /* Engagement Metrics */
    .engagement-metrics,
    .conversion-metrics {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .engagement-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #F1F3F4;
    }

    .engagement-label {
      color: #666;
      font-size: 0.9rem;
    }

    .engagement-value {
      font-weight: 600;
      color: var(--theme-text, #2D3436);
    }

    .conversion-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #F8F9FA;
      border-radius: 8px;
    }

    .conversion-icon {
      font-size: 1.5rem;
    }

    .conversion-info {
      flex: 1;
    }

    .conversion-label {
      color: #666;
      font-size: 0.9rem;
    }

    .conversion-value {
      font-weight: 600;
      color: var(--theme-text, #2D3436);
      font-size: 1.1rem;
    }

    /* Technical Performance */
    .performance-indicators {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .indicator {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .indicator-label {
      color: #666;
      font-size: 0.9rem;
    }

    .indicator-value {
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.9rem;
    }

    .indicator-value.good {
      background: #D4EDDA;
      color: #155724;
    }

    .indicator-value.warning {
      background: #FFF3CD;
      color: #856404;
    }

    .indicator-value.error {
      background: #F8D7DA;
      color: #721C24;
    }

    .error-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .error-item {
      padding: 0.75rem;
      background: #FFF5F5;
      border-left: 3px solid #F56565;
      border-radius: 4px;
    }

    .error-type {
      font-weight: 600;
      color: #C53030;
      font-size: 0.9rem;
    }

    .error-message {
      color: #666;
      font-size: 0.8rem;
      margin: 0.25rem 0;
    }

    .error-time {
      color: #999;
      font-size: 0.8rem;
    }

    .no-errors {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .success-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    /* Settings */
    .setting-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .toggle-setting {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
    }

    .toggle-slider {
      position: relative;
      width: 50px;
      height: 24px;
      background: #CCC;
      border-radius: 24px;
      transition: background 0.3s ease;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }

    .toggle-setting input:checked + .toggle-slider {
      background: var(--theme-primary, #7FB069);
    }

    .toggle-setting input:checked + .toggle-slider::before {
      transform: translateX(26px);
    }

    .toggle-setting input {
      display: none;
    }

    .toggle-label {
      font-weight: 500;
      color: var(--theme-text, #2D3436);
    }

    .setting-description {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }

    .export-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--theme-primary, #7FB069);
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .export-btn:hover:not(:disabled) {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .export-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid var(--theme-primary, #7FB069);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
      }

      .dashboard-controls {
        justify-content: space-between;
      }

      .dashboard-content {
        padding: 1rem;
      }

      .metrics-grid,
      .performance-grid,
      .technical-grid,
      .settings-grid {
        grid-template-columns: 1fr;
      }

      .realtime-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .bar-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .bar-container {
        order: 2;
      }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private destroy$ = new Subject<void>();

  // Component state
  selectedTimeRange = signal('week');
  isRefreshing = signal(false);
  isExporting = signal(false);
  analyticsEnabled = signal(true);

  // Mock data for current active users (would come from real-time service)
  currentActiveUsers = signal(3);
  currentPageViews = signal(0);

  // Analytics data
  userEngagement = computed(() => this.analyticsService.getUserEngagementMetrics());
  recentEvents = computed(() => this.analyticsService.getEventHistory());
  contentMetrics = computed(() => this.analyticsService.getContentMetrics());
  currentSessionDuration = computed(() => this.analyticsService.currentSessionDuration());

  // Computed metrics
  topPages = computed(() => this.contentMetrics().mostViewedPages);
  topSearches = computed(() => this.contentMetrics().searchQueries);
  maxPageViews = computed(() => 
    Math.max(...this.topPages().map(p => p.views), 1)
  );

  // Key metrics for dashboard
  keyMetrics = computed((): MetricCard[] => [
    {
      title: 'Total Page Views',
      value: this.userEngagement().pageViews.toLocaleString(),
      change: 12.5,
      changeType: 'increase',
      icon: '👁️',
      color: '#7FB069'
    },
    {
      title: 'Active Sessions',
      value: this.currentActiveUsers().toString(),
      change: 0,
      changeType: 'neutral',
      icon: '👥',
      color: '#4ECDC4'
    },
    {
      title: 'Avg. Session Duration',
      value: this.formatDuration(this.userEngagement().sessionDuration),
      change: 8.3,
      changeType: 'increase',
      icon: '⏱️',
      color: '#45B7D1'
    },
    {
      title: 'Total Events',
      value: this.userEngagement().eventsCount.toLocaleString(),
      change: 15.7,
      changeType: 'increase',
      icon: '🎯',
      color: '#F7DC6F'
    }
  ]);

  // Mock conversion metrics
  conversionMetrics = signal({
    contactForms: 23,
    phoneCalls: 15,
    serviceInquiries: 31,
    portfolioViews: 127
  });

  // Mock error data
  recentErrors = signal([
    {
      type: 'JavaScript Error',
      message: 'Image failed to load',
      timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
    }
  ]);

  ngOnInit(): void {
    this.loadAnalyticsData();
    this.setupRealTimeUpdates();
    this.currentPageViews.set(this.userEngagement().pageViews);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRealTimeUpdates(): void {
    // Update real-time metrics every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPageViews.set(this.userEngagement().pageViews);
        // Update active users (mock data)
        this.currentActiveUsers.set(Math.floor(Math.random() * 5) + 1);
      });
  }

  async loadAnalyticsData(): Promise<void> {
    this.isRefreshing.set(true);
    
    try {
      // Load analytics data based on time range
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      this.isRefreshing.set(false);
    }
  }

  onTimeRangeChange(event: Event): void {
    const range = (event.target as HTMLSelectElement).value;
    this.selectedTimeRange.set(range);
    this.loadAnalyticsData();
  }

  async refreshData(): Promise<void> {
    await this.loadAnalyticsData();
  }

  async toggleAnalytics(event: Event): Promise<void> {
    const enabled = (event.target as HTMLInputElement).checked;
    this.analyticsEnabled.set(enabled);
    await this.analyticsService.setAnalyticsCollection(enabled);
  }

  async exportData(): Promise<void> {
    this.isExporting.set(true);
    
    try {
      const data = {
        userEngagement: this.userEngagement(),
        contentMetrics: this.contentMetrics(),
        events: this.recentEvents().slice(0, 100), // Last 100 events
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      this.isExporting.set(false);
    }
  }

  // Utility methods
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  formatEventName(eventName: string): string {
    return eventName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  formatPageName(page: string): string {
    if (page === '/') return 'Home';
    return page
      .split('/')
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' > ');
  }

  getBarWidth(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  calculatePageViewsPerSession(): string {
    const engagement = this.userEngagement();
    if (engagement.eventsCount === 0) return '0';
    
    const ratio = engagement.pageViews / (engagement.eventsCount || 1);
    return ratio.toFixed(1);
  }
}