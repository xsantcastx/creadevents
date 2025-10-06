# TopStone – Guía de Rediseño (Angular + Tailwind)

> **Objetivo**: Rediseñar **TopStone** para que evoque la estética limpia, aspiracional y editorial de la referencia (look & feel tipo Caesarstone), respetando navegación en español y la estructura de menús solicitada.

---

## 1) Principios de diseño

* **Estética**: minimal, elegante, centrada en **fotografías a pantalla completa** de las superficies (mármol/porcelánico). Espacios amplios, mucho white/negative space.
* **Jerarquía**: tipografía grande en títulos (hero/colecciones), subtítulos ligeros, párrafos cortos.
* **Ritmo editorial**: secciones que alternan fondo claro/oscuro, mosaicos, y bloques con textos superpuestos a imágenes.
* **Movimiento sutil**: fade/slide-up en scroll, parallax leve en hero, hover a 2–3% de zoom + sombra suave en tarjetas.
* **Consistencia**: mismas proporciones para cartas de producto, misma relación de aspecto en galerías.

---

## 2) Paleta y tipografía

* **Paleta** (tokens Tailwind):

  * `--ts-bg`: `#0E0F10` (fondo hero/sections oscuras)
  * `--ts-bg-soft`: `#111316`
  * `--ts-ink`: `#F4F5F6` (texto sobre fondo oscuro)
  * `--ts-ink-soft`: `#D6D9DE`
  * `--ts-accent`: `#C8A96B` (oro cálido, acentos)
  * `--ts-line`: `#23262B` (líneas, bordes sutiles)
  * `--ts-paper`: `#FAFAFB` (fondo claro)

* **Tipografía**:

  * Títulos: **"Playfair Display"** o **"Cormorant Garamond"** (serif editorial)
  * Texto UI y párrafos: **"Inter"** o **"Manrope"** (sans limpia)

