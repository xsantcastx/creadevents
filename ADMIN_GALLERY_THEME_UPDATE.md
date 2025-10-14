# Admin Gallery Page Theme Update

## Overview
Updated the admin gallery management page with Bitcoin mining theme, transforming the white/gray interface into a dark, premium design with Bitcoin orange/gold accents.

## Changes Made

### 1. Main Container & Header
- **Background**: `bg-gradient-to-b from-[#0a0b0d] to-[#13151a]`
- **Header**: Dark gradient with Bitcoin orange border
- **Title**: `bitcoin-gradient-text` class
- **Back arrow**: Bitcoin gray with orange hover
- **Logout button**: Red theme with border

### 2. Success/Error Messages
**Success Messages:**
- Background: `bg-bitcoin-gold/20`
- Border: `border-bitcoin-gold/30`
- Text/Icon: `text-bitcoin-gold`

**Error Messages:**
- Background: `bg-red-500/20`
- Border: `border-red-500/30`
- Text/Icon: `text-red-400`

### 3. Tag Filter Buttons
- **Active state**: `bg-bitcoin-orange text-white border-bitcoin-orange`
- **Inactive state**: `bg-bitcoin-dark/40 text-bitcoin-gray border-bitcoin-gray/20`
- Smooth transitions on selection
- Border on all states for definition

### 4. Search & Upload Bar
**Search Input:**
- Background: `bg-bitcoin-dark/40`
- Border: `border-bitcoin-gray/20`
- Focus: Orange ring effect
- Text: `text-bitcoin-gray`
- Placeholder: `text-bitcoin-gray/50`

**Upload Button:**
- Background: `bg-bitcoin-orange/30 hover:bg-bitcoin-orange/40`
- Text: `text-bitcoin-orange`
- Border: `border-bitcoin-orange/30`

### 5. Loading State
- Card: `bg-bitcoin-dark/40 backdrop-blur-sm`
- Border: `border-bitcoin-gray/20`
- Spinner: `text-bitcoin-orange`
- Shadow: `shadow-bitcoin`

### 6. Empty State
- Same dark card styling as loading
- Icon: `text-bitcoin-gray/30`
- Text: `text-bitcoin-gray/70`
- Upload button: Bitcoin orange theme

### 7. Media Grid Cards
**Card Container:**
- Background: `bg-bitcoin-dark/40 backdrop-blur-sm`
- Border: `border-bitcoin-gray/20`
- Hover: `hover:border-bitcoin-orange/30 hover:shadow-bitcoin-lg`
- Shadow: `shadow-bitcoin`

**Image Container:**
- Background (no image): `bg-bitcoin-dark/60`
- Overlay: `bg-black/60` on hover

**Action Buttons (Overlay):**
- **Edit**: `bg-bitcoin-orange/30 hover:bg-bitcoin-orange/40 text-bitcoin-orange border-bitcoin-orange/30`
- **Delete**: `bg-red-500/30 hover:bg-red-500/40 text-red-400 border-red-500/30`

**Tags:**
- Background: `bg-bitcoin-gold/20`
- Text: `text-bitcoin-gold`
- Border: `border-bitcoin-gold/30`

**Alt Text:**
- Color: `text-bitcoin-gray`

**Related Products:**
- Label: `text-bitcoin-gray/70`
- Badges: `bg-bitcoin-orange/20 text-bitcoin-orange border-bitcoin-orange/30`

**Metadata:**
- Text: `text-bitcoin-gray/70`
- Border: `border-bitcoin-gray/20`

### 8. Upload Modal
**Modal Container:**
- Background: `bg-bitcoin-dark/95 backdrop-blur-md`
- Border: `border-bitcoin-orange/20`
- Shadow: `shadow-bitcoin-lg`
- Backdrop: `bg-black/70 backdrop-blur-sm`

**Modal Header:**
- Background: `bg-bitcoin-dark/95 backdrop-blur-md`
- Title: `bitcoin-gradient-text`
- Close button: Bitcoin gray with orange hover

**Warning Message:**
- Background: `bg-bitcoin-orange/20`
- Border: `border-bitcoin-orange/30`
- Text: `text-bitcoin-orange`

**Preview Image:**
- Border: `border-bitcoin-gray/20`

**File Input:**
- Background: `bg-bitcoin-dark/40`
- Border: `border-dashed border-bitcoin-orange/30`
- Focus: Orange ring
- Help text: `text-bitcoin-gray/70`

**Alt Text Input:**
- Same Bitcoin dark theme as file input
- Placeholder: `text-bitcoin-gray/50`

**Tag Checkboxes:**
- Container: `bg-bitcoin-dark/40 border-bitcoin-gray/20`
- Hover: `hover:bg-bitcoin-dark/60 hover:border-bitcoin-orange/30`
- Checkbox: Bitcoin orange accent
- Label text: `text-bitcoin-gray`

