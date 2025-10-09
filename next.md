🧱 Goals

Admin eficiente: subir producto en 1–2 pasos; descripción, SEO y specs se autocompletan por plantillas.

Escalable: categorías (10 cm / 12 cm), materiales (onyx, mármol, etc.), variantes, galería.

Reutilizable: textos y atributos por defecto (por categoría/material) centralizados.

SEO & búsqueda: slugs únicos, campos indexados, etiquetas.

🗂️ Firestore — Colecciones y documentos
1) products (colección)

Un doc por producto comercial (no por variante). Variantes viven en un array o subcolección si crecen mucho.

// products/{productId}
{
  "name": "Onyx Imperial",
  "slug": "onyx-imperial",                  // generado
  "categoryId": "cat-10cm",               // referencia a categories
  "materialId": "mat-onyx",               // referencia a materials
  "familyId": "fam-onyx",                 // opcional: agrupar productos por familia
  "status": "published",                  // draft | published | archived
  "shortDescription": "Pieza de onyx de alta resistencia...",
  "description": "Texto final autogenerado/ajustado...",
  "specs": {                              // datos técnicos
    "thicknessMm": 10,
    "size": "10x10 cm",
    "finish": "Pulido",
    "waterAbsorption": "0.5%",
    "density": "2.6 g/cm³",
    "usage": ["Interior", "Pared"]
  },
  "variantMode": "embedded",              // embedded | subcollection
  "variants": [
    {
      "sku": "ONX-10-PLD",
      "sizeGroupId": "size-10cm",
      "finish": "Pulido",
      "colorId": "col-amber",
      "images": ["gs://.../products/onyx-imperial/main.jpg"],
      "price": null                        // si aplica vitrina precio, o null para catálogo
    }
  ],
  "coverImage": "gs://.../products/onyx-imperial/cover.jpg",
  "galleryImageIds": ["{mediaId1}", "{mediaId2}"],  // refs a media o URLs directas
  "tags": ["onyx", "10cm", "interior"],
  "seo": {
    "title": "Onyx Imperial 10x10 | TStone",
    "metaDescription": "Onyx Imperial en formato 10x10 cm...",
    "ogImage": "https://.../og/onyx-imperial.jpg"
  },
  "metrics": {
    "views": 0,
    "favorites": 0
  },
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}


Si el número de variantes por producto puede crecer (colores/formatos/acabados combinatorios), cambia variantMode a subcollection y usa products/{id}/variants/{variantId}.

2) categories

Separar lógicas de 10 cm y 12 cm, más otras que agregues.

// categories/{categoryId}
{
  "name": "Formato 10 cm",
  "slug": "10cm",
  "order": 1,
  "icon": "square-10",
  "defaultSpecOverrides": { "size": "10x10 cm", "thicknessMm": 10 },
  "descriptionTemplateId": "tmpl-cat-10cm"     // ver templates
}

3) materials

Estándar de materiales (onyx, mármol, granito, etc.).

// materials/{materialId}
{
  "name": "Onyx",
  "slug": "onyx",
  "textureHints": ["traslúcido", "vetas doradas"],
  "descriptionTemplateId": "tmpl-mat-onyx",
  "defaultTags": ["onyx", "premium"]
}

4) colors

Paleta de colores (para filtros y variantes).

// colors/{colorId}
{
  "name": "Ámbar",
  "slug": "ambar",
  "hex": "#C89B3C",
  "aliases": ["amber", "dorado"]
}

5) sizes

Grupos de tamaño (10 cm, 12 cm, etc.) para reglas y filtros.

// sizes/{sizeId}
{
  "name": "10 cm",
  "slug": "10cm",
  "display": "10x10 cm",
  "thicknessDefaultMm": 10
}

6) templates

Claves para autocompletar descripciones/SEO/specs. Puedes encadenar plantillas: por categoría, material y familia. Al crear un producto, el admin elige categoría/material y la UI compone el texto final.

// templates/{templateId}
{
  "type": "description",            // description | seoTitle | seoMeta | specs
  "scope": "material",              // material | category | family | global
  "refId": "mat-onyx",              // id del material/categoría/familia si aplica
  "language": "es",
  "content": "El {material} {name} en formato {size} ofrece {propiedad}. Ideal para {uso}.",
  "fields": ["material", "name", "size", "uso", "propiedad"]
}


