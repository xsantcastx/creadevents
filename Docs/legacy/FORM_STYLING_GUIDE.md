# Form Styling Guide - TheLuxMining Admin Interface

## Overview
This document outlines the standardized styling patterns used for admin forms throughout the TheLuxMining application. Following these guidelines ensures consistency, readability, and accessibility across all forms.

## Color Hierarchy

### Primary Colors (Bitcoin Theme)
- **Bitcoin Gold**: `#ffb81c` - Used for titles, CTAs, and primary emphasis
- **Bitcoin Orange**: `#f7931a` - Used for interactive elements, focus states, and highlights
- **Bitcoin Gray**: `#9ca3af` - Used for body text, labels, and standard content
- **Bitcoin Dark**: `#0a0b0d` - Used for backgrounds and cards

### Text Color Standards
1. **Main Labels/Headings**: `text-bitcoin-gray` (full opacity)
2. **Body Text/Content**: `text-bitcoin-gray` (full opacity)
3. **Helper Text/Hints**: `text-bitcoin-gray` with `text-sm` size (full opacity for readability)
4. **Muted Metadata**: `text-bitcoin-gray/70` (only for non-critical metadata like timestamps)

## Form Element Styling

### 1. Labels
```html
<label class="block text-base font-semibold text-bitcoin-gray mb-3">
  Label Text *
</label>
```

**Specifications:**
- **Size**: `text-base` (16px)
- **Weight**: `font-semibold`
- **Color**: `text-bitcoin-gray`
- **Margin Bottom**: `mb-3` (12px spacing)
- **Display**: `block`
- **Required Indicator**: Add `*` after label text when field is required

---

### 2. Text Inputs
```html
<input
  type="text"
  id="fieldId"
  formControlName="fieldName"
  placeholder="e.g., Example placeholder text"
  class="w-full px-4 py-3 bg-bitcoin-dark/40 border-2 border-bitcoin-gray/20 rounded-xl focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange placeholder:text-bitcoin-gray/50 text-bitcoin-gray text-base">
```

**Specifications:**
- **Width**: `w-full`
- **Padding**: `px-4 py-3` (16px horizontal, 12px vertical)
- **Background**: `bg-bitcoin-dark/40` (40% opacity dark background)
- **Border**: `border-2 border-bitcoin-gray/20` (2px solid border, 20% opacity)
- **Radius**: `rounded-xl` (12px border radius)
- **Focus State**: `focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange`
- **Text Size**: `text-base` (16px)
- **Text Color**: `text-bitcoin-gray`
- **Placeholder**: `placeholder:text-bitcoin-gray/50` (50% opacity)

---

### 3. Textareas
```html
<textarea
  id="fieldId"
  formControlName="fieldName"
  rows="3"
  placeholder="e.g., Describe the content..."
  class="w-full px-4 py-3 bg-bitcoin-dark/40 border-2 border-bitcoin-gray/20 rounded-xl focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange placeholder:text-bitcoin-gray/50 text-bitcoin-gray text-base resize-none"></textarea>
```

**Specifications:**
- Same as text inputs, plus:
- **Rows**: `rows="3"` (adjustable based on content needs)
- **Resize**: `resize-none` (prevents user resizing)

---

### 4. File Inputs
```html
<input
  type="file"
  id="fileId"
  (change)="onFileSelected($event)"
  accept="image/*"
  class="w-full px-4 py-3 border-2 border-dashed border-bitcoin-orange/30 rounded-xl focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange bg-bitcoin-dark/40 text-bitcoin-gray text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bitcoin-orange/30 file:text-bitcoin-orange hover:file:bg-bitcoin-orange/40 file:cursor-pointer">
```

**Specifications:**
- **Border**: `border-2 border-dashed border-bitcoin-orange/30` (dashed border to indicate drop zone)
- **File Button Styling**:
  - `file:mr-4` - Right margin
  - `file:py-2 file:px-4` - Button padding
  - `file:rounded-lg` - Rounded button
  - `file:bg-bitcoin-orange/30` - Orange background (30% opacity)
  - `file:text-bitcoin-orange` - Orange text
  - `hover:file:bg-bitcoin-orange/40` - Hover state (40% opacity)
  - `file:cursor-pointer` - Pointer cursor

---

### 5. Checkboxes
```html
<input
  type="checkbox"
  [checked]="isSelected"
  (change)="onToggle($event)"
  class="w-5 h-5 rounded border-bitcoin-gray/30 text-bitcoin-orange focus:ring-bitcoin-orange bg-bitcoin-dark/60">
```

**Specifications:**
- **Size**: `w-5 h-5` (20px × 20px)
- **Border**: `border-bitcoin-gray/30`
- **Border Radius**: `rounded`
- **Checked Color**: `text-bitcoin-orange`
- **Focus Ring**: `focus:ring-bitcoin-orange`
- **Background**: `bg-bitcoin-dark/60`

