import { Injectable } from '@angular/core';
import { featureFlags, siteConfig, emailTemplates } from '@config';
import type { FeatureFlags, SiteConfig, EmailTemplates } from '@config';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandConfigService {
  readonly site: SiteConfig = siteConfig;
  readonly features: FeatureFlags = featureFlags;
  readonly emails: EmailTemplates = emailTemplates;
  readonly appUrl = environment.app?.url || 'http://localhost:4200';

  get siteName(): string {
    return this.site.brand.shortName || this.site.brand.name;
  }

  get legalName(): string {
    return this.site.legal?.businessName || this.site.brand.name;
  }

  get nav() {
    return {
      header: this.site.navigation?.header ?? [],
      footer: this.site.navigation?.footer ?? [],
      social: this.site.navigation?.social ?? []
    };
  }

  get siteUrl(): string {
    if (this.site.brand.domain) {
      const domain = this.site.brand.domain.replace(/^https?:\/\//, '');
      return `https://${domain}`;
    }
    return this.appUrl;
  }

  get notificationsFrom(): { name: string; email: string } {
    return {
      name: this.site.notifications?.emailFromName || this.site.brand.name,
      email: this.site.notifications?.emailFrom || this.site.contact.email
    };
  }
}