Autofill flow: la UI arma payload con { name, categoryId, materialId, sizeGroupId } → busca plantillas por material + category + global → compone description, seo.title, seo.metaDescription y specs por defecto que el editor puede ajustar.

7) media

Índice de imágenes y vídeos (productos y galería). Archivos en Cloud Storage; este doc guarda metadatos y relaciones.

// media/{mediaId}
{
  "type": "image",                          // image | video
  "bucketPath": "products/onyx-imperial/cover.jpg",
  "publicUrl": "https://firebasestorage.googleapis.com/...",
  "entityType": "product",                  // product | gallery | category
  "entityId": "{productId}",
  "tags": ["cover", "ambient", "detalle"],
  "dimensions": { "w": 1920, "h": 1280 },
  "createdAt": "serverTimestamp"
}

8) gallery

Galería independiente (inspiración/ambientes) con etiquetas y vínculos a materiales/productos cuando aplique.

// gallery/{galleryId}
{
  "title": "Baño Onyx Imperial",
  "slug": "bano-onyx-imperial",
  "mediaId": "{mediaId}",
  "relatedProductIds": ["{productId}"],
  "tags": ["baño", "onyx", "interior"],
  "createdAt": "serverTimestamp"
}

9) families (opcional, útil para colecciones por material/estilo)
// families/{familyId}
{
  "name": "Colección Onyx",
  "slug": "coleccion-onyx",
  "materialId": "mat-onyx",
  "order": 1,
  "description": "Piezas inspiradas en onyx con vetas doradas."
}

🔁 Autocompletado (plantillas) – Lógica recomendada

Al crear producto:

Admin elige: name, categoryId, materialId, sizeGroupId.

UI obtiene en paralelo:

categories/{categoryId}

materials/{materialId}

sizes/{sizeGroupId}

templates por scope = material + category + global

Composer:

specs = merge(sizes.default, categories.defaultSpecOverrides, material.defaults, overrides del form)

description = render(templateMaterial) → si existe templateCategory, concat o merge.

seo.title y seo.metaDescription de plantillas seoTitle y seoMeta.

Al cambiar categoría/material:

Recalcular sugerencias, pero no sobreescribir campos si el usuario ya editó manualmente (bandera descriptionLocked: true).

🧩 TypeScript Interfaces (Angular)
export type Id = string;

export interface Product {
  id: Id;
  name: string;
  slug: string;
  categoryId: Id;
  materialId: Id;
  familyId?: Id;
  status: 'draft' | 'published' | 'archived';
  shortDescription?: string;
  description?: string;
  specs?: Specs;
  variantMode: 'embedded' | 'subcollection';
  variants?: ProductVariant[];
  coverImage?: string;                 // gs:// path or https
  galleryImageIds?: Id[];
  tags?: string[];
  seo?: Seo;
  metrics?: { views: number; favorites: number; };
  createdAt: any; updatedAt: any;
}

export interface Specs {
  thicknessMm?: number;
  size?: string;
  finish?: string;
  waterAbsorption?: string;
  density?: string;
  usage?: string[];
}

export interface ProductVariant {
  id?: Id;
  sku?: string;
  sizeGroupId?: Id;
  finish?: string;
  colorId?: Id;
  images?: string[];                   // gs:// or media ids
  price?: number | null;
}

export interface Category {
  id: Id;
  name: string;
  slug: string;
  order?: number;
  icon?: string;
  defaultSpecOverrides?: Partial<Specs>;
  descriptionTemplateId?: Id;
}

export interface Material {
  id: Id;
  name: string;
  slug: string;
  descriptionTemplateId?: Id;
  defaultTags?: string[];
}

export interface SizeGroup {
  id: Id;
  name: string;        // '10 cm'
  slug: string;        // '10cm'
  display: string;     // '10x10 cm'
  thicknessDefaultMm?: number;
}

export interface Template {
  id: Id;
  type: 'description' | 'seoTitle' | 'seoMeta' | 'specs';
  scope: 'material' | 'category' | 'family' | 'global';
  refId?: Id;
  language: 'es' | 'en';
  content?: string;                     // para description/seo
  specDefaults?: Partial<Specs>;        // si type === 'specs'
  fields?: string[];
}

export interface Media {
  id: Id;
  type: 'image' | 'video';
  bucketPath: string;
  publicUrl?: string;
  entityType?: 'product' | 'gallery' | 'category';
  entityId?: Id;
  tags?: string[];
  dimensions?: { w: number; h: number; };
  createdAt: any;
}

