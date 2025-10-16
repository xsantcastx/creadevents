# SSR localStorage Fix

## Issue
The application was crashing during Server-Side Rendering (SSR) with the error:
```
ReferenceError: localStorage is not defined
```

This occurred because `localStorage` is a browser-only API and is not available in Node.js during SSR.

## Files Fixed

### 1. `src/app/core/services/language.service.ts`
**Problem**: Tried to access `localStorage` directly in the constructor/initialization
**Solution**: 
- Added `PLATFORM_ID` injection
- Added `isPlatformBrowser()` check before accessing `localStorage`
- Wrapped both reading and writing to `localStorage` in platform checks

**Changes**:
```typescript
// Added imports
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Added platform check
private platformId = inject(PLATFORM_ID);

// Protected localStorage access
if (isPlatformBrowser(this.platformId)) {
  const stored = localStorage.getItem(LS_LANG_KEY) as Language;
  // ... use stored value
}
```

### 2. `src/app/services/cart.service.ts`
**Problem**: Tried to access `localStorage` directly in the constructor
**Solution**: 
- Added `PLATFORM_ID` injection
- Added `isPlatformBrowser()` check in `load()` and `save()` methods
- Return empty cart state during SSR

**Changes**:
```typescript
// Added imports
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Added platform check
private platformId = inject(PLATFORM_ID);

// Protected localStorage access
private load(): CartState {
  if (!isPlatformBrowser(this.platformId)) {
    return { items: [] };
  }
  // ... access localStorage
}
```

## Best Practices for SSR

When working with Angular SSR, always:

1. **Check platform before using browser APIs**:
   ```typescript
   import { PLATFORM_ID, inject } from '@angular/core';
   import { isPlatformBrowser } from '@angular/common';
   
   private platformId = inject(PLATFORM_ID);
   
   if (isPlatformBrowser(this.platformId)) {
     // Safe to use browser APIs
     localStorage.setItem('key', 'value');
   }
   ```

2. **Common browser-only APIs to protect**:
   - `localStorage` / `sessionStorage`
   - `window`
   - `document`
   - `navigator`
   - `location`
   - DOM manipulation

3. **Provide fallback values** for SSR:
   ```typescript
   private load(): CartState {
     if (!isPlatformBrowser(this.platformId)) {
       return { items: [] }; // Fallback for SSR
     }
     return JSON.parse(localStorage.getItem('cart'));
   }
   ```

## Testing

After the fix, the application should:
- ✅ Render on the server without errors
- ✅ Hydrate properly in the browser
- ✅ Load saved language preference from localStorage (browser only)
- ✅ Load saved cart items from localStorage (browser only)
- ✅ Default to Spanish ('es') language during SSR
- ✅ Default to empty cart during SSR

## Status
✅ **FIXED** - The application now properly handles SSR without localStorage errors.

The server should now start successfully. If port 4200 is in use, the previous server instance may still be running.