---

### 6. Checkbox/Tag Selection Cards
```html
<label class="flex items-center gap-2 p-3 bg-bitcoin-dark/40 border-2 border-bitcoin-gray/20 rounded-xl hover:bg-bitcoin-dark/60 hover:border-bitcoin-orange/30 cursor-pointer transition-all">
  <input
    type="checkbox"
    class="w-5 h-5 rounded border-bitcoin-gray/30 text-bitcoin-orange focus:ring-bitcoin-orange bg-bitcoin-dark/60">
  <span class="text-lg">🏷️</span>
  <span class="text-base text-bitcoin-gray font-medium">Tag Name</span>
</label>
```

**Specifications:**
- **Display**: `flex items-center`
- **Gap**: `gap-2` (8px between elements)
- **Padding**: `p-3` (12px)
- **Background**: `bg-bitcoin-dark/40`
- **Border**: `border-2 border-bitcoin-gray/20`
- **Border Radius**: `rounded-xl`
- **Hover States**: 
  - `hover:bg-bitcoin-dark/60`
  - `hover:border-bitcoin-orange/30`
- **Cursor**: `cursor-pointer`
- **Transition**: `transition-all`
- **Icon Size**: `text-lg` (18px)
- **Text**: `text-base text-bitcoin-gray font-medium`

---

### 7. Helper Text (Below Inputs)
```html
<p class="mt-2 text-sm text-bitcoin-gray">
  Brief description or hint about this field
</p>
```

**Specifications:**
- **Margin Top**: `mt-2` (8px)
- **Size**: `text-sm` (14px)
- **Color**: `text-bitcoin-gray` (100% opacity for maximum readability)
- **Purpose**: Provide guidance, examples, or additional context

---

### 8. Primary Action Buttons
```html
<button
  type="submit"
  [disabled]="isSaving"
  class="flex-1 py-4 px-6 bg-bitcoin-orange/30 hover:bg-bitcoin-orange/40 text-bitcoin-orange border-2 border-bitcoin-orange/30 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
  <span>Submit</span>
</button>
```

**Specifications:**
- **Flex**: `flex-1` (takes available space)
- **Padding**: `py-4 px-6` (16px vertical, 24px horizontal)
- **Background**: `bg-bitcoin-orange/30` (30% opacity)
- **Hover**: `hover:bg-bitcoin-orange/40` (40% opacity)
- **Text Color**: `text-bitcoin-orange`
- **Border**: `border-2 border-bitcoin-orange/30`
- **Border Radius**: `rounded-xl`
- **Font Weight**: `font-bold`
- **Font Size**: `text-base`
- **Transition**: `transition-all duration-300`
- **Disabled State**: `disabled:opacity-50 disabled:cursor-not-allowed`
- **Layout**: `flex items-center justify-center gap-2` (for icon + text)

---

### 9. Secondary/Cancel Buttons
```html
<button
  type="button"
  (click)="onCancel()"
  [disabled]="isSaving"
  class="flex-1 py-4 px-6 bg-bitcoin-dark/40 hover:bg-bitcoin-dark/60 border-2 border-bitcoin-gray/20 text-bitcoin-gray font-bold text-base rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
  <span>Cancel</span>
</button>
```

**Specifications:**
- **Background**: `bg-bitcoin-dark/40`
- **Hover**: `hover:bg-bitcoin-dark/60`
- **Border**: `border-2 border-bitcoin-gray/20`
- **Text Color**: `text-bitcoin-gray`
- All other specs same as primary button

---

### 10. Button Container
```html
<div class="flex gap-4 pt-4">
  <!-- Buttons here -->
</div>
```

**Specifications:**
- **Display**: `flex`
- **Gap**: `gap-4` (16px between buttons)
- **Padding Top**: `pt-4` (16px separation from form content)

---

## Form Layout Standards

### Modal Container
```html
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  <div class="bg-bitcoin-dark/95 backdrop-blur-md border border-bitcoin-orange/20 rounded-2xl shadow-bitcoin-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <!-- Content -->
  </div>
</div>
```

### Modal Header
```html
<div class="p-6 border-b border-bitcoin-orange/20 flex items-center justify-between sticky top-0 bg-bitcoin-dark/95 backdrop-blur-md">
  <h2 class="text-2xl font-serif font-bold bitcoin-gradient-text">Form Title</h2>
  <button class="p-2 hover:bg-bitcoin-dark/60 text-bitcoin-gray hover:text-bitcoin-orange rounded-lg transition-colors">
    <!-- Close icon -->
  </button>
</div>
```

### Form Body
```html
<form [formGroup]="formName" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
  <!-- Form fields with space-y-6 for consistent vertical spacing -->
</form>
```