export interface GalleryItem {
  id: Id;
  title: string;
  slug: string;
  mediaId: Id;
  relatedProductIds?: Id[];
  tags?: string[];
  createdAt: any;
}

export interface Seo {
  title?: string;
  metaDescription?: string;
  ogImage?: string;
}

🗄️ Cloud Storage — Rutas recomendadas
/products/{slug}/cover.jpg
/products/{slug}/variants/{variantId}/image-1.jpg
/products/{slug}/ambient/ambient-1.jpg
/gallery/{slug}/image.jpg
/tmp/uploads/{uid}/{filename}


Mantén slug como single source of truth para carpetas. Usa Cloud Functions para generar miniaturas (/thumbs/) y rellenar media con dimensiones/URL públicas.

🔐 Reglas de seguridad (borrador)
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function isAdmin() {
      return request.auth.token.admin == true;
    }

    match /products/{id} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /categories/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /materials/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /templates/{id} {
      allow read: if isAdmin();      // opcional: ocultar al público
      allow write: if isAdmin();
    }

    match /media/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /gallery/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}


En Storage: permitir lectura pública de /products/** y /gallery/** si necesitas imágenes públicas; subida sólo admin. Generar URLs firmadas si prefieres privado.

⚡ Cloud Functions recomendadas

onProductCreate

Generar slug único (slugify(name) + dedupe).

Combinar plantillas (material, category, global) → description, seo.

Auto-rellenar specs (merge de defaults).

Normalizar/añadir tags por material.defaultTags.

onFileUpload (Storage trigger)

Generar miniaturas y registrar/actualizar media con dimensiones + publicUrl.

onProductUpdate

Si cambia name, re-generar slug sólo si slugLocked !== true.

Mantener índices derivados (ej. search_name en minúsculas, keywords).

🔎 Índices y performance (Firestore)

Simple:

products por status + categoryId

products por materialId + status

gallery por tags (array-contains)

Compuestos:

status + categoryId + materialId

status + tags (array-contains)

Campos derivados:

search_name = name.toLowerCase() (para búsquedas client-side sin servicio externo)

keywords (array) generadas de name, material, category para filtros rápidos

Si más adelante necesitas full-text real, plug & play con Algolia o Elastic/FlexSearch.

🧭 Flujo de Admin (UI)

Crear Producto

Paso 1: name, category, material, sizeGroup

Paso 2: ver “Pre-Relleno” (description, specs, seo) con plantillas → el admin edita.

Paso 3: subir cover y galería (arrastrar/soltar) → guarda media.

Publicar → status = published.

Plantillas

CRUD de templates por scope. Vista previa en vivo con {placeholders}.

Checkbox “Bloquear descripción” para evitar que futuros cambios de plantilla pisen texto ya revisado.

Galería

Subir imagen → elige tags + productos relacionados.

🧪 Datos de ejemplo mínimos

categories/cat-10cm

{ "name": "Formato 10 cm", "slug": "10cm", "defaultSpecOverrides": { "size": "10x10 cm", "thicknessMm": 10 } }


materials/mat-onyx

{ "name": "Onyx", "slug": "onyx", "defaultTags": ["onyx","premium"], "descriptionTemplateId": "tmpl-mat-onyx" }


templates/tmpl-mat-onyx

{
  "type": "description",
  "scope": "material",
  "refId": "mat-onyx",
  "language": "es",
  "content": "El {name} en {size} de {material} destaca por su {propiedad}. Ideal para {uso}.",
  "fields": ["name","size","material","propiedad","uso"]
}


products/prod-onyx-imperial

{
  "name": "Onyx Imperial",
  "slug": "onyx-imperial",
  "categoryId": "cat-10cm",
  "materialId": "mat-onyx",
  "status": "draft",
  "variantMode": "embedded",
  "variants": [
    { "sku": "ONX-10-PLD", "sizeGroupId": "size-10cm", "finish": "Pulido", "colorId": "col-amber" }
  ]
}

✅ Por qué esta estructura te conviene

Autofill real: plantillas por material/categoría + defaults de size → menos escritura manual.

SEO limpio: slug y campos seo por doc; fácil generar sitemaps.

Admin simple: entidades pequeñas y claras; media centralizada.

Escalable: puedes pasar variants a subcolección sin romper el front.

Rápida en Angular: interfaces tipadas, consultas simples, índices previsibles.