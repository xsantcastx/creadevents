# Fixes Applied - October 11, 2025

## Issue: Firebase SDK Version Mismatch

### Problem
You were experiencing the error:
```
_FirebaseError: Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?
```

This was caused by a **version conflict** between:
- `@angular/fire@20.0.1` (requires Firebase 11.x)
- `firebase@12.3.0` (too new - incompatible)

### Solution Applied

1. **Downgraded Firebase to 11.10.0**
   - Changed `firebase` from `^12.3.0` to `11.10.0` in `package.json`

2. **Added Version Override**
   - Added `"overrides"` section to `package.json`:
     ```json
     "overrides": {
       "firebase": "11.10.0"
     }
     ```
   - This ensures all dependencies use the same Firebase version

3. **Clean Reinstall**
   - Removed `node_modules` and `package-lock.json`
   - Ran `npm cache verify`
   - Ran `npm install`

### Verification

✅ **Version Check Passed:**
```
tstone-web@0.0.0
├─┬ @angular/fire@20.0.1
│ ├── firebase@11.10.0 deduped
│ └─┬ rxfire@6.1.0
│   └── firebase@11.10.0 deduped
└── firebase@11.10.0 overridden
```

✅ **Import Check Passed:**
- No `firebase/compat/*` imports found
- Only one direct Firebase import (`firebase/analytics`) for feature detection
- All other imports use `@angular/fire/*` correctly
- Firebase initialized only once in `app.config.ts`

✅ **Compilation:** No errors

## Previous Fixes (Same Session)

### 1. Firestore CollectionReference Type Casting Issue
**Fixed Services:**
- `template.service.ts`
- `size-group.service.ts`
- `material.service.ts`
- `category.service.ts`
- `media.service.ts`

**Changes:** Removed `CollectionReference` and `DocumentReference` type casts that were causing SDK instance mismatches.

### 2. HTML Template Structure
**File:** `products-admin.page.html`

**Issues Fixed:**
- Line 13: Added missing closing `</div>` for header left section
- Line 236: Removed extra closing `</div>` after stepper section

### 3. Theme System
**Created:**
- Comprehensive theme class system in `styles.scss`
- `THEME_CLASSES.md` documentation with 20+ reusable component classes

**Fixed:**
- Megamenu transparency (added `bg-opacity-100`)
- Product link visibility (added `text-neutral-900 font-medium`)

## Current Status

✅ **All Systems Operational**
- No compilation errors
- No runtime Firestore SDK errors
- Correct Firebase version (11.10.0) throughout dependency tree
- All services using proper AngularFire imports
- HTML templates valid
- Theme system complete

## Maintenance Notes

### To Prevent Future Issues:

1. **Always check compatibility** before upgrading Firebase or AngularFire
   - `@angular/fire@20.x` → requires `firebase@11.x`
   - Check: https://github.com/angular/angularfire/blob/main/docs/version-compatibility.md

2. **Use overrides** to lock Firebase version:
   ```json
   "overrides": {
     "firebase": "11.10.0"
   }
   ```

3. **Verify after install:**
   ```bash
   npm ls firebase @angular/fire
   ```

4. **Stick to one SDK:**
   - Use `@angular/fire/*` imports exclusively in Angular apps
   - Avoid mixing with direct `firebase/*` imports (except for feature detection)
   - Never use `firebase/compat/*` unless absolutely necessary

5. **Single initialization:**
   - Keep Firebase initialization in one place (`app.config.ts`)
   - Don't create multiple Firestore instances