**Related Products List:**
- Container: `bg-bitcoin-dark/40 border-bitcoin-gray/20`
- Item hover: `hover:bg-bitcoin-dark/60`
- Checkboxes: Bitcoin orange theme
- Empty state: `text-bitcoin-gray/70`

**Upload Progress:**
- Label: `text-bitcoin-gray`
- Percentage: `text-bitcoin-orange`
- Track: `bg-bitcoin-dark/60 border-bitcoin-gray/20`
- Bar: `bg-gradient-to-r from-bitcoin-orange to-bitcoin-gold`

**Action Buttons:**
- **Upload**: `bg-bitcoin-orange/30 hover:bg-bitcoin-orange/40 text-bitcoin-orange border-bitcoin-orange/30`
- **Cancel**: `bg-bitcoin-dark/40 hover:bg-bitcoin-dark/60 border-bitcoin-gray/20 text-bitcoin-gray`

### 9. Edit Modal
- Same styling as Upload Modal
- Bitcoin gradient title: "Edit Media"
- Dark background with orange accents
- All form fields use Bitcoin theme

## Color Usage

### Backgrounds
- **Main**: Dark gradient (`#0a0b0d` → `#13151a`)
- **Cards/Modals**: `bitcoin-dark/40` or `bitcoin-dark/95` with backdrop blur
- **Inputs**: `bitcoin-dark/40`
- **Hover**: `bitcoin-dark/60`

### Text
- **Primary**: `bitcoin-gray`
- **Secondary**: `bitcoin-gray/70`
- **Placeholder**: `bitcoin-gray/50`
- **Disabled**: `bitcoin-gray/30`

### Accents
- **Primary Actions**: Bitcoin orange (`#f7931a`)
- **Success**: Bitcoin gold (`#ffb81c`)
- **Tags**: Bitcoin gold
- **Related Products**: Bitcoin orange
- **Delete**: Red (`red-400/500`)

### Borders
- **Default**: `bitcoin-gray/20`
- **Hover**: `bitcoin-orange/30`
- **Active**: `bitcoin-orange/20`
- **Dashed (file upload)**: `bitcoin-orange/30`

### Shadows
- **Default**: `shadow-bitcoin`
- **Enhanced hover**: `shadow-bitcoin-lg`

## Visual Improvements

1. **Premium Look**: Dark backgrounds with semi-transparency create depth
2. **Backdrop Blur**: Modals use blur effect for modern glassmorphism
3. **Consistent Accents**: Bitcoin orange/gold used throughout for actions
4. **Better Contrast**: Text colors carefully chosen for readability
5. **Smooth Transitions**: All hover states have smooth color transitions
6. **Visual Hierarchy**: Orange accents draw attention to primary actions
7. **Tag System**: Gold color distinguishes category tags
8. **Progress Bar**: Gradient from orange to gold for uploading
9. **Modal Experience**: Dark themed modals match overall aesthetic

## Files Modified
- `src/app/pages/admin/gallery/gallery-admin.page.html` - Complete template update

## Features Themed

### Main Gallery View
- ✅ Header with gradient title
- ✅ Success/error message banners
- ✅ Tag filter buttons (active/inactive states)
- ✅ Search input with icon
- ✅ Upload button
- ✅ Loading state
- ✅ Empty state
- ✅ Media grid cards
- ✅ Image overlays with edit/delete buttons
- ✅ Tag badges
- ✅ Related product badges
- ✅ Metadata display

### Upload Modal
- ✅ Modal container with backdrop blur
- ✅ Modal header
- ✅ Warning messages
- ✅ Image preview
- ✅ File upload input
- ✅ Alt text input
- ✅ Tag selection checkboxes
- ✅ Related products list
- ✅ Upload progress bar
- ✅ Submit/cancel buttons

### Edit Modal
- ✅ Same styling as upload modal
- ✅ All form elements themed

## Testing Checklist
- [ ] Gallery header displays with Bitcoin theme
- [ ] Tag filter buttons work with active/inactive states
- [ ] Search input has dark background with orange focus
- [ ] Upload button themed correctly
- [ ] Media cards show with hover effects
- [ ] Edit/delete buttons appear on image hover
- [ ] Tags display with gold theme
- [ ] Related products show with orange badges
- [ ] Upload modal opens with dark theme
- [ ] Progress bar shows gradient animation
- [ ] Edit modal displays correctly
- [ ] All form inputs have Bitcoin theme
- [ ] Success/error messages display properly

## Next Steps
Continue theme updates with remaining admin pages:
1. Admin Orders
2. Admin Users
3. Admin Catalog
4. Admin Seed
5. Public pages (Productos, Galeria, Contacto, Cart)
6. Client area pages
