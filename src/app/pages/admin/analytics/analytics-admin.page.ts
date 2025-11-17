import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import {
  AdminDashboardService,
  AdminActivityItem,
  AdminAnalyticsMetric,
  AnalyticsMetricKey,
  AnalyticsPeriod
} from '../../../services/admin-dashboard.service';
import { LoadingComponentBase } from '../../../core/classes/loading-component.base';

interface AnalyticsMetricCard {
  key: AnalyticsMetricKey;
  labelKey: string;
  formattedValue: string;
  changePercentage: number | null;
  iconPath: string;
  colorClass: string;
  format: 'number' | 'currency';
}

type InitiativeTone = 'discovery' | 'design' | 'development' | 'beta';

interface FutureInitiative {
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
  tone: InitiativeTone;
}

@Component({
  selector: 'app-analytics-admin',
  standalone: true,
  imports: [CommonModule, TranslateModule, AdminSidebarComponent],
  templateUrl: './analytics-admin.page.html',
  styleUrls: ['./analytics-admin.page.scss']
})
export class AnalyticsAdminComponent extends LoadingComponentBase implements OnInit {
  private dashboardService = inject(AdminDashboardService);
  private numberFormatter = new Intl.NumberFormat();
  private currencyFormatterCache = new Map<string, Intl.NumberFormat>();
  
  metrics: AnalyticsMetricCard[] = [];
  selectedPeriod: AnalyticsPeriod = 'week';
  currencyCode = 'USD';
  recentActivity: AdminActivityItem[] = [];
  periodOptions: AnalyticsPeriod[] = ['today', 'week', 'month', 'year'];

  futureInitiatives: FutureInitiative[] = [
    {
      titleKey: 'admin.analytics.future_items.charts.title',
      descriptionKey: 'admin.analytics.future_items.charts.description',
      statusKey: 'admin.analytics.future_items.charts.status',
      tone: 'beta'
    },
    {
      titleKey: 'admin.analytics.future_items.top_products.title',
      descriptionKey: 'admin.analytics.future_items.top_products.description',
      statusKey: 'admin.analytics.future_items.top_products.status',
      tone: 'development'
    },
    {
      titleKey: 'admin.analytics.future_items.geo.title',
      descriptionKey: 'admin.analytics.future_items.geo.description',
      statusKey: 'admin.analytics.future_items.geo.status',
      tone: 'design'
    },
    {
      titleKey: 'admin.analytics.future_items.funnels.title',
      descriptionKey: 'admin.analytics.future_items.funnels.description',
      statusKey: 'admin.analytics.future_items.funnels.status',
      tone: 'discovery'
    }
  ];

  async ngOnInit() {
    await this.loadAnalytics();
  }

  async loadAnalytics() {
    await this.withLoading(async () => {
      const snapshot = await this.dashboardService.getAnalyticsSnapshot(this.selectedPeriod);
      this.currencyCode = snapshot.currencyCode;

      this.metrics = snapshot.metrics.map(metric => this.mapMetricToCard(metric, snapshot.currencyCode));
      this.recentActivity = snapshot.recentActivity;
    });
  }

  async setPeriod(period: AnalyticsPeriod) {
    this.selectedPeriod = period;
    await this.loadAnalytics();
  }

  formatChange(change: number | null): string {
    if (change === null || Number.isNaN(change)) {
      return '—';
    }
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change}%`;
  }

  getChangeClasses(change: number | null): string {
    if (change === null) {
      return 'text-ts-ink opacity-50';
    }
    if (change > 0) {
      return 'text-green-500';
    }
    if (change < 0) {
      return 'text-red-500';
    }
    return 'text-ts-ink opacity-50';
  }

  getStatusBadgeClasses(tone: InitiativeTone): string {
    const base = 'px-2 py-1 text-xs font-semibold rounded-full border';
    switch (tone) {
      case 'discovery':
        return `${base} bg-blue-500/10 border-blue-500/30 text-blue-300`;
      case 'design':
        return `${base} bg-purple-500/10 border-purple-500/30 text-purple-200`;
      case 'development':
        return `${base} bg-ts-accent/10 border-ts-accent/30 text-ts-accent`;
      case 'beta':
        return `${base} bg-green-500/10 border-green-500/30 text-green-300`;
      default:
        return `${base} bg-ts-ink/10 border-ts-ink/20 text-ts-ink opacity-70`;
    }
  }

  trackMetric(index: number, metric: AnalyticsMetricCard): string {
    return metric.key;
  }

  private mapMetricToCard(metric: AdminAnalyticsMetric, currencyCode: string): AnalyticsMetricCard {
    const display = this.getMetricDisplay(metric.key);
    return {
      key: metric.key,
      labelKey: metric.labelKey,
      formattedValue: this.formatMetricValue(metric.currentValue, metric.format, currencyCode),
      changePercentage: metric.changePercentage,
      iconPath: display.iconPath,
      colorClass: display.colorClass,
      format: metric.format
    };
  }

  private formatMetricValue(value: number, format: 'number' | 'currency', currencyCode: string): string {
    if (format === 'currency') {
      if (!this.currencyFormatterCache.has(currencyCode)) {
        this.currencyFormatterCache.set(
          currencyCode,
          new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 2
          })
        );
      }
      return this.currencyFormatterCache.get(currencyCode)!.format(value);
    }

    return this.numberFormatter.format(value);
  }

  private getMetricDisplay(key: AnalyticsMetricKey): { iconPath: string; colorClass: string } {
    const map: Record<AnalyticsMetricKey, { iconPath: string; colorClass: string }> = {
      totalOrders: {
        iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
        colorClass: 'bg-green-500/10 border-green-500/30 text-green-400'
      },
      revenue: {
        iconPath: 'M12 8c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2m-3 4c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2m-6 0v8c0 1.105 1.343 2 3 2s3-.895 3-2v-8m6 0c0 3.866-3.582 7-8 7s-8-3.134-8-7',
        colorClass: 'bg-ts-accent/10 border-ts-accent/30 text-ts-accent'
      },
      averageOrderValue: {
        iconPath: 'M12 8c-2.21 0-4-1.343-4-3s1.79-3 4-3 4 1.343 4 3m-4 6c-2.21 0-4-1.343-4-3s1.79-3 4-3 4 1.343 4 3m-8 0v8c0 1.657 1.79 3 4 3s4-1.343 4-3v-8',
        colorClass: 'bg-ts-accent-soft/20 border-ts-accent-soft/40 text-ts-accent-dark'
      },
      newCustomers: {
        iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
        colorClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
      },
      productsUpdated: {
        iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        colorClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      },
      galleryUploads: {
        iconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        colorClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
      }
    };

    return map[key];
  }

  getActivityIcon(type: AdminActivityItem['type']): string {
    const icons: Record<AdminActivityItem['type'], string> = {
      order: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      product: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      gallery: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    };
    return icons[type];
  }

  getActivityColor(type: AdminActivityItem['type']): string {
    const colors: Record<AdminActivityItem['type'], string> = {
      order: 'bg-ts-accent/20 text-ts-accent border border-ts-accent/30',
      product: 'bg-green-500/20 text-green-600 border border-green-500/30',
      gallery: 'bg-purple-500/20 text-purple-600 border border-purple-500/30',
      user: 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
    };
    return colors[type];
  }
}