> *Si usas Tailwind, añade ambas fuentes via Google Fonts en `index.html`.*

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet">
```

```css
/* tailwind.css (o globals.css) */
:root {
  --ts-bg:#0E0F10; --ts-bg-soft:#111316; --ts-ink:#F4F5F6; --ts-ink-soft:#D6D9DE;
  --ts-accent:#C8A96B; --ts-line:#23262B; --ts-paper:#FAFAFB;
}
.body-dark { background:var(--ts-bg); color:var(--ts-ink);}
.font-serif { font-family:"Playfair Display", ui-serif, serif; }
.font-sans { font-family:"Inter", ui-sans-serif, system-ui; }
```

---

## 3) Información de navegación (header)

* **Header fijo** con logo centrado a la izquierda y menú a la derecha:

  * `Top Stone (Logo)`  ·  `Home` · `Productos` · `Galería` · `Datos técnicos` · `Contacto`
* **Productos** abre **mega-menú** con 3 columnas (12mm / 15mm / 20mm), cada una con lista de items (ver datos en §7). Hover con imagen preview a la derecha.
* **Estado scrolled**: reduce altura, añade fondo semitransparente oscuro `bg-[#0E0F10]/60` y blur `backdrop-blur`.

```html
<!-- app.component.html: header sketch -->
<header class="fixed inset-x-0 top-0 z-50 transition-all" [class.bg-opacity-60]="scrolled" [class.backdrop-blur]="scrolled">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <a routerLink="/" class="flex items-center gap-3">
      <img src="/assets/logo_topstone.svg" alt="TopStone" class="h-8"/>
    </a>
    <nav class="hidden md:flex items-center gap-8 font-sans text-sm">
      <a routerLink="/" class="hover:text-[var(--ts-accent)]">Home</a>
      <div class="relative group">
        <button class="hover:text-[var(--ts-accent)]">Productos</button>
        <!-- mega menu -->
        <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute right-0 mt-4 w-[920px] p-6 rounded-2xl bg-[var(--ts-paper)] text-black shadow-xl grid grid-cols-4 gap-6">
          <div>
            <h4 class="font-semibold mb-3">12mm (160×320cm)</h4>
            <ul class="space-y-2">
              <li><a routerLink="/productos/12mm/saint-laurent" class="hover:text-[var(--ts-accent)]">Saint Laurent</a></li>
              <!-- … -->
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-3">15mm (160×320cm)</h4>
            <!-- … -->
          </div>
          <div>
            <h4 class="font-semibold mb-3">20mm (160×320cm)</h4>
            <!-- … -->
          </div>
          <div class="rounded-xl overflow-hidden">
            <img [src]="hoverPreviewUrl" alt="Preview" class="w-full h-full object-cover"/>
          </div>
        </div>
      </div>
      <a routerLink="/galeria" class="hover:text-[var(--ts-accent)]">Galería</a>
      <a routerLink="/datos-tecnicos" class="hover:text-[var(--ts-accent)]">Datos técnicos</a>
      <a routerLink="/contacto" class="hover:text-[var(--ts-accent)]">Contacto</a>
    </nav>
  </div>
</header>
```

---

## 4) Arquitectura Angular

**Rutas**

```ts
// app.routes.ts
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'productos', loadChildren: () => import('./pages/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES) },
  { path: 'galeria', loadComponent: () => import('./pages/galeria/galeria.component').then(m => m.GaleriaComponent) },
  { path: 'datos-tecnicos', loadComponent: () => import('./pages/datos/datos.component').then(m => m.DatosComponent) },
  { path: 'contacto', loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent) },
  { path: '**', redirectTo: '' }
];
```

**Subrutas de Productos**

```ts
// productos.routes.ts
export const PRODUCTOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./listado/listado.component').then(m => m.ListadoComponent) },
  { path: ':grosor', children: [
      { path: '', loadComponent: () => import('./grosor/grosor.component').then(m => m.GrosorComponent) },
      { path: ':slug', loadComponent: () => import('./detalle/detalle.component').then(m => m.DetalleComponent) },
    ]
  }
];
```

**Estructura**

```
src/
  pages/
    home/
    productos/
      listado/
      grosor/
      detalle/
    galeria/
    datos/
    contacto/
  components/
    hero/
    product-card/
    grid-masonry/
    accordion/
    contact-form/
  data/ (json / services)
  assets/
    productos/12mm/*.jpg
    productos/15mm/*.jpg
    productos/20mm/*.jpg
    galeria/{cocinas,banos,fachadas,industria,otros}/*.jpg
```

---

## 5) Home (1-1)

* **Hero** imagen de gran formato (vídeo opcional silencioso, loop), claim y CTA hacia productos.
* **Bloques**: "Colección 12mm / 15mm / 20mm" en cards grandes, con hover zoom leve.
* **Sección de propuesta**: 3 columnas (Diseño, Resistencia, Aplicaciones) con iconos lineales.
* **CTA a Galería**. **CTA a Contacto**.

```html
<section class="relative h-[80vh] min-h-[560px] overflow-hidden body-dark">
  <img src="/assets/hero.jpg" class="absolute inset-0 w-full h-full object-cover opacity-70" alt="TopStone"/>
  <div class="relative h-full flex flex-col items-start justify-end max-w-7xl mx-auto px-6 pb-16">
    <h1 class="font-serif text-5xl md:text-6xl tracking-tight">Belleza atemporal en superficies porcelánicas</h1>
    <p class="mt-4 max-w-xl text-[var(--ts-ink-soft)]">TopStone ofrece placas de gran formato para cocinas, baños y fachadas. Diseño, resistencia y versatilidad.</p>
    <div class="mt-8 flex gap-4">
      <a routerLink="/productos" class="px-6 py-3 rounded-full bg-[var(--ts-accent)] text-black font-semibold">Ver productos</a>
      <a routerLink="/galeria" class="px-6 py-3 rounded-full ring-1 ring-white/40">Inspiración</a>
    </div>
  </div>
</section>
```

---

## 6) Productos (1-2)

* **Listado por grosor**: tabs o subtabs `12mm | 15mm | 20mm`.
* **Tarjetas**: imagen principal (textura en grande), nombre, grosor, botón “Ver ficha”.
* **Filtro** (opcional): color (claros/oscuros), veteado (suave/marcado), aplicación (cocina/baño/fachada/industria), acabado (mate/pulido).

**Componente Card**

```html
<article class="group rounded-2xl overflow-hidden bg-[var(--ts-paper)] shadow hover:shadow-lg transition">
  <div class="aspect-[4/3] overflow-hidden">
    <img [src]="producto.cover" [alt]="producto.nombre" class="w-full h-full object-cover group-hover:scale-[1.02] transition"/>
  </div>
  <div class="p-4">
    <h3 class="font-serif text-xl">{{ producto.nombre }}</h3>
    <p class="text-sm text-neutral-600">{{ producto.medida }} · {{ producto.grosor }}</p>
    <a [routerLink]="['/productos', producto.grosorSlug, producto.slug]" class="mt-3 inline-block text-[var(--ts-accent)]">Ver ficha →</a>
  </div>
</article>
```

**Detalle de producto**

* Galería (2–4 imágenes), descripción, especificaciones (tabla), descargas (PDF ficha técnica), aplicaciones recomendadas, CTA contacto.

---

## 7) Datos (modelo) – Productos

> Define la colección en un `JSON` o **Firestore**. Ejemplo mínimo en JSON:

```json
[
  {"nombre":"Saint Laurent","slug":"saint-laurent","grosor":"12mm","grosorSlug":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/saint-laurent.jpg"},
  {"nombre":"Black Gold","slug":"black-gold","grosor":"12mm","grosorSlug":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/black-gold.jpg"}
]
```

**Estructura completa a cargar**

* **12mm**: Saint Laurent, Black Gold, Arenaria Ivory, Rapolano, Konkrete, Bercy Terra, Limestone Ivory, Crystal Clear, Taj Mahal, Apollo White, Calacatta Gold, Patagonia
* **15mm**: Statuario Elegance, Laponia Black, Patagonia Natural
* **20mm**: Saint Laurent, Black Gold, Arenaria Ivory, Limestone Ivory, Crystal Clear, Taj Mahal, Apollo White, Calacatta Gold, Patagonia

---

## 8) Galería (1-3)

Categorías: **Cocinas**, **Baños**, **Fachadas**, **Industria**, **Otros trabajos**.

* **Masonry** con lazy-loading (`loading="lazy"`).
* Vista modal a pantalla completa con navegación izquierda/derecha.
* Filtro por categoría y (opcional) por producto asociado.

---

## 9) Datos técnicos (1-4)

Secciones:

* **Acabados de superficie**: texto + fotos comparativas (mate, pulido, satinado, etc.).
* **Fichas técnicas**: lista de PDFs por producto (o una ficha general). Añadir ícono de descarga y tamaño.
* **Packing**: tabla con información de embalaje (pallet, número de piezas, peso aproximado, etc.).
* **Acabados de bordes**: imágenes de canto recto, biselado, redondeado.
* **Fijaciones en fachada**: diagrama + texto.

> Usa **acordeones** para evitar scroll excesivo.

```html
<ts-accordion>
  <ts-accordion-item title="Acabados de superficie">
    <!-- contenido -->
  </ts-accordion-item>
  <ts-accordion-item title="Fichas técnicas">
    <!-- listado de PDF -->
  </ts-accordion-item>
</ts-accordion>
```

---

## 10) Contacto (1-5)

* Datos de dirección, email, teléfono (con `tel:`/`mailto:`). Mapa embebido opcional.
* Formulario (nombre, email, teléfono, mensaje). Checkbox GDPR/consentimiento.
* Envío vía **Cloud Functions** o **EmailJS**/**Formspree** si se prefiere sin backend propio.

```ts
// contacto.service.ts (ejemplo con fetch a Cloud Function)
submit(payload: Contacto) {
  return fetch('https://<region>-<project>.cloudfunctions.net/sendMail', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
  });
}
```

---

## 11) Admin & contenido (opcional pero recomendado)

* **Firebase** (Hosting + Firestore + Storage + Functions):

  * **Firestore**: colecciones `productos`, `galeria`, `fichas`.
  * **Storage**: `productos/{grosor}/{slug}/cover.jpg`, `galeria/{categoria}/img_*.jpg`, `fichas/{slug}.pdf`.
  * **Rules** seguras + panel admin simple (login con Google) para subir imágenes y editar metadatos.

---

## 12) Accesibilidad & SEO

* `alt` descriptivos en imágenes. Contraste AA.
* Navegación por teclado en menús y modales.
* Títulos `<h1..h3>` bien estructurados.
* **SEO**: títulos y descripciones en **español**, `og:` y `twitter:` tags, `sitemap.xml`, `robots.txt`.

```html
<!-- meta ejemplo -->
<meta name="description" content="TopStone: superficies porcelánicas de gran formato para cocinas, baños y fachadas. Calidad y diseño."/>
<meta property="og:title" content="TopStone – Porcelánico de gran formato"/>
<meta property="og:image" content="/assets/og.jpg"/>
```

---

## 13) Rendimiento

* **Imágenes**: genera variantes (`.webp`, `srcset`) y `preload` del hero.
* **Lazy-load** rutas (standalone components) y módulos pesados.
* **CDN** para assets estáticos si es necesario.
* **CLS**: fija alturas con `aspect-[ratio]` en tarjetas y gallery.

---

## 14) Microcopys (ES) sugeridos

* Hero: *“Belleza atemporal en superficies porcelánicas”*
* Sub: *“Placas de 160×320 cm en 12/15/20 mm para proyectos residenciales e industriales.”*
* CTA: *“Ver productos”*, *“Explorar galería”*, *“Solicitar información”*
* Contacto: *“Cuéntanos tu proyecto y te asesoramos.”*

---

## 15) Tailwind + Angular setup (resumen)

1. `ng add @ngneat/tailwind` o configuración manual.
2. Activa **JIT** y paths en `tailwind.config.js` (`./src/**/*.{html,ts}`).
3. Crea utilidades con `:root` (ver §2) y usa clases utilitarias para consistencia.

```js
// tailwind.config.js (fragmento)
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        ts: {
          bg: "var(--ts-bg)", ink: "var(--ts-ink)", accent: "var(--ts-accent)", paper:"var(--ts-paper)", line:"var(--ts-line)"
        }
      },
      boxShadow: { soft: '0 10px 30px -12px rgba(0,0,0,.35)'}
    }
  }
}
```

---

## 16) Animaciones sutiles

* Usa `@angular/animations` con `IntersectionObserver` para disparar **fade/slide-up**.
* Duraciones: 250–400ms, easing `ease-out`.
* Evita animaciones exageradas; prioriza elegancia.

---

## 17) Plan de implementación (sprints)

**Sprint 1 – Base & Home**

* Tailwind + fuentes + tokens.
* Header sticky + mega-menú.
* Hero + secciones de colección.

**Sprint 2 – Productos**

* Datos (JSON/Firestore) y páginas `12/15/20mm`.
* Tarjetas + filtros básicos.
* Página de detalle con tabla de especificaciones.

**Sprint 3 – Galería**

* Masonry + modal full-screen + categorías.

**Sprint 4 – Datos técnicos**

* Acordeones + descargas PDF + tablas de packing.

**Sprint 5 – Contacto**

* Form + validaciones + envío (Function o EmailJS).

**Sprint 6 – SEO/Perf**

* Metas, OG, sitemap, compresión y lazy.

---

## 18) Tabla de especificaciones (ejemplo)

| Propiedad                 | Valor         |
| ------------------------- | ------------- |
| Medida                    | 160 × 320 cm  |
| Grosor                    | 12 mm         |
| Acabado                   | Mate / Pulido |
| Absorción de agua         | ≤ 0,5%        |
| Resistencia a la abrasión | Clase 4       |
| Resistencia a químicos    | Alta          |

---

## 19) Estructura de Datos Técnicos

```json
{
  "acabados": ["Mate","Pulido","Satinado"],
  "fichas": [
    {"nombre":"Ficha general","url":"/assets/fichas/topstone-ficha-general.pdf","tamano":"1.8MB"}
  ],
  "packing": [
    {"grosor":"12mm","piezasPorPallet":10,"pesoAprox":"350kg"},
    {"grosor":"15mm","piezasPorPallet":8,"pesoAprox":"360kg"}
  ],
  "bordes": ["Canto recto","Biselado","Radio"]
}
```

---

## 20) QA checklist

* [ ] Logo SVG nítido en retina.
* [ ] Menú productos correcto (12/15/20mm) y enlaces válidos.
* [ ] Todas las imágenes con `alt` y `loading="lazy"`.
* [ ] CLS controlado con `aspect-*` en cards y gallery.
* [ ] Formularios con validaciones + mensajes en español.
* [ ] Metas y `og:` en todas las páginas clave.
* [ ] 404 redirige a Home.

---

## 21) Entregables

* Código Angular (rutas + componentes + estilos base).
* JSON/Firestore seeds de productos, galería y datos técnicos.
* Guía de contenido para cliente (qué fotos, medidas y PDF aportar).

---

## 22) Cómo mantener el look "premium"

* Fotografías **muy** cuidadas: texturas bien iluminadas, sin ruido.
* Mucho aire: paddings generosos (`py-20`, `lg:py-28`).
* Tipografía serif en títulos y sans en párrafos.
* Acentos **sutiles** en oro (`--ts-accent`) y jamás recargar.

---
ANEXO: Adaptación al repo feature/redesign + Seeds JSON

A continuación te dejo archivos listos para pegar en tu repo. Incluye: rutas Angular, componentes base, assets con JSON seeds (productos, galería y datos técnicos), y configuración para que Angular sirva estos JSON.

A) Estructura de carpetas propuesta
src/
  app/
    app.routes.ts
    core/
      services/
        data.service.ts
    pages/
      home/
        home.component.ts
        home.component.html
      productos/
        productos.routes.ts
        listado/
          listado.component.ts
          listado.component.html
        grosor/
          grosor.component.ts
          grosor.component.html
        detalle/
          detalle.component.ts
          detalle.component.html
      galeria/
        galeria.component.ts
        galeria.component.html
      datos/
        datos.component.ts
        datos.component.html
      contacto/
        contacto.component.ts
        contacto.component.html
  assets/
    data/
      productos.json
      galeria.json
      datos_tecnicos.json
    productos/
      12mm/ (imágenes)
      15mm/
      20mm/
    galeria/
      cocinas/
      banos/
      fachadas/
      industria/
      otros/

angular.json → asegúrate de incluir src/assets en assets (suele venir por defecto).

B) Seeds JSON (copiar en src/assets/data/)
1) productos.json
{
  "items": [
    {"nombre":"Saint Laurent","slug":"saint-laurent","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/saint-laurent.jpg"},
    {"nombre":"Black Gold","slug":"black-gold","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/black-gold.jpg"},
    {"nombre":"Arenaria Ivory","slug":"arenaria-ivory","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/arenaria-ivory.jpg"},
    {"nombre":"Rapolano","slug":"rapolano","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/rapolano.jpg"},
    {"nombre":"Konkrete","slug":"konkrete","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/konkrete.jpg"},
    {"nombre":"Bercy Terra","slug":"bercy-terra","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/bercy-terra.jpg"},
    {"nombre":"Limestone Ivory","slug":"limestone-ivory","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/limestone-ivory.jpg"},
    {"nombre":"Crystal Clear","slug":"crystal-clear","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/crystal-clear.jpg"},
    {"nombre":"Taj Mahal","slug":"taj-mahal","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/taj-mahal.jpg"},
    {"nombre":"Apollo White","slug":"apollo-white","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/apollo-white.jpg"},
    {"nombre":"Calacatta Gold","slug":"calacatta-gold","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/calacatta-gold.jpg"},
    {"nombre":"Patagonia","slug":"patagonia","grosor":"12mm","medida":"160x320cm","cover":"/assets/productos/12mm/patagonia.jpg"},


    {"nombre":"Statuario Elegance","slug":"statuario-elegance","grosor":"15mm","medida":"160x320cm","cover":"/assets/productos/15mm/statuario-elegance.jpg"},
    {"nombre":"Laponia Black","slug":"laponia-black","grosor":"15mm","medida":"160x320cm","cover":"/assets/productos/15mm/laponia-black.jpg"},
    {"nombre":"Patagonia Natural","slug":"patagonia-natural","grosor":"15mm","medida":"160x320cm","cover":"/assets/productos/15mm/patagonia-natural.jpg"},


    {"nombre":"Saint Laurent","slug":"saint-laurent-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/saint-laurent.jpg"},
    {"nombre":"Black Gold","slug":"black-gold-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/black-gold.jpg"},
    {"nombre":"Arenaria Ivory","slug":"arenaria-ivory-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/arenaria-ivory.jpg"},
    {"nombre":"Limestone Ivory","slug":"limestone-ivory-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/limestone-ivory.jpg"},
    {"nombre":"Crystal Clear","slug":"crystal-clear-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/crystal-clear.jpg"},
    {"nombre":"Taj Mahal","slug":"taj-mahal-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/taj-mahal.jpg"},
    {"nombre":"Apollo White","slug":"apollo-white-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/apollo-white.jpg"},
    {"nombre":"Calacatta Gold","slug":"calacatta-gold-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/calacatta-gold.jpg"},
    {"nombre":"Patagonia","slug":"patagonia-20","grosor":"20mm","medida":"160x320cm","cover":"/assets/productos/20mm/patagonia.jpg"}
  ]
}
2) galeria.json
{
  "categorias": [
    {
      "slug": "cocinas",
      "titulo": "Cocinas",
      "items": [
        {"src":"/assets/galeria/cocinas/c1.jpg","alt":"Isla en Patagonia","producto":"patagonia"},
        {"src":"/assets/galeria/cocinas/c2.jpg","alt":"Encimera Calacatta Gold","producto":"calacatta-gold"}
      ]
    },
    {
      "slug": "banos",
      "titulo": "Baños",
      "items": [
        {"src":"/assets/galeria/banos/b1.jpg","alt":"Lavabo Apollo White","producto":"apollo-white"}
      ]
    },
    {
      "slug": "fachadas",
      "titulo": "Fachadas",
      "items": [
        {"src":"/assets/galeria/fachadas/f1.jpg","alt":"Fachada Konkrete","producto":"konkrete"}
      ]
    },
    {
      "slug": "industria",
      "titulo": "Industria",
      "items": [
        {"src":"/assets/galeria/industria/i1.jpg","alt":"Superficie industrial Limestone Ivory","producto":"limestone-ivory"}
      ]
    },
    {
      "slug": "otros",
      "titulo": "Otros trabajos",
      "items": [
        {"src":"/assets/galeria/otros/o1.jpg","alt":"Mostrador Crystal Clear","producto":"crystal-clear"}
      ]
    }
  ]
}
3) datos_tecnicos.json
{
  "acabadosSuperficie": [
    {"nombre":"Mate","descripcion":"Superficie con bajo brillo, tacto suave."},
    {"nombre":"Pulido","descripcion":"Alto brillo que realza las vetas."},
    {"nombre":"Satinado","descripcion":"Equilibrio entre mate y pulido."}
  ],
  "fichasTecnicas": [
    {"nombre":"Ficha general TopStone","url":"/assets/fichas/topstone-ficha-general.pdf","tamano":"1.8MB"}
  ],
  "packing": [
    {"grosor":"12mm","piezasPorPallet":10,"pesoAprox":"~350kg"},
    {"grosor":"15mm","piezasPorPallet":8,"pesoAprox":"~360kg"},
    {"grosor":"20mm","piezasPorPallet":6,"pesoAprox":"~380kg"}
  ],
  "acabadosBordes": [
    {"nombre":"Canto recto","img":"/assets/datos/borde-recto.jpg"},
    {"nombre":"Biselado","img":"/assets/datos/biselado.jpg"},
    {"nombre":"Radio","img":"/assets/datos/radio.jpg"}
  ],
  "fijacionesFachada": {
    "descripcion":"Sistemas de anclaje mecánico para placas de gran formato.",
    "img":"/assets/datos/fachada-anclaje.jpg"
  }
}

Nota: deja las rutas de imágenes tal cual y ve reemplazando con tus assets reales.

C) Servicio de datos (cargar JSON locales)

src/app/core/services/data.service.ts

import { Injectable } from '@angular/core';


export interface Producto { nombre:string; slug:string; grosor:'12mm'|'15mm'|'20mm'; medida:string; cover:string }
export interface CategoriaGaleria { slug:string; titulo:string; items:{src:string; alt:string; producto?:string}[] }


@Injectable({ providedIn: 'root' })
export class DataService {
  productos = fetch('/assets/data/productos.json').then(r=>r.json());
  galeria = fetch('/assets/data/galeria.json').then(r=>r.json());
  datosTecnicos = fetch('/assets/data/datos_tecnicos.json').then(r=>r.json());
}

Si luego migras a Firestore, cambia el DataService para leer colecciones.

D) Rutas Angular listas

src/app/app.routes.ts

import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'productos', loadChildren: () => import('./pages/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES) },
  { path: 'galeria', loadComponent: () => import('./pages/galeria/galeria.component').then(m => m.GaleriaComponent) },
  { path: 'datos-tecnicos', loadComponent: () => import('./pages/datos/datos.component').then(m => m.DatosComponent) },
  { path: 'contacto', loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent) },
  { path: '**', redirectTo: '' }
];

src/app/pages/productos/productos.routes.ts

import { Routes } from '@angular/router';


export const PRODUCTOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./listado/listado.component').then(m => m.ListadoComponent) },
  { path: ':grosor', children: [
      { path: '', loadComponent: () => import('./grosor/grosor.component').then(m => m.GrosorComponent) },
      { path: ':slug', loadComponent: () => import('./detalle/detalle.component').then(m => m.DetalleComponent) },
    ] },
];
E) Componentes base (stubs rápidos)

home.component.ts

import { Component } from '@angular/core';


@Component({
  standalone: true,
  selector: 'ts-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {}

home.component.html

<section class="relative h-[80vh] min-h-[560px] overflow-hidden body-dark">
  <img src="/assets/hero.jpg" class="absolute inset-0 w-full h-full object-cover opacity-70" alt="TopStone"/>
  <div class="relative h-full flex flex-col items-start justify-end max-w-7xl mx-auto px-6 pb-16">
    <h1 class="font-serif text-5xl md:text-6xl tracking-tight">Belleza atemporal en superficies porcelánicas</h1>
    <p class="mt-4 max-w-xl text-[var(--ts-ink-soft)]">Placas de 160×320 cm en 12/15/20 mm para cocinas, baños y fachadas.</p>
    <div class="mt-8 flex gap-4">
      <a routerLink="/productos" class="px-6 py-3 rounded-full bg-[var(--ts-accent)] text-black font-semibold">Ver productos</a>
      <a routerLink="/galeria" class="px-6 py-3 rounded-full ring-1 ring-white/40">Inspiración</a>
    </div>
  </div>
</section>

listado.component.html (grid por grosor)

<div class="max-w-7xl mx-auto px-6 py-16">
  <h2 class="font-serif text-3xl mb-6">Productos</h2>
  <div class="flex gap-3 mb-8">
    <a routerLink="/productos/12mm" class="px-4 py-2 rounded-full ring-1 ring-[var(--ts-line)] hover:bg-[var(--ts-paper)]">12mm</a>
    <a routerLink="/productos/15mm" class="px-4 py-2 rounded-full ring-1 ring-[var(--ts-line)] hover:bg-[var(--ts-paper)]">15mm</a>
    <a routerLink="/productos/20mm" class="px-4 py-2 rounded-full ring-1 ring-[var(--ts-line)] hover:bg-[var(--ts-paper)]">20mm</a>
  </div>
  <!-- Aquí puedes mapear tarjetas por grosor -->
  <router-outlet></router-outlet>
</div>

grosor.component.ts

import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';


@Component({
  standalone: true,
  imports:[RouterLink],
  templateUrl: './grosor.component.html'
})
export class GrosorComponent {
  grosor = this.route.snapshot.paramMap.get('grosor') as '12mm'|'15mm'|'20mm';
  constructor(private route: ActivatedRoute) {}
}

grosor.component.html

<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Simulación: en producción, filtra desde DataService.productos por grosor -->
  <!-- <ts-product-card *ngFor="let p of productosFiltrados" [producto]="p"></ts-product-card> -->
  <p class="text-neutral-500">(Conecta con DataService y filtra por {{grosor}})</p>
</div>

detalle.component.html (esqueleto)

<section class="max-w-7xl mx-auto px-6 py-12">
  <div class="grid lg:grid-cols-2 gap-10">
    <div class="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--ts-paper)]">
      <img src="/assets/productos/12mm/saint-laurent.jpg" class="w-full h-full object-cover" alt="Producto"/>
    </div>
    <div>
      <h1 class="font-serif text-4xl">Nombre del producto</h1>
      <p class="mt-2 text-neutral-600">160×320cm · 12mm</p>
      <div class="mt-6 prose prose-invert max-w-none">
        <p>Descripción breve del material, vetas y aplicaciones sugeridas.</p>
      </div>
      <a href="/assets/fichas/topstone-ficha-general.pdf" class="mt-6 inline-block text-[var(--ts-accent)]">Descargar ficha técnica →</a>
    </div>
  </div>
</section>
F) Menú y mega-menú (recordatorio)

Usa el bloque del header de la guía principal. Para hover preview del mega-menú, escucha mouseover en cada item y actualiza hoverPreviewUrl con su cover.

G) Próximos pasos inmediatos

Crear carpetas y pegar seeds (productos.json, galeria.json, datos_tecnicos.json).

Subir 2–3 imágenes de ejemplo por categoría y algunas de productos (nombres según rutas de los JSON).

Conectar DataService en grosor/listado/detalle para pintar datos reales.

Ajustar tipografías/paleta de la guía principal.

Subir a tu rama feature/redesign y verificar en el deploy.


Puedes ver images en src/assets



Here’s how to fix the “images not showing” + the best way to store them going forward:

Quick diagnosis (likely causes)

Assets not tracked: the src/assets/... folders exist locally but weren’t git add-ed and pushed.

Wrong folder: images are in public/ but you’re referencing /assets/... (or vice-versa).

Path mismatch: using leading /assets/... vs assets/... with routing can 404 on some hosts.

angular.json not copying assets: the assets array doesn’t include src/assets (or your public/ mapping).

Case sensitivity: Calacatta-Gold.jpg vs calacatta-gold.jpg (works on Windows, breaks on hosting).

JSON path: productos.json points to images that aren’t there or use a wrong relative path.

SPA rewrite catching assets (rare on Firebase): misconfigured firebase.json rewrites.

The simplest & fastest approach (static assets)

For a catalog of ~30–40 productos, keep binaries as static files and keep only metadata as JSON (or Firestore later). It’s fastest, cheap, SEO-friendly, and avoids async image URL code.

Do this now:

Put images here
src/assets/productos/{12mm|15mm|20mm}/<slug>.jpg
src/assets/galeria/{cocinas|banos|fachadas|industria|otros}/*.jpg

Ensure Angular copies assets (check angular.json > projects.app.architect.build.options.assets)
Add both src/assets and (if you want to use a public/ folder) the mapping below:

"assets": [
  "src/favicon.ico",
  "src/assets",
  { "glob": "**/*", "input": "public", "output": "/" }
]


Use safe paths in templates & JSON

In templates: use src="assets/..." (no leading slash).

In JSON: use "cover": "assets/productos/12mm/saint-laurent.jpg" (no leading slash).

When fetching JSON: fetch('assets/data/productos.json') (no leading slash).
This respects <base href="/"> and avoids subpath gotchas.

Commit the files

git add src/assets
git commit -m "add product & gallery assets"
git push origin feature/redesign


Check in DevTools → Network
Reload the app and look for 404s on your image URLs. If you see /productos/12mm/...jpg being requested without assets/, your JSON/HTML path is wrong.

What I recommend for TopStone right now

Go static first (put images in src/assets/... and reference assets/... in JSON & templates). It’s aligned with the Caesarstone-like site (curated, not UGC) and is the quickest path to “it looks right”.

Keep our JSON seeds as the single source of truth. If you later add an admin dashboard, we’ll migrate the same shape to Firestore + Storage with minimal code changes (I already designed the shapes in the guide for that).

Tiny debug checklist you can do immediately

Search the project for "/assets/" and replace with "assets/" in both HTML and JSON.

Verify angular.json has src/assets in assets[].

Ensure images are actually in the repo (not only local): git ls-files | grep src/assets.

Check file names match slugs exactly (lowercase, hyphens).

If you used the public/ folder, either move images to src/assets or add the public mapping shown above.


1) Navbar: centrado, mega-menú alineado y contraste en mobile/scroll
✅ Pega este componente como src/app/components/navbar/navbar.component.ts
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'ts-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  scrolled = false;
  mobileOpen = false;
  showMega = false;

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 8;
  }

  get logoSrc() {
    return this.scrolled ? '/assets/logo_topstone-dark.svg' : '/assets/logo_topstone.svg';
  }
}

✅ Y este HTML como src/app/components/navbar/navbar.component.html
<header
  class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
  [class.bg-white/90]="scrolled"
  [class.text-neutral-900]="scrolled"
  [class.backdrop-blur]="scrolled"
  [class.text-white]="!scrolled"
>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <a routerLink="/" class="flex items-center gap-3">
        <img [src]="logoSrc" alt="TopStone" class="h-8" />
      </a>

      <!-- Mobile toggle -->
      <button class="md:hidden p-2 ring-1 ring-white/20 rounded-lg" (click)="mobileOpen = !mobileOpen" aria-label="Abrir menú">
        <!-- simple hamburger -->
        <div class="w-5 h-[2px] mb-1" [class.bg-neutral-900]="scrolled" [class.bg-white]="!scrolled"></div>
        <div class="w-5 h-[2px] mb-1" [class.bg-neutral-900]="scrolled" [class.bg-white]="!scrolled"></div>
        <div class="w-5 h-[2px]" [class.bg-neutral-900]="scrolled" [class.bg-white]="!scrolled"></div>
      </button>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-8 font-sans text-sm">
        <a routerLink="/" class="hover:text-[var(--ts-accent)]">Home</a>

        <!-- Products with centered mega menu -->
        <div class="relative"
             (mouseenter)="showMega = true" (mouseleave)="showMega = false">
          <button class="hover:text-[var(--ts-accent)] flex items-center gap-1">
            Productos
            <span aria-hidden>▾</span>
          </button>

          <div
            *ngIf="showMega"
            class="absolute left-1/2 -translate-x-1/2 mt-4 w-[min(100vw-2rem,960px)]
                   p-6 rounded-2xl bg-white text-neutral-900 shadow-xl grid grid-cols-4 gap-6"
          >
            <div>
              <h4 class="font-semibold mb-3">12mm (160×320cm)</h4>
              <ul class="space-y-2">
                <li><a routerLink="/productos/12mm/saint-laurent" class="hover:text-[var(--ts-accent)]">Saint Laurent</a></li>
                <li><a routerLink="/productos/12mm/black-gold" class="hover:text-[var(--ts-accent)]">Black Gold</a></li>
                <!-- … resto -->
              </ul>
            </div>

            <div>
              <h4 class="font-semibold mb-3">15mm (160×320cm)</h4>
              <!-- … -->
            </div>

            <div>
              <h4 class="font-semibold mb-3">20mm (160×320cm)</h4>
              <!-- … -->
            </div>

            <!-- Vista previa -->
            <div class="rounded-xl overflow-hidden bg-neutral-100">
              <img src="/assets/productos/12mm/saint-laurent.jpg" alt="Preview" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <a routerLink="/galeria" class="hover:text-[var(--ts-accent)]">Galería</a>
        <a routerLink="/datos-tecnicos" class="hover:text-[var(--ts-accent)]">Datos técnicos</a>
        <a routerLink="/contacto" class="hover:text-[var(--ts-accent)]">Contacto</a>
      </nav>
    </div>
  </div>

  <!-- Mobile overlay + drawer -->
  <div *ngIf="mobileOpen" class="md:hidden fixed inset-0 z-40 bg-black/60" (click)="mobileOpen = false"></div>
  <aside *ngIf="mobileOpen" class="md:hidden fixed top-0 right-0 z-50 w-[84%] max-w-sm h-full
                                 bg-white text-neutral-900 shadow-xl p-6 overflow-y-auto">
    <nav class="flex flex-col gap-4">
      <a routerLink="/" (click)="mobileOpen=false">Home</a>
      <details>
        <summary class="cursor-pointer">Productos</summary>
        <div class="mt-2 grid grid-cols-2 gap-3 text-sm">
          <a routerLink="/productos/12mm" (click)="mobileOpen=false" class="underline">12mm</a>
          <a routerLink="/productos/15mm" (click)="mobileOpen=false" class="underline">15mm</a>
          <a routerLink="/productos/20mm" (click)="mobileOpen=false" class="underline">20mm</a>
        </div>
      </details>
      <a routerLink="/galeria" (click)="mobileOpen=false">Galería</a>
      <a routerLink="/datos-tecnicos" (click)="mobileOpen=false">Datos técnicos</a>
      <a routerLink="/contacto" (click)="mobileOpen=false">Contacto</a>
    </nav>
  </aside>
</header>


Cómo usarlo

Importa <ts-navbar /> en tu app.component.html al inicio del body.

Asegúrate de tener dos versiones del logo:

/assets/logo_topstone.svg (blanco para hero oscuro)

/assets/logo_topstone-dark.svg (negro para header blanco al hacer scroll)

Con esto:

El mega-menú queda centrado respecto al viewport y ya no se “desplaza” a la izquierda.

En mobile, se ve sobre fondo blanco (texto oscuro) con overlay — no desaparece al scrollear.

En scroll, el header pasa a blanco + texto oscuro con backdrop-blur, evitando que “se pierda”.

2) Imágenes: por qué no aparecen y qué es “lo mejor”
A) Arreglo inmediato (mantener en src/assets)

Verifica en angular.json que tengas:

"assets": ["src/favicon.ico","src/assets"]


Rutas en JSON/HTML deben empezar con /assets/... (no ./assets ni ../assets).

Prueba directa en el navegador:
http://localhost:4200/assets/productos/12mm/saint-laurent.jpg
Si da 404, no están donde crees. Mueve a src/assets/productos/12mm/....

B) Opción profesional (Storage + Firestore metadata)

Imágenes en Firebase Storage (carpetas productos/12mm/...).

Metadatos (nombre, slug, grosor, coverUrl) en Firestore o en tu productos.json.

Pasos rápidos (sin código backend):

Sube imágenes en la consola de Storage (productos/12mm/...).

Copia la URL de descarga y úsala en tu JSON:

{ "nombre":"Saint Laurent", "slug":"saint-laurent", "grosor":"12mm",
  "cover":"https://firebasestorage.googleapis.com/v0/b/<tu-bucket>/o/productos%2F12mm%2Fsaint-laurent.jpg?alt=media" }


Listo: no necesitas redeploy para cambiar fotos; solo actualizas URLs.

Cuándo elegir cada opción

src/assets: perfecto si el catálogo cambia poco y quieres simplicidad/velocidad.

Storage + Firestore/JSON: ideal si el cliente quiere panel admin para subir/editar sin redeploy.

3) Mini-checklist de bugs comunes que causan tu síntoma

 Falta max-w-7xl mx-auto en el contenedor del header → causa desalineación del menú.

 Mega-menú con absolute right-0 dentro de un contenedor estrecho → puede verse corrida la columna. Usa left-1/2 -translate-x-1/2.

 Texto blanco sobre fondo blanco después de scroll → añade binding de clases para colores como en el componente.

 Logo único (blanco) sobre header blanco → logo “desaparece”. Usa dos versiones del logo.

 Rutas de assets relativas o assets fuera de src/ → 404 de imágenes.

 Z-index bajo del header o mega-menú → el menú “desaparece” detrás de secciones. Usa z-50 en el header y shadow-xl en el menú.


 Qué te incluyo ahora

Servicio Angular con Firestore + Storage (guarda paths y resuelve URLs con getDownloadURL en runtime).

Script Node tools/upload-and-seed.mjs para subir tus imágenes locales de src/assets/productos/** a Storage y generar un seed.

Reglas de Storage y Firestore para lectura pública del catálogo.

Variante rápida si prefieres seguir con JSON pero usando Storage para las fotos.

1) Instala y configura Firebase
npm i firebase


src/environments/environment.ts

export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'tstone-XXXX.firebaseapp.com',
    projectId: 'tstone-XXXX',
    storageBucket: 'tstone-XXXX.appspot.com',
    appId: '1:XXXX:web:XXXX'
  }
};

2) Servicio Angular (Firestore + Storage con paths)

Guarda en Firestore documentos con coverPath y galleryPaths (rutas en Storage). El servicio resuelve las URLs en cliente.

src/app/core/services/data.firestore.service.ts

import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { environment } from '../../../environments/environment';

export type Grosor = '12mm'|'15mm'|'20mm';
export interface ProductoDoc {
  nombre: string; slug: string; grosor: Grosor; medida: string;
  coverPath: string;            // p.ej. 'productos/12mm/saint-laurent/cover.jpg'
  galleryPaths?: string[];      // p.ej. ['productos/12mm/saint-laurent/g1.jpg']
}
export interface ProductoResolved extends Omit<ProductoDoc,'coverPath'|'galleryPaths'> {
  coverUrl: string; galleryUrls: string[];
}

@Injectable({ providedIn: 'root' })
export class DataFirestoreService {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private storage = getStorage(this.app);

  async listByGrosor(grosor: Grosor): Promise<ProductoResolved[]> {
    const q = query(collection(this.db, 'productos'), where('grosor', '==', grosor));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => d.data() as ProductoDoc);
    return Promise.all(docs.map(async (p) => ({
      nombre: p.nombre,
      slug: p.slug,
      grosor: p.grosor,
      medida: p.medida,
      coverUrl: await getDownloadURL(ref(this.storage, p.coverPath)),
      galleryUrls: await Promise.all((p.galleryPaths || []).map(path => getDownloadURL(ref(this.storage, path))))
    })));
  }

  async getBySlug(grosor: Grosor, slug: string): Promise<ProductoResolved | null> {
    const q = query(collection(this.db, 'productos'), where('grosor','==',grosor), where('slug','==',slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const p = snap.docs[0].data() as ProductoDoc;
    return {
      nombre: p.nombre,
      slug: p.slug,
      grosor: p.grosor,
      medida: p.medida,
      coverUrl: await getDownloadURL(ref(this.storage, p.coverPath)),
      galleryUrls: await Promise.all((p.galleryPaths || []).map(path => getDownloadURL(ref(this.storage, path))))
    };
  }
}


Uso en tu grosor.component.ts (ejemplo):

import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataFirestoreService, ProductoResolved } from '@/app/core/services/data.firestore.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="max-w-7xl mx-auto px-6 py-12">
    <h2 class="font-serif text-3xl mb-6">Productos {{grosor}}</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <article *ngFor="let p of productos" class="group rounded-2xl overflow-hidden bg-[var(--ts-paper)] shadow">
        <div class="aspect-[4/3] overflow-hidden">
          <img [src]="p.coverUrl" [alt]="p.nombre" class="w-full h-full object-cover group-hover:scale-[1.02] transition"/>
        </div>
        <div class="p-4">
          <h3 class="font-serif text-xl">{{ p.nombre }}</h3>
          <p class="text-sm text-neutral-600">{{ p.medida }} · {{ p.grosor }}</p>
        </div>
      </article>
    </div>
  </div>
  `
})
export class GrosorComponent {
  private route = inject(ActivatedRoute);
  private data = inject(DataFirestoreService);
  grosor = this.route.snapshot.paramMap.get('grosor') as '12mm'|'15mm'|'20mm';
  productos: ProductoResolved[] = [];

