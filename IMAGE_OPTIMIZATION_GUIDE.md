# Image Optimization Guide

## Current Status

### ✅ Already Implemented
- **Lazy loading** on all gallery and product images
- **Alt text** on all critical images (products, gallery, cart, detail pages)
- **Width/height attributes** added to logo images to prevent layout shift

### ⏳ Recommended Next Steps

## 1. Convert Images to WebP Format

### Why WebP?
- 25-35% smaller file size than JPEG
- Better compression with same quality
- Supported by all modern browsers (>96% coverage)

### Implementation Options

#### Option A: Manual Conversion (Quick Start)
Use online tools or command-line utilities:

```bash
# Install cwebp (WebP encoder)
# Windows: Download from https://developers.google.com/speed/webp/download
# Mac: brew install webp
# Linux: apt-get install webp

# Convert single image
cwebp -q 80 input.jpg -o output.webp

# Batch convert all JPGs in a directory
for file in *.jpg; do cwebp -q 80 "$file" -o "${file%.jpg}.webp"; done
```

#### Option B: Build-Time Optimization (Recommended)
Add image optimization to your Angular build process:

```bash
npm install --save-dev imagemin imagemin-webp imagemin-mozjpeg
```

Create `scripts/optimize-images.js`:

```javascript
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');

(async () => {
  // Convert to WebP
  await imagemin(['src/assets/**/*.{jpg,png}'], {
    destination: 'src/assets-optimized',
    plugins: [
      imageminWebp({ quality: 80 })
    ]
  });

  // Optimize JPEGs as fallback
  await imagemin(['src/assets/**/*.{jpg,jpeg}'], {
    destination: 'src/assets-optimized',
    plugins: [
      imageminMozjpeg({ quality: 85 })
    ]
  });

  console.log('Images optimized!');
})();
```

Add to `package.json`:
```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js"
  }
}
```

#### Option C: CDN with Automatic Optimization
Use a CDN service that automatically converts images:
- **Cloudflare Images** - Automatic WebP conversion
- **Cloudinary** - Free tier available, automatic format selection
- **imgix** - Real-time image optimization

### Using Picture Element (Best Practice)

Replace:
```html
<img src="product.jpg" alt="Product" />
```

With:
```html
<picture>
  <source srcset="product.webp" type="image/webp">
  <source srcset="product.jpg" type="image/jpeg">
  <img src="product.jpg" alt="Product" loading="lazy" width="800" height="600" />
</picture>
```

## 2. Implement Responsive Images (srcset)

### For Different Screen Sizes

```html
<img
  src="product-800w.jpg"
  srcset="
    product-400w.jpg 400w,
    product-800w.jpg 800w,
    product-1200w.jpg 1200w,
    product-1600w.jpg 1600w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
  alt="Product name"
  loading="lazy"
  width="800"
  height="600"
/>
```

### With WebP + Responsive

```html
<picture>
  <source
    type="image/webp"
    srcset="
      product-400w.webp 400w,
      product-800w.webp 800w,
      product-1200w.webp 1200w
    "
    sizes="(max-width: 640px) 100vw, 50vw"
  />
  <source
    type="image/jpeg"
    srcset="
      product-400w.jpg 400w,
      product-800w.jpg 800w,
      product-1200w.jpg 1200w
    "
    sizes="(max-width: 640px) 100vw, 50vw"
  />
  <img
    src="product-800w.jpg"
    alt="Product name"
    loading="lazy"
    width="800"
    height="600"
  />
</picture>
```

## 3. Add Width and Height Attributes

### Why?
- Prevents Cumulative Layout Shift (CLS)
- Improves Core Web Vitals score
- Browser reserves space before image loads

### Implementation

Update all product images:
```html
<!-- Before -->
<img [src]="product.imageUrl" [alt]="product.name" />

<!-- After -->
<img 
  [src]="product.imageUrl" 
  [alt]="product.name"
  width="800"
  height="600"
  loading="lazy"
/>
```

### Calculate Aspect Ratio
If images have different sizes, use aspect-ratio CSS:

```html
<img 
  [src]="product.imageUrl" 
  [alt]="product.name"
  style="aspect-ratio: 4/3; width: 100%; height: auto;"
  loading="lazy"
/>
```

## 4. Image Loading Strategies

### Priority Images (Above the Fold)
```html
<!-- Hero image - load immediately -->
<img src="hero.jpg" alt="Hero" fetchpriority="high" width="1920" height="1080" />
```

### Below the Fold Images
```html
<!-- Product cards - lazy load -->
<img src="product.jpg" alt="Product" loading="lazy" width="400" height="300" />
```

### Angular Implementation

Create an image directive:

```typescript
// src/app/shared/directives/optimized-image.directive.ts
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'img[appOptimizedImage]',
  standalone: true
})
export class OptimizedImageDirective implements OnInit {
  @Input() src!: string;
  @Input() alt!: string;
  @Input() width?: number;
  @Input() height?: number;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    const img = this.el.nativeElement;
    
    // Set loading strategy
    img.loading = 'lazy';
    
    // Add width/height if provided
    if (this.width) img.width = this.width;
    if (this.height) img.height = this.height;
    
    // Decode image asynchronously
    img.decode().catch(() => {
      console.warn('Failed to decode image:', this.src);
    });
  }
}
```

