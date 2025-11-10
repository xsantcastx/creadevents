# Hero Images Management System

## Overview
The homepage hero carousel images are now fully manageable from the admin settings panel. No more hardcoded arrays - images are stored in Firestore and can be dynamically updated through the admin interface.

## Features

### ✅ Dynamic Hero Carousel
- Hero images are now loaded from Firestore settings
- Stored as JSON in `AppSettings.heroImagesJson`
- Default images included (Antminer S19, WhatsMiner M30S)
- Fallback to default logo if no images configured

### ✅ Admin Management Interface
- **Add Images**: Upload new hero images with automatic optimization
- **Edit Images**: Update title, description, and alt text
- **Reorder**: Move images up/down to change display order
- **Toggle Active**: Show/hide images without deleting
- **Delete**: Remove images with confirmation prompt
- **Preview**: See image thumbnail and details

### ✅ Automatic Image Optimization
- All uploads are automatically optimized
- Resized to optimal dimensions (max 1920x1080)
- Compressed to 85% quality
- WebP versions generated automatically
- 400px thumbnails created
- 50-70% size reduction on average

### ✅ Image Properties
Each hero image includes:
- **ID**: Unique identifier
- **URL**: Original JPEG image URL
- **WebP URL**: Optimized WebP version (optional)
- **Title**: Display title
- **Description**: Subtitle or description
- **Alt Text**: Accessibility text (required)
- **Order**: Display sequence (sortable)
- **Active**: Visibility toggle

## Usage

### Admin Interface

1. **Access**: Navigate to Admin → Settings → "Home Hero Images" section
2. **Add Image**: Click "Add Image" button
3. **Upload**: Select image file (auto-optimized on upload)
4. **Fill Details**: Enter title, description, and alt text
5. **Save**: Click "Save Image" to store
6. **Reorder**: Use ↑ ↓ arrows to change display order
7. **Toggle**: Click eye icon to activate/deactivate
8. **Edit**: Click pencil icon to modify details
9. **Delete**: Click trash icon to remove (with confirmation)

### Recommended Image Specs
- **Dimensions**: 1920x1080 pixels (Full HD)
- **Format**: JPEG, PNG, or WebP
- **Max Size**: 5MB (will be optimized automatically)
- **Aspect Ratio**: 16:9 (widescreen)
- **Content**: High-quality product photos or lifestyle images

### Best Practices
1. **Alt Text**: Always provide descriptive alt text for accessibility
2. **Active Images**: Keep at least one image active at all times
3. **Order**: Most important/attractive images should be first
4. **Quality**: Use high-resolution images (they'll be optimized)
5. **Relevance**: Use images that represent your products/brand

## Technical Details

### Components

**HeroImagesManagerComponent** (`src/app/shared/components/hero-images-manager/`)
- Full CRUD interface for managing hero images
- Integrated with StorageService for optimized uploads
- Real-time progress tracking
- Success/error message handling

**HomeHeroComponent** (`src/app/pages/home/home-hero/`)
- Loads images from SettingsService
- Displays active images only
- Sorted by order property
- Falls back to default logo if needed

### Services

**SettingsService** (`src/app/services/settings.service.ts`)
- `getHeroImages()`: Returns active images sorted by order
- `updateHeroImages(images)`: Saves images array to Firestore
- Stores as JSON string in `heroImagesJson` field

**StorageService** (`src/app/services/storage.service.ts`)
- `uploadOptimizedImage()`: Handles image upload with optimization
- Returns original URL, WebP URL, and thumbnail URL
- Progress tracking during upload

**ImageOptimizationService** (`src/app/services/image-optimization.service.ts`)
- Client-side image processing
- Resize, compress, WebP conversion
- Thumbnail generation

### Data Structure

```typescript
interface HeroImage {
  id: string;              // Unique identifier (timestamp)
  url: string;             // Firebase Storage URL (original)
  webpUrl?: string;        // WebP version URL (optional)
  alt: string;             // Alt text for accessibility
  title: string;           // Display title
  description?: string;    // Subtitle/description
  order: number;           // Display order (1-based)
  active: boolean;         // Show/hide toggle
}
```

### Firestore Storage

**Path**: `settings/app`
**Field**: `heroImagesJson: string`
**Format**: JSON array of HeroImage objects

```json
[
  {
    "id": "1234567890",
    "url": "https://storage.../hero1.jpg",
    "webpUrl": "https://storage.../hero1.webp",
    "alt": "Antminer S19 Pro mining setup",
    "title": "Antminer S19 Pro",
    "description": "Industry-leading hashrate with optimized efficiency",
    "order": 1,
    "active": true
  }
]
```

## Implementation Files

### New Files Created
- `src/app/shared/components/hero-images-manager/hero-images-manager.component.ts`
- `src/app/shared/components/hero-images-manager/hero-images-manager.component.html`
- `src/app/shared/components/hero-images-manager/hero-images-manager.component.scss`

### Modified Files
- `src/app/services/settings.service.ts` - Added HeroImage interface and methods
- `src/app/pages/home/home-hero/home-hero.ts` - Changed from hardcoded to dynamic loading
- `src/app/pages/admin/settings/settings-admin.page.ts` - Added hero images section
- `src/app/pages/admin/settings/settings-admin.page.html` - Integrated manager component

## Migration

### From Hardcoded to Dynamic
The system includes default images to ensure seamless transition:
1. **Antminer S19 Pro** - Order 1, Active
2. **WhatsMiner M30S+** - Order 2, Active

These defaults will display until you upload custom images.

### Updating Default Images
To change the default images:
1. Navigate to Admin → Settings → "Home Hero Images"
2. Edit the default images to match your products
3. Upload new images to replace defaults
4. Update titles, descriptions, and alt text
5. Adjust order as needed

## Troubleshooting

### Images Not Displaying
1. Check that at least one image is marked as "Active"
2. Verify image URLs are accessible
3. Check browser console for errors
4. Ensure Firestore rules allow reading settings

### Upload Fails
1. Check file size (max 5MB recommended)
2. Verify file format (JPEG, PNG, WebP supported)
3. Ensure Firebase Storage is configured correctly
4. Check storage rules allow uploads

### Optimization Issues
1. Images automatically optimized on upload
2. If WebP not created, check browser support
3. Thumbnails always generated at 400px
4. Original image preserved alongside optimized versions

## Future Enhancements

### Potential Improvements
- [ ] Drag-and-drop reordering
- [ ] Bulk upload multiple images
- [ ] Image cropping tool
- [ ] Preview carousel before saving
- [ ] Schedule images (show on specific dates)
- [ ] A/B testing different hero images
- [ ] Analytics on image performance
- [ ] CDN integration for faster loading

## Support

For issues or questions:
- Check Firebase console for storage/database errors
- Review browser console for client-side errors
- Verify admin permissions are set correctly
- Ensure all services are properly injected

---

**Last Updated**: Implementation completed with full CRUD functionality, automatic optimization, and admin interface integration.
