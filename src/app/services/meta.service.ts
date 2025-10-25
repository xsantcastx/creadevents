import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private meta = inject(Meta);
  private title = inject(Title);
  private settingsService = inject(SettingsService);

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
    
    // Title
    const pageTitle = config?.title || settings.metaTitle || settings.siteName;
    this.title.setTitle(pageTitle);

    // Description
    const description = config?.description || settings.metaDescription || settings.siteDescription;
    this.meta.updateTag({ name: 'description', content: description });

    // Keywords
    const keywords = config?.keywords || settings.metaKeywords || '';
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
