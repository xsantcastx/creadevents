import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Template, TemplateComposition, Specs } from '../models/catalog';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private firestore = inject(Firestore);

  /**
   * Get all templates
   */
  getAllTemplates(): Observable<Template[]> {
    const templatesCollection = collection(this.firestore, 'templates');
    return from(getDocs(templatesCollection)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Template))
      )
    );
  }

  /**
   * Get templates by type and scope
   */
  async getTemplatesByScope(
    type: Template['type'],
    scope: Template['scope'],
    refId?: string,
    language: string = 'es'
  ): Promise<Template[]> {
    const templatesCollection = collection(this.firestore, 'templates');
    let q = query(
      templatesCollection,
      where('type', '==', type),
      where('scope', '==', scope),
      where('language', '==', language),
      where('active', '==', true)
    );

    if (refId) {
      q = query(q, where('refId', '==', refId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Template));
  }

  /**
   * Compose templates for a product
   * Fetches and merges templates from model, category, and global scopes
   */
  async composeTemplates(
    categoryId: string,
    modelId: string,
    placeholders: Record<string, string>,
    language: string = 'es'
  ): Promise<TemplateComposition> {
    const composition: TemplateComposition = {};

    // Fetch all relevant templates in parallel
    const [
      modelDescTemplates,
      categoryDescTemplates,
      globalDescTemplates,
      modelSeoTitleTemplates,
      categorySeoTitleTemplates,
      globalSeoTitleTemplates,
      modelSeoMetaTemplates,
      categorySeoMetaTemplates,
      globalSeoMetaTemplates,
      modelSpecsTemplates,
      categorySpecsTemplates,
      globalSpecsTemplates
    ] = await Promise.all([
      // Description templates
      this.getTemplatesByScope('description', 'model', modelId, language),
      this.getTemplatesByScope('description', 'category', categoryId, language),
      this.getTemplatesByScope('description', 'global', undefined, language),
      // SEO Title templates
      this.getTemplatesByScope('seoTitle', 'model', modelId, language),
      this.getTemplatesByScope('seoTitle', 'category', categoryId, language),
      this.getTemplatesByScope('seoTitle', 'global', undefined, language),
      // SEO Meta templates
      this.getTemplatesByScope('seoMeta', 'model', modelId, language),
      this.getTemplatesByScope('seoMeta', 'category', categoryId, language),
      this.getTemplatesByScope('seoMeta', 'global', undefined, language),
      // Specs templates
      this.getTemplatesByScope('specs', 'model', modelId, language),
      this.getTemplatesByScope('specs', 'category', categoryId, language),
      this.getTemplatesByScope('specs', 'global', undefined, language)
    ]);

    // Compose description (model > category > global)
    const descTemplate = modelDescTemplates[0] || categoryDescTemplates[0] || globalDescTemplates[0];
    if (descTemplate?.content) {
      composition.description = this.renderTemplate(descTemplate.content, placeholders);
    }

    // Compose SEO title (model > category > global)
    const seoTitleTemplate = modelSeoTitleTemplates[0] || categorySeoTitleTemplates[0] || globalSeoTitleTemplates[0];
    if (seoTitleTemplate?.content) {
      composition.seoTitle = this.renderTemplate(seoTitleTemplate.content, placeholders);
    }

    // Compose SEO meta (model > category > global)
    const seoMetaTemplate = modelSeoMetaTemplates[0] || categorySeoMetaTemplates[0] || globalSeoMetaTemplates[0];
    if (seoMetaTemplate?.content) {
      composition.seoMeta = this.renderTemplate(seoMetaTemplate.content, placeholders);
    }

    // Merge specs (global < category < model)
    composition.specs = this.mergeSpecs(
      globalSpecsTemplates[0]?.specDefaults,
      categorySpecsTemplates[0]?.specDefaults,
      modelSpecsTemplates[0]?.specDefaults
    );

    return composition;
  }

  /**
   * Render template by replacing placeholders
   * {name} -> value from placeholders
   */
  private renderTemplate(template: string, placeholders: Record<string, string>): string {
    let result = template;
    Object.entries(placeholders).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value || '');
    });
    return result;
  }

  /**
   * Merge specs with priority: base < override1 < override2
   */
  private mergeSpecs(...specs: (Partial<Specs> | undefined)[]): Partial<Specs> {
    return specs.reduce((merged, current) => {
      if (current) {
        return { ...merged, ...current };
      }
      return merged;
    }, {} as Partial<Specs>) as Partial<Specs>;
  }

  /**
   * Create new template
   */
  async addTemplate(template: Omit<Template, 'id'>): Promise<string> {
    const templatesCollection = collection(this.firestore, 'templates');
    const now = Timestamp.now();
    const data = {
      ...template,
      active: template.active !== false,
      createdAt: now,
      updatedAt: now
    };
    const docRef = await addDoc(templatesCollection, data as any);
    return docRef.id;
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): Observable<Template | null> {
    const docRef = doc(this.firestore, `templates/${id}`);
    return from(getDoc(docRef)).pipe(
      map(doc => doc.exists() ? { id: doc.id, ...doc.data() as any } as Template : null)
    );
  }

  private templateDoc(id: string) {
    return doc(this.firestore, `templates/${id}`);
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<void> {
    const docRef = this.templateDoc(id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    const docRef = this.templateDoc(id);
    await deleteDoc(docRef);
  }
}
