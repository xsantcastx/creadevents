# Enhanced Slot Manager System - Usage Guide

## 🎯 Overview

The Admin Dashboard now includes a **complete Enhanced Image CMS (Slots + Images)** system with sophisticated page/position selectors that allows admins to manage content without touching code. This system provides:

- **Images Dashboard**: Upload, organize, and manage images
- **Enhanced Slots Manager**: Page/position selectors with predefined slot definitions
- **Auto-generated Keys**: Automatic slot key generation (e.g., `home.header`)
- **Batch Creation**: "Create defaults for page" to seed all slots at once
- **Dynamic Content**: Pages automatically load images from assigned slots

## 🚀 Enhanced Admin Workflow

### 1. Access the Admin Panel

1. Navigate to `/admin` (requires admin authentication)
2. Login with your admin credentials
3. From the dashboard, you can access:
   - **Manage Images**: Upload and organize gallery images
   - **Manage Slots**: Create and assign image slots using enhanced selectors

### 2. Managing Images (`/admin/images`)

- Upload images via drag-and-drop or file selection
- Organize images by sections (hero, gallery, services, about, footer)
- Add alt text and captions for accessibility
- Reorder images within sections
- Delete unused images

### 3. Enhanced Slots Manager (`/admin/slots`)

**Key Features:**
- **Page Selector**: Choose from predefined pages (Home, Services, Portfolio, etc.)
- **Position Selector**: Select from predefined positions for each page
- **Auto-generated Keys**: Slot keys like `home.header` are created automatically
- **Suggested Labels**: Human-friendly labels are auto-suggested
- **Advanced Mode**: Option for custom slot keys when needed

**Creating Slots (Easy Mode):**
1. Select **Page** (e.g., "Home")
2. Select **Position** (e.g., "Home Header (Hero)")
3. The slot key `home.header` is automatically generated
4. Click "Create" - done!

**Batch Creation:**
- Click "Create defaults for page" to create all predefined slots for the selected page at once
- Only creates missing slots, won't duplicate existing ones

**Assigning Images:**
1. Click "Assign image" for any slot
2. Browse available images (filter by section if needed)
3. Search by filename
4. Click on any image to assign it to the slot

**Managing Assignments:**
- **Clear**: Remove image assignment but keep the slot
- **Delete**: Remove the slot entirely

## 🎨 Predefined Slot Structure

The system comes with predefined slots for each page:

### Home Page Slots:
- `home.header` - Home Header (Hero)
- `home.cta` - Home CTA Banner
- `home.promo1` - Promo 1
- `home.promo2` - Promo 2
- `home.promo3` - Promo 3

### Services Page Slots:
- `services.header` - Services Header
- `services.banner` - Services Banner

### Portfolio Page Slots:
- `portfolio.header` - Portfolio Header

### Other Pages:
- `about.header` - About Header
- `journal.header` - Journal Header
- `footer.logo` - Footer Logo
- `footer.background` - Footer Background

*You can customize this structure by editing `src/app/admin/slot-manager/site-slots.ts`*

## 🎨 Developer Integration

### Using Slots in Components

Here's how to integrate slots into any Angular component:

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CmsService, SlotDoc } from '../../services/cms.service';

@Component({
  selector: 'app-my-page',
  template: `
    <!-- Dynamic image from slot -->
    @if (heroImage(); as hero) {
      <img [src]="hero.url" [alt]="hero.alt" class="hero-image" />
    }
    
    <!-- Fallback image if slot is empty -->
    @if (!heroImage()) {
      <img src="assets/default-hero.jpg" alt="Default hero" class="hero-image" />
    }
  `
})
export class MyPageComponent implements OnInit {
  private cmsService = inject(CmsService);
  
  heroImage = signal<SlotDoc | null>(null);

  async ngOnInit() {
    // Load slot content
    const heroSlot = await this.cmsService.getSlot('page.hero');
    this.heroImage.set(heroSlot);
  }
}
```

### Available CMS Service Methods

```typescript
// Get a single slot by key
getSlot(key: string): Promise<SlotDoc | null>