**Specifications:**
- **Padding**: `p-6` (24px)
- **Vertical Spacing**: `space-y-6` (24px between form sections)

---

## Accessibility Guidelines

1. **Always use `<label>` elements** with matching `for` attributes
2. **Mark required fields** with an asterisk (*) in the label
3. **Provide helper text** for complex or important fields
4. **Use placeholder text** as examples, not as labels
5. **Ensure sufficient color contrast** (our bitcoin-gray provides good contrast)
6. **Make checkboxes large enough** (`w-5 h-5` minimum)
7. **Provide clear focus states** (orange ring on all interactive elements)

---

## Responsive Considerations

### Grid Layouts for Tags/Checkboxes
```html
<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
  <!-- Tag items -->
</div>
```

**Breakpoints:**
- Mobile: 2 columns
- Small screens and up (640px+): 3 columns
- Gap: `gap-3` (12px)

---

## Common Patterns

### Image Preview
```html
<div class="rounded-2xl overflow-hidden border border-bitcoin-gray/20">
  <img [src]="previewUrl" alt="Preview" class="w-full h-64 object-cover">
</div>
```

### Scrollable Lists (Products, Tags)
```html
<div class="max-h-64 overflow-y-auto border-2 border-bitcoin-gray/20 rounded-xl bg-bitcoin-dark/40 p-3 space-y-2">
  <!-- List items -->
</div>
```

### Progress Bars
```html
<div class="space-y-2">
  <div class="flex items-center justify-between text-sm">
    <span class="text-bitcoin-gray font-medium">Uploading...</span>
    <span class="text-bitcoin-orange font-semibold">{{ progress }}%</span>
  </div>
  <div class="w-full bg-bitcoin-dark/60 rounded-full h-2.5 overflow-hidden border border-bitcoin-gray/20">
    <div 
      class="bg-gradient-to-r from-bitcoin-orange to-bitcoin-gold h-2.5 rounded-full transition-all duration-300 ease-out"
      [style.width.%]="progress">
    </div>
  </div>
</div>
```

---

## Do's and Don'ts

### ✅ Do's
- Use `text-base` for all form inputs and labels (minimum 16px)
- Use `border-2` for better visibility (2px borders)
- Provide helper text at 100% opacity for readability
- Use `font-bold` for buttons
- Use `font-semibold` for labels
- Include loading states for async operations
- Use consistent spacing (`space-y-6` between sections)

### ❌ Don'ts
- Don't use text smaller than `text-sm` (14px)
- Don't use helper text with 70% opacity or lower (hard to read)
- Don't use single-pixel borders (`border` alone)
- Don't make checkboxes smaller than `w-5 h-5`
- Don't use `font-medium` or lighter for labels
- Don't skip helper text for complex fields
- Don't forget disabled states on buttons

---

## Example: Complete Form Field

```html
<!-- Project Name Field -->
<div>
  <label for="projectName" class="block text-base font-semibold text-bitcoin-gray mb-3">
    Project Name *
  </label>
  <input
    type="text"
    id="projectName"
    formControlName="projectName"
    placeholder="e.g., Bitcoin Mining Farm Setup"
    class="w-full px-4 py-3 bg-bitcoin-dark/40 border-2 border-bitcoin-gray/20 rounded-xl focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange placeholder:text-bitcoin-gray/50 text-bitcoin-gray text-base">
  <p class="mt-2 text-sm text-bitcoin-gray">
    Project name (will be displayed as the title)
  </p>
</div>
```

---

## Color Reference Quick Guide

| Element | Color Class | Hex Code | Opacity |
|---------|-------------|----------|---------|
| Primary Text | `text-bitcoin-gray` | #9ca3af | 100% |
| Labels | `text-bitcoin-gray` | #9ca3af | 100% |
| Helper Text | `text-bitcoin-gray` | #9ca3af | 100% |
| Placeholder | `placeholder:text-bitcoin-gray/50` | #9ca3af | 50% |
| Borders | `border-bitcoin-gray/20` | #9ca3af | 20% |
| Focus Ring | `focus:ring-bitcoin-orange` | #f7931a | 100% |
| Primary Button | `text-bitcoin-orange` | #f7931a | 100% |
| Primary Button BG | `bg-bitcoin-orange/30` | #f7931a | 30% |
| Input Background | `bg-bitcoin-dark/40` | #0a0b0d | 40% |

---

## Version History

**v1.0** - October 14, 2025
- Initial documentation based on Gallery Admin forms
- Standardized font sizes, weights, and colors
- Established accessibility guidelines
- Created complete component examples

---

## Reference Files

For implementation examples, see:
- `src/app/pages/admin/gallery/gallery-admin.page.html` - Upload and Edit modals
- `src/app/pages/galeria/galeria.page.html` - Public gallery display patterns
