# Firebase Storage Rules Update

**Date:** October 27, 2025  
**Status:** ✅ Deployed

## Issue
Hero images upload was failing with 403 Forbidden error:
```
Firebase Storage: User does not have permission to access 'hero-images/hero-1761578673306.jpg'. (storage/unauthorized)
```

## Solution
Added storage rules for hero images and settings images paths.

## Updated Rules

### New Paths Added:

1. **Hero Images** (`/hero-images/{imageName}`)
   - **Read**: Public (anyone can view)
   - **Write**: Admin only
   - **Delete**: Admin only
   - **Validation**: Must be valid image, max 10MB

2. **Settings Images** (`/settings/{allPaths=**}`)
   - **Read**: Public (anyone can view)
   - **Write**: Admin only
   - **Delete**: Admin only
   - **Validation**: Must be valid image, max 10MB
   - **Purpose**: OG images, logos, favicon, etc.

## Complete Storage Structure

```
firebase.storage/
├── products/              # Product images (covers + galleries)
│   └── {allPaths}         # Admin write, public read
├── gallery/
│   ├── {imageName}        # Flat gallery images
│   └── {category}/        # Categorized gallery (legacy)
│       └── {imageName}
├── hero-images/           # Homepage hero carousel (NEW)
│   └── {imageName}        # Admin write, public read
├── settings/              # Site settings images (NEW)
│   └── {allPaths}         # Admin write, public read
└── users/
    └── {userId}/          # User profile images
        └── {imageName}    # User/admin write, public read
```

## Security Features

### Helper Functions:
- `isAuthenticated()` - Checks if user is logged in
- `isAdmin()` - Verifies user has admin role in Firestore
- `isValidImage()` - Validates:
  - Content type is `image/*`
  - File size < 10MB

### Access Control:
- **Products**: Admin write, public read
- **Gallery**: Admin write, public read
- **Hero Images**: Admin write, public read ✅ NEW
- **Settings**: Admin write, public read ✅ NEW
- **User Profiles**: User/admin write, public read
- **All Other Paths**: Denied

## Deployment

```bash
firebase deploy --only storage
```

**Result:** ✅ Rules compiled and deployed successfully

## Testing

To test hero images upload:
1. Log in as admin
2. Navigate to Admin → Settings → "Home Hero Images"
3. Click "Add Image"
4. Select an image file (JPEG, PNG, or WebP, < 10MB)
5. Upload should succeed with progress bar
6. Image should appear in the list with thumbnail

## Files Modified

- `storage.rules` - Added hero-images and settings paths

## Related Documentation

- [Hero Images Management](./HERO_IMAGES_MANAGEMENT.md)
- [Image Optimization](./AUTO_IMAGE_OPTIMIZATION.md)
- [Firebase Storage Security](https://firebase.google.com/docs/storage/security)

---

**Next Steps:**
- Test hero images upload from admin panel
- Verify images are publicly accessible
- Confirm automatic optimization works with new path