  async ngOnInit() {
    this.productos = await this.data.listByGrosor(this.grosor);
  }
}

3) Reglas de seguridad (público de solo lectura)

Storage (storage.rules)

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /productos/{allPaths=**} { allow read; }
    match /galeria/{allPaths=**}   { allow read; }
    match /{path=**} { allow read: if false; allow write: if false; }
  }
}


Firestore (firestore.rules)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /productos/{docId} {
      allow read;
      allow write: if false;
    }
  }
}


Despliegue:

firebase deploy --only storage,firestore:rules

4) Script de subida masiva + seed

Sube todo lo que tengas en src/assets/productos/** a Storage y genera un JSON seed (y opcionalmente inserta en Firestore).

npm i -D glob fs-extra
npm i firebase-admin


tools/upload-and-seed.mjs

import 'dotenv/config';
import { glob } from 'glob';
import fs from 'fs-extra';
import path from 'node:path';
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: process.env.FB_BUCKET // p.ej. tstone-xxxx.appspot.com
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const LOCAL_ROOT = 'src/assets/productos';
const OUT_JSON = 'tools/productos.seed.json';

function grosorFrom(rel) { return rel.split(path.sep)[0]; }
function slugFrom(rel)   { return rel.split(path.sep)[1]; }

async function uploadFile(localFile, storagePath) {
  await bucket.upload(localFile, {
    destination: storagePath,
    metadata: { cacheControl: 'public, max-age=31536000, immutable' }
  });
}

async function main() {
  const files = await glob(`${LOCAL_ROOT}/**/*.{jpg,jpeg,png,webp}`, { nodir: true });
  const seedMap = new Map();

  for (const file of files) {
    const rel = path.relative(LOCAL_ROOT, file); // 12mm/saint-laurent/cover.jpg
    const grosor = grosorFrom(rel);
    const slug = slugFrom(rel);
    const fname = path.basename(file);
    const storagePath = `productos/${grosor}/${slug}/${fname}`;

    await uploadFile(file, storagePath);

    const key = `${grosor}:${slug}`;
    if (!seedMap.has(key)) seedMap.set(key, { grosor, slug, coverPath: '', galleryPaths: [] });
    const entry = seedMap.get(key);
    if (fname.startsWith('cover')) entry.coverPath = storagePath; else entry.galleryPaths.push(storagePath);
  }

  const items = [];
  for (const { grosor, slug, coverPath, galleryPaths } of seedMap.values()) {
    items.push({
      nombre: slug.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase()),
      slug, grosor, medida: '160x320cm', coverPath, galleryPaths
    });
  }

  await fs.outputJson(OUT_JSON, { items }, { spaces: 2 });
  console.log(`Generado ${OUT_JSON} con ${items.length} productos.`);

  if (process.env.SEED_TO_FIRESTORE === 'true') {
    const batch = db.batch();
    for (const p of items) {
      const id = `${p.grosor}-${p.slug}`;
      batch.set(db.collection('productos').doc(id), p);
    }
    await batch.commit();
    console.log('Seed insertado en Firestore.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });


Uso

# Variables (PowerShell)
$env:FB_BUCKET="tstone-xxxx.appspot.com"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\serviceAccount.json"

# Ejecuta
node tools/upload-and-seed.mjs

# Insertar además en Firestore
$env:SEED_TO_FIRESTORE="true"; node tools/upload-and-seed.mjs


Tip: pon el principal de cada producto como cover.jpg (el script lo detecta).

5) Alternativa rápida sin Firestore (JSON + Storage)

Si prefieres seguir con productos.json:

Guarda coverPath y galleryPaths (paths de Storage) y en el cliente resuelve con getDownloadURL.

src/app/core/services/data.storagejson.service.ts

import { Injectable } from '@angular/core';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

export interface ProductoLocal {
  nombre: string; slug: string; grosor: '12mm'|'15mm'|'20mm'; medida: string;
  coverPath: string; galleryPaths?: string[];
}

@Injectable({ providedIn: 'root' })
export class DataStorageJsonService {
  private app = initializeApp(environment.firebase);
  private storage = getStorage(this.app);

  async listAll(): Promise<ProductoLocal[]> {
    const json = await fetch('/assets/data/productos.json').then(r => r.json());
    return json.items as ProductoLocal[];
  }

  async resolveUrl(path: string) {
    return getDownloadURL(ref(this.storage, path));
  }
}