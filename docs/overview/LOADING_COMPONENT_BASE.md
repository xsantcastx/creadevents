# LoadingComponentBase - Developer Guide

## Quick Reference

**File:** `src/app/core/classes/loading-component.base.ts`

**Purpose:** Centralized loading state management for Firebase operations.

---

## Basic Usage

```typescript
import { LoadingComponentBase } from '../../core/classes/loading-component.base';

export class YourComponent extends LoadingComponentBase implements OnInit {
  
  constructor(private firestore: Firestore) {
    super(); // ← Required if constructor exists
  }
  
  async ngOnInit() {
    await this.withLoading(async () => {
      this.data = await this.loadData();
    });
  }
}
```

---

## API Methods

### `withLoading<T>(operation, showError?)`

Wraps async operations with automatic loading state.

```typescript
// Basic usage
await this.withLoading(async () => {
  this.products = await this.service.getProducts();
});

// With error display
await this.withLoading(async () => {
  this.data = await this.service.getData();
}, true); // Shows error in UI
```

### Manual Controls

```typescript
this.setLoading(true);           // Show loading
this.setLoading(false);          // Hide loading
this.setError('Error message');  // Set error
this.clearError();               // Clear error
this.forceUpdate();              // Force change detection
```

---

## Inherited Properties

- `isLoading: boolean` - Loading state flag
- `errorMessage: string` - Error message text
- `cdr: ChangeDetectorRef` - Change detector

---

## Migration Checklist

1. Import: `import { LoadingComponentBase } from '../../core/classes/loading-component.base';`
2. Extend: `extends LoadingComponentBase`
3. Remove: Manual `isLoading`, `cdr` declarations
4. Add: `super()` in constructor
5. Wrap: Use `withLoading()` for async operations
6. Remove: Manual `cdr.detectChanges()` calls

---

## Benefits

✅ Eliminates 10-15 lines per component  
✅ Automatic change detection  
✅ Consistent error handling  
✅ Fixes scroll-to-load issues  
✅ Cleaner, more readable code
