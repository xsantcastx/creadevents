# Tag System Migration - Status

## ✅ COMPLETED

### 1. Tag Model & Service
- ✅ Created `Tag` interface in `catalog.ts` with fields: name, slug, description, color, icon, order, active
- ✅ Created `TagService` with full CRUD operations
- ✅ Fixed Firestore queries to avoid index requirements (sorting in memory)
- ✅ Fixed undefined value errors in Firestore saves

### 2. Tag Management UI
- ✅ Added Tags tab to `/admin/catalog`
- ✅ Tag form with all fields (name, slug, description, color, icon, order, active)
- ✅ Visual emoji picker with 12 crypto-relevant icons (⛏️🖥️⚡💻❄️🔧🔨🛠️🔥💰🚀📊)
- ✅ Large color picker (48px × 96px) + hex input
- ✅ Auto-slug generation from name
- ✅ Full CRUD: Create, Read, Update, Delete tags

### 3. Firebase Configuration
- ✅ Updated `firestore.rules` to allow admin access to `tags` collection
- ✅ Deployed rules to Firebase successfully

### 4. Gallery Admin Updates
- ✅ Imported `TagService` and `Tag` model
- ✅ Replaced hardcoded `GALLERY_TAGS` with Firestore tags
- ✅ Added `subscribeToTags()` method to load tags from Firestore
- ✅ Updated gallery filter buttons to show tag name, icon, color
- ✅ Updated upload modal tag checkboxes with icons and colors
- ✅ Updated edit modal tag checkboxes with icons and colors

## 🔄 IN PROGRESS

### Gallery Tag Usage
The gallery admin now loads tags from Firestore, but you still need to:
1. **Create the 8 recommended tags** via `/admin/catalog` → Etiquetas tab:
   - Mining Farm (#F7931A, ⛏️, order: 1)
   - Data Center (#FF9500, 🖥️, order: 2)
   - ASIC Setup (#FFB800, ⚡, order: 3)
   - GPU Rig (#00D4AA, 💻, order: 4)
   - Cooling System (#00B8D4, ❄️, order: 5)
   - Infrastructure (#7E57C2, 🔧, order: 6)
   - Installation (#26A69A, 🔨, order: 7)
   - Maintenance (#FF7043, 🛠️, order: 8)

2. **Re-tag existing gallery images** with the new tags (old tags like "cocinas", "banos" won't match)

## ⏳ PENDING

### Product Form - Add Tag Support
The product form at `/admin/products` needs tag selection capability:

**File:** `src/app/pages/admin/products/products-admin.page.ts`

**Changes Needed:**

1. **Import TagService and Tag model:**
```typescript
import { TagService } from '../../../services/tag.service';
import { Tag } from '../../../models/catalog';
```

2. **Inject TagService:**
```typescript
private tagService = inject(TagService);
```

3. **Add tags array:**
```typescript
availableTags: Tag[] = [];
```

4. **Add to productForm:**
```typescript
this.productForm = this.fb.group({
  // ...existing fields...
  tags: [[]], // Add this line
});
```

5. **Load tags in ngOnInit:**
```typescript
this.tagService.getActiveTags().subscribe(tags => {
  this.availableTags = tags;
});
```

6. **Add helper methods:**
```typescript
isProductTagSelected(tagSlug: string): boolean {
  const tags = this.productForm.get('tags')?.value || [];
  return tags.includes(tagSlug);
}

toggleProductTag(tagSlug: string, checked: boolean): void {
  const tagsControl = this.productForm.get('tags');
  const currentTags = tagsControl?.value || [];
  
  if (checked && !currentTags.includes(tagSlug)) {
    tagsControl?.setValue([...currentTags, tagSlug]);
  } else if (!checked) {
    tagsControl?.setValue(currentTags.filter((t: string) => t !== tagSlug));
  }
}
```

**File:** `src/app/pages/admin/products/products-admin.page.html`

**Add after Description field in the modal:**
```html
<!-- Tags -->
<div>
  <label class="block text-sm font-medium text-bitcoin-gray mb-2">
    Tags (optional)
  </label>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
    @for (tag of availableTags; track tag.id) {
      <label class="flex items-center gap-2 p-3 bg-bitcoin-dark/40 border border-bitcoin-gray/20 rounded-xl hover:bg-bitcoin-dark/60 cursor-pointer transition-all"
             [style.border-color]="isProductTagSelected(tag.slug) ? tag.color : ''">
        <input
          type="checkbox"
          [checked]="isProductTagSelected(tag.slug)"
          (change)="toggleProductTag(tag.slug, $any($event.target).checked)"
          class="rounded border-bitcoin-gray/30 text-bitcoin-orange focus:ring-bitcoin-orange">
        @if (tag.icon) {
          <span>{{ tag.icon }}</span>
        }
        <span class="text-sm text-bitcoin-gray">{{ tag.name }}</span>
      </label>
    }
  </div>
  <p class="mt-2 text-xs text-bitcoin-gray/70">Add tags to categorize your product</p>
</div>
```

### Update Product Model
**File:** `src/app/models/product.ts`

Make sure the `Product` interface includes:
```typescript
tags?: string[]; // Array of tag slugs
```

## 📝 RECOMMENDED WORKFLOW

1. **Create Tags First:**
   - Go to `/admin/catalog` → Etiquetas tab
   - Click "Nueva Etiqueta"
   - Create all 8 recommended tags (or fewer based on your needs)
   - Use the emoji picker and color picker for visual identification

2. **Update Gallery Images:**
   - Go to `/admin/gallery`
   - Edit each existing image
   - Select appropriate tags from the new tag system
   - Old tags (cocinas, banos) will no longer work

3. **Add Tag Support to Products:**
   - Implement the changes listed above in products-admin
   - This allows products to be tagged for better categorization

4. **Use Tags for Filtering:**
   - Gallery page already filters by tags (see `galeria.page.ts`)
   - Products page can be enhanced to filter by tags as well

## 🎯 BENEFITS

- **Centralized Tag Management:** All tags managed in one place
- **Visual Identification:** Icons and colors make tags easy to recognize
- **Flexible Categorization:** Can be used for both gallery and products
- **Easy Updates:** Change tag names/colors/icons without touching code
- **Crypto-Relevant:** Tags are specific to crypto mining operations
- **Scalable:** Easy to add new tags as needed

## 🔧 TROUBLESHOOTING

**Tags not loading in gallery?**
- Check browser console for errors
- Verify Firebase security rules are deployed
- Ensure tags collection has documents in Firestore

**Can't create tags?**
- Make sure you're logged in as admin
- Check Firebase rules allow write access to `tags` collection
- Verify no undefined values in form fields

**Old gallery tags showing?**
- Gallery now uses Firestore tags only
- Old hardcoded tags (cocinas, banos) are deprecated
- Re-tag images with new tag system
