import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SettingsService } from './settings.service';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private meta = inject(Meta);
  private title = inject(Title);
  private settingsService = inject(SettingsService);
  private translate = inject(TranslateService);

  private readonly translationKeyPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_.-]+$/;

  private async resolveValue(value?: string): Promise<string | undefined> {
    if (!value) {
      return value;
    }

    if (!this.translationKeyPattern.test(value)) {
      return value;
    }

    const instant = this.translate.instant(value);
    if (instant !== value) {
      return instant;
    }

    try {
      const resolved = await firstValueFrom(this.translate.get(value));
      return resolved;
    } catch {
      return value;
    }
  }

  /**
   * Set page title and meta tags
   * Falls back to settings defaults if page-specific values not provided
   */
  async setPageMeta(config?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: string;
    url?: string;
  }): Promise<void> {
    const settings = await this.settingsService.getSettings();
    const siteName = settings.siteName || 'TheLuxMining';

    const resolvedTitle = await this.resolveValue(config?.title);
    const resolvedDescription = await this.resolveValue(config?.description);
    const resolvedKeywords = await this.resolveValue(config?.keywords);

    // Title
    const titleBase = resolvedTitle || settings.metaTitle || siteName;
    const pageTitle = resolvedTitle && !titleBase.includes(siteName)
      ? `${siteName} | ${resolvedTitle}`
      : titleBase;
    this.title.setTitle(pageTitle);

    // Description
    const description = resolvedDescription || settings.metaDescription || settings.siteDescription;
    this.meta.updateTag({ name: 'description', content: description });

    // Keywords
    const keywords = resolvedKeywords || settings.metaKeywords || '';
    if (keywords) {
      this.meta.updateTag({ name: 'keywords', content: keywords });
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: config?.type || 'website' });
    
    const ogImage = config?.image || settings.ogImage || '';
    if (ogImage) {
      this.meta.updateTag({ property: 'og:image', content: ogImage });
    }

    if (config?.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: settings.twitterCard || 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    
    if (ogImage) {
      this.meta.updateTag({ name: 'twitter:image', content: ogImage });
    }
  }

  /**
   * Set product-specific meta tags
   */
  async setProductMeta(product: {
    name: string;
    description?: string;
    seo?: {
      metaDescription?: string;
      ogImage?: string;
    };
    imageUrl?: string;
    url?: string;
  }): Promise<void> {
    const settings = await this.settingsService.getSettings();

    await this.setPageMeta({
      title: `${product.name} - ${settings.siteName}`,
      description: product.seo?.metaDescription || product.description || settings.metaDescription,
      image: product.seo?.ogImage || product.imageUrl || settings.ogImage,
      type: 'product',
      url: product.url
    });
  }

  /**
   * Reset to default site meta tags
   */
  async resetToDefaults(): Promise<void> {
    await this.setPageMeta();
  }
}
