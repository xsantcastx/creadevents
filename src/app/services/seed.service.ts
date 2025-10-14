import { Injectable, inject } from '@angular/core';
import { CategoryService } from './category.service';
import { MaterialService } from './material.service';
import { TemplateService } from './template.service';
import { Category, Material, Template } from '../models/catalog';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private categoryService = inject(CategoryService);
  private materialService = inject(MaterialService);
  private templateService = inject(TemplateService);

  /**
   * Seed all initial data
   */
  async seedAll(): Promise<void> {
    console.log('🌱 Starting seed process...');
    
    try {
      const categoryIds = await this.seedCategories();
      const materialIds = await this.seedMaterials();
      await this.seedTemplates(categoryIds, materialIds);
      
      console.log('✅ Seed completed successfully!');
    } catch (error) {
      console.error('❌ Seed failed:', error);
      throw error;
    }
  }

  /**
   * Seed categories (grosor-based: 12mm, 15mm, 20mm)
   */
  private async seedCategories(): Promise<Record<string, string>> {
    console.log('📁 Seeding categories...');
    
    const categories: Omit<Category, 'id'>[] = [
      {
        name: 'Formato 12mm',
        slug: '12mm',
        order: 1,
        icon: 'layers',
        defaultSpecOverrides: {
          thicknessMm: 12,
          grosor: '12mm',
          size: '160×320cm'
        },
        active: true
      },
      {
        name: 'Formato 15mm',
        slug: '15mm',
        order: 2,
        icon: 'layers',
        defaultSpecOverrides: {
          thicknessMm: 15,
          grosor: '15mm',
          size: '160×320cm'
        },
        active: true
      },
      {
        name: 'Formato 20mm',
        slug: '20mm',
        order: 3,
        icon: 'layers',
        defaultSpecOverrides: {
          thicknessMm: 20,
          grosor: '20mm',
          size: '160×320cm'
        },
        active: true
      }
    ];

    const ids: Record<string, string> = {};
    
    for (const category of categories) {
      // Check if exists
      const exists = await this.categoryService.slugExists(category.slug);
      if (!exists) {
        const id = await this.categoryService.addCategory(category);
        ids[category.slug] = id;
        console.log(`  ✓ Created category: ${category.name}`);
      } else {
        // Update existing category to ensure it has active: true
        const existingCat = await this.categoryService.getCategoryBySlug(category.slug).toPromise();
        if (existingCat && existingCat.id) {
          await this.categoryService.updateCategory(existingCat.id, { active: true });
          ids[category.slug] = existingCat.id;
          console.log(`  ✓ Updated category to active: ${category.name}`);
        } else {
          console.log(`  ⊘ Category already exists: ${category.name}`);
        }
      }
    }

    return ids;
  }

  /**
   * Seed materials from productos.json product names
   */
  private async seedMaterials(): Promise<Record<string, string>> {
    console.log('🎨 Seeding materials...');
    
    const materials: Omit<Material, 'id'>[] = [
      {
        name: 'Saint Laurent',
        slug: 'saint-laurent',
        textureHints: ['vetas oscuras', 'mármol natural', 'sofisticado'],
        defaultTags: ['mármol', 'elegante', 'premium'],
        active: true
      },
      {
        name: 'Black Gold',
        slug: 'black-gold',
        textureHints: ['contrastes dorados', 'fondo negro profundo', 'dramático'],
        defaultTags: ['negro', 'dorado', 'premium'],
        active: true
      },
      {
        name: 'Arenaria Ivory',
        slug: 'arenaria-ivory',
        textureHints: ['tonos neutros cálidos', 'textura suave', 'serenidad'],
        defaultTags: ['neutro', 'cálido', 'suave'],
        active: true
      },
      {
        name: 'Rapolano',
        slug: 'rapolano',
        textureHints: ['piedra travertino', 'texturas naturales', 'colores tierra'],
        defaultTags: ['travertino', 'natural', 'tierra'],
        active: true
      },
      {
        name: 'Konkrete',
        slug: 'konkrete',
        textureHints: ['industrial moderno', 'hormigón pulido'],
        defaultTags: ['hormigón', 'industrial', 'moderno'],
        active: true
      },
      {
        name: 'Crystal Clear',
        slug: 'crystal-clear',
        textureHints: ['cristalino', 'transparencias', 'efectos de luz'],
        defaultTags: ['cristal', 'transparente', 'luz'],
        active: true
      },
      {
        name: 'Taj Mahal',
        slug: 'taj-mahal',
        textureHints: ['mármol clásico', 'vetas sutiles', 'crema y beige'],
        defaultTags: ['mármol', 'clásico', 'beige'],
        active: true
      },
      {
        name: 'Apollo White',
        slug: 'apollo-white',
        textureHints: ['blanco puro', 'variaciones sutiles', 'elegancia atemporal'],
        defaultTags: ['blanco', 'puro', 'elegante'],
        active: true
      },
      {
        name: 'Calacatta Gold',
        slug: 'calacatta-gold',
        textureHints: ['mármol Calacatta', 'vetas doradas distintivas', 'lujo'],
        defaultTags: ['calacatta', 'dorado', 'lujo'],
        active: true
      },
      {
        name: 'Patagonia',
        slug: 'patagonia',
        textureHints: ['paisajes naturales', 'texturas únicas', 'natural'],
        defaultTags: ['natural', 'texturas', 'paisajes'],
        active: true
      },
      {
        name: 'Statuario Elegance',
        slug: 'statuario-elegance',
        textureHints: ['mármol Statuario', 'vetas dramáticas', 'elegancia'],
        defaultTags: ['statuario', 'mármol', 'elegante'],
        active: true
      },
      {
        name: 'Laponia Black',
        slug: 'laponia-black',
        textureHints: ['negro profundo', 'matices sutiles', 'nórdico'],
        defaultTags: ['negro', 'nórdico', 'profundo'],
        active: true
      }
    ];

    const ids: Record<string, string> = {};
    
    for (const material of materials) {
      const exists = await this.materialService.slugExists(material.slug);
      if (!exists) {
        const id = await this.materialService.addMaterial(material);
        ids[material.slug] = id;
        console.log(`  ✓ Created material: ${material.name}`);
      } else {
        // Update existing material to ensure it has active: true
        const existingMat = await this.materialService.getMaterialBySlug(material.slug).toPromise();
        if (existingMat && existingMat.id) {
          await this.materialService.updateMaterial(existingMat.id, { active: true });
          ids[material.slug] = existingMat.id;
          console.log(`  ✓ Updated material to active: ${material.name}`);
        } else {
          console.log(`  ⊘ Material already exists: ${material.name}`);
        }
      }
    }

    return ids;
  }

  /**
   * Seed templates
   */
  private async seedTemplates(
    categoryIds: Record<string, string>,
    materialIds: Record<string, string>
  ): Promise<void> {
    console.log('📝 Seeding templates...');
    
    // Global description template
    const globalDescTemplate: Omit<Template, 'id'> = {
      type: 'description',
      scope: 'global',
      language: 'es',
      content: 'Superficie porcelánica de gran formato con acabado {material}. Perfecta para {aplicaciones}.',
      fields: ['material', 'aplicaciones'],
      active: true
    };

    // Global SEO title template
    const globalSeoTitleTemplate: Omit<Template, 'id'> = {
      type: 'seoTitle',
      scope: 'global',
      language: 'es',
      content: '{name} {grosor} | TheLuxMining',
      fields: ['name', 'grosor'],
      active: true
    };

    // Global SEO meta template
    const globalSeoMetaTemplate: Omit<Template, 'id'> = {
      type: 'seoMeta',
      scope: 'global',
      language: 'es',
      content: '{name} en formato {grosor}. Superficie porcelánica de alta calidad para {aplicaciones}.',
      fields: ['name', 'grosor', 'aplicaciones'],
      active: true
    };

    const templates = [
      globalDescTemplate,
      globalSeoTitleTemplate,
      globalSeoMetaTemplate
    ];

    for (const template of templates) {
      await this.templateService.addTemplate(template);
      console.log(`  ✓ Created ${template.type} template (${template.scope})`);
    }

    console.log('✅ Templates seeded');
  }
}