// List all slots (optionally filter by section)
listSlots(section?: Section): Promise<SlotDoc[]>

// Create or update a slot
upsertSlot(slot: SlotDoc): Promise<void>

// Assign an image to a slot
assignSlot(key: string, img: ImageDoc): Promise<void>

// Clear slot assignment
clearSlot(key: string): Promise<void>

// Delete a slot
deleteSlot(key: string): Promise<void>
```

## 📋 Slot Naming Conventions

The enhanced system uses automatic key generation:

- **Page.Position Pattern**: `home.header`, `services.banner`, etc.
- **Hierarchical Structure**: Organized by page for easy management
- **Human-Friendly Labels**: "Home Header (Hero)", "Services Banner", etc.
- **Custom Keys**: Advanced mode allows custom slot keys when needed

## 🔧 Example Implementation (Home Page)

The home page demonstrates slot usage:

1. **Admin Action**: Select "Home" → "Home Header (Hero)" → Create → Assign image
2. **Generated Key**: `home.hero`
3. **Component Code**: `await this.cmsService.getSlot('home.hero')`
4. **Result**: Image appears dynamically on homepage
5. **Updates**: Change image in admin panel, page updates automatically

## 🔄 Enhanced Content Update Workflow

### For Admins (No Code Required):
1. Login to admin panel
2. Go to **Manage Slots**
3. Select the page you want to update
4. Find the slot in the filtered list
5. Click "Assign image"
6. Select new image
7. Page updates immediately

### For Developers (One-Time Setup):
1. Add `CmsService` to component
2. Create signal for slot data
3. Load slot in `ngOnInit`
4. Use slot in template with fallback
5. Admins can now manage content without code changes

## ⚡ Advanced Features

### Page-Filtered View
- The slot list automatically filters to show only slots for the selected page
- Makes it easy to manage slots for specific pages

### Batch Operations
- "Create defaults for page" creates all predefined slots at once
- Saves time when setting up new pages

### Advanced Mode
- Toggle to custom key mode for special use cases
- Maintains flexibility while providing ease of use

### Wireframe Support
- Optional preview images can be added to show slot placement
- Place wireframes at `src/assets/admin/wireframes/<page>.png`

## 🎯 Benefits

- **Intuitive Interface**: Page/position selectors make slot creation obvious
- **No-Code Content Management**: Admins update images without developer involvement
- **Predefined Structure**: Organized slot definitions prevent confusion
- **Batch Operations**: Quick setup for entire pages
- **Type Safety**: Full TypeScript support with proper interfaces
- **Performance**: Images are cached and optimized
- **Flexibility**: Custom slots available when needed
- **Fallbacks**: Graceful handling when slots are empty
- **SEO Friendly**: Proper alt text and meta information

## 🛡️ Security

- **Public Read**: Anyone can view slot content (for website functionality)
- **Admin Write**: Only authenticated admins can modify slots
- **Firestore Rules**: Enforced at database level
- **Image Validation**: Upload restrictions prevent malicious files

## 📊 Current Status

✅ **Enhanced Implementation Complete:**
- Enhanced Firestore security rules for slots collection
- CMS service with full CRUD operations and ImageDoc compatibility
- Enhanced Slot Manager with page/position selectors
- Predefined slot definitions in site-slots.ts
- Auto-generated keys and suggested labels
- Batch creation functionality
- Page-filtered slot view
- Admin dashboard navigation
- Example integration in home page
- Build verification completed

🎯 **Ready to Use:**
- Select page and position to create slots
- Batch create all slots for a page
- Assign images to slots with enhanced picker
- Implement slots in any component
- Content updates without code deployments

---

## 🔧 Configuration

To customize the predefined slots, edit `src/app/admin/slot-manager/site-slots.ts`:

```typescript
export const SITE_SLOTS: Record<PageKey, SlotDef[]> = {
  home: [
    { key: 'header', label: 'Home Header (Hero)', section: 'hero' },
    { key: 'cta', label: 'Home CTA Banner', section: 'gallery' },
    // Add more slots as needed
  ],
  // Add more pages as needed
};
```

*The enhanced slot system is now fully functional with sophisticated UI and ready for content management!*