Usage:
```html
<img appOptimizedImage [src]="product.imageUrl" [alt]="product.name" width="800" height="600" />
```

## 5. Target Image Sizes

### Recommended File Sizes

| Image Type | Dimensions | Max File Size | Quality |
|------------|-----------|---------------|---------|
| Hero/Banner | 1920x1080 | 150KB | 80% |
| Product Card | 800x600 | 80KB | 85% |
| Thumbnail | 400x300 | 30KB | 80% |
| Gallery | 1200x900 | 120KB | 85% |
| Logo/Icon | 256x256 | 20KB | 90% |

### Current Image Audit

Run this script to check your current images:

```bash
# Check image sizes in assets folder
du -sh src/assets/productos/*
du -sh src/assets/galeria/*/*
```

## 6. Optimize Existing Images

### Priority 1: Large Images (>200KB)
1. Convert to WebP
2. Reduce dimensions if unnecessarily large
3. Compress with quality 80-85%

### Priority 2: Product Images
1. Standardize dimensions (e.g., 800x600)
2. Create thumbnails (400x300)
3. Add width/height attributes

### Priority 3: Gallery Images
1. Create multiple sizes for srcset
2. Add lazy loading (already done ✅)
3. Use progressive JPEG or WebP

## 7. CDN Setup (Optional but Recommended)

### Cloudflare Setup
1. Sign up at cloudflare.com
2. Add your domain
3. Enable "Polish" (automatic image optimization)
4. Enable "Mirage" (lazy loading)

### Firebase Hosting (Already Using)
Firebase automatically compresses images, but consider:
- Using Firebase Storage with Cloud CDN
- Implementing signed URLs for secure images
- Setting cache headers for long-term caching

## 8. Testing & Validation

### Check Core Web Vitals

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://theluxmining.com --output html --output-path ./report.html

# Target scores:
# - LCP (Largest Contentful Paint): < 2.5s
# - CLS (Cumulative Layout Shift): < 0.1
# - FID/INP (Interaction to Next Paint): < 200ms
```

### Image Analysis Tools
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **WebPageTest**: https://www.webpagetest.org/
- **Cloudinary Image Analysis**: https://webspeedtest.cloudinary.com/

## 9. Implementation Checklist

### Phase 1: Quick Wins (1-2 hours)
- [x] Add width/height to logo images
- [ ] Add width/height to product card images
- [ ] Add width/height to gallery thumbnails
- [ ] Verify lazy loading is working (already implemented ✅)

### Phase 2: Image Conversion (2-4 hours)
- [ ] Audit all images for file size
- [ ] Convert large images (>200KB) to WebP
- [ ] Create responsive versions (400w, 800w, 1200w)
- [ ] Update image references in code

### Phase 3: Advanced Optimization (4-6 hours)
- [ ] Implement picture element with WebP
- [ ] Add srcset for responsive images
- [ ] Set up automated image optimization in build
- [ ] Configure CDN caching headers

### Phase 4: Testing (1-2 hours)
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Test on mobile devices
- [ ] Verify images load correctly across browsers

## 10. Automated Solution (Recommended)

### Use Next.js Image Component Style

Create a reusable image component:

```typescript
// src/app/shared/components/optimized-image/optimized-image.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <picture>
      <source 
        *ngIf="webpSrc"
        [srcset]="webpSrc" 
        type="image/webp"
      />
      <img 
        [src]="src"
        [alt]="alt"
        [width]="width"
        [height]="height"
        [loading]="loading"
        [class]="className"
        [style.aspect-ratio]="aspectRatio"
      />
    </picture>
  \`
})
export class OptimizedImageComponent {
  @Input() src!: string;
  @Input() webpSrc?: string;
  @Input() alt!: string;
  @Input() width!: number;
  @Input() height!: number;
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  @Input() className?: string;

  get aspectRatio(): string {
    return \`\${this.width} / \${this.height}\`;
  }
}
```

Usage:
```html
<app-optimized-image
  src="assets/productos/antminer.jpg"
  webpSrc="assets/productos/antminer.webp"
  alt="Antminer S21"
  [width]="800"
  [height]="600"
  loading="lazy"
  className="rounded-lg"
/>
```

## Summary

**Immediate Actions:**
1. ✅ Add width/height attributes (in progress)
2. Convert critical images to WebP
3. Implement picture element for product images

**Long-term:**
1. Set up automated image optimization in build process
2. Configure CDN for global delivery
3. Monitor Core Web Vitals in production

**Expected Impact:**
- **Page Load Time:** 30-40% improvement
- **LCP Score:** 2.5s → <1.8s
- **Bandwidth:** 50-60% reduction
- **SEO Ranking:** Improved due to better Core Web Vitals
