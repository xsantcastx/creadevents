# Shipping Calculator Implementation

## Overview
The shipping calculator is a Firebase Cloud Function that calculates shipping costs and taxes based on cart contents and delivery address.

## Architecture

### Cloud Function: `cartReprice`
**Location:** `functions/src/index.ts`  
**Type:** HTTPS Callable Function  
**Purpose:** Calculate shipping methods, costs, and taxes

### Frontend Service: `ShippingService`
**Location:** `src/app/services/shipping.service.ts`  
**Purpose:** Call the Cloud Function from Angular components

## How It Works

### 1. User Flow
```
Cart Page → Checkout Review → Select Address → Calculate Shipping → Choose Method → Payment
```

### 2. Shipping Calculation Process

1. **User provides shipping address** (minimum: country, region, postal code)
2. **Frontend calls `ShippingService.calculateShipping(cartId, address)`**
3. **Cloud Function executes:**
   - Fetches cart from Firestore
   - Calculates total weight (5-15kg per mining hardware unit)
   - Determines shipping rates based on destination country
   - Calculates tax based on destination (VAT/GST/Sales Tax)
   - Returns two shipping options: Standard & Express
4. **Function updates cart in Firestore** with calculated totals
5. **Frontend receives shipping methods** and displays to user
6. **User selects shipping method** and proceeds to payment

### 3. Weight Calculation
Bitcoin mining hardware is heavy equipment:
- Default: 5kg per unit if weight not specified
- Actual weights stored in product catalog
- Examples:
  - Antminer S19 Pro: 14.5kg
  - Whatsminer M30S+: 11.5kg
  - Avalon 1246: 12.0kg

### 4. Shipping Rates

**Rate Structure:**
```
Cost = Base Rate + (Weight in kg × Per-kg Rate)
```

**Country Examples:**
- **US**: $15 standard + $2/kg (5-7 days) | $35 express + $4/kg (2-3 days)
- **Canada**: $20 + $3/kg (7-10 days) | $45 + $5/kg (3-5 days)
- **Europe**: $30 + $4/kg (10-14 days) | $60 + $7/kg (5-7 days)
- **Asia/Australia**: $35-40 + $5-6/kg (14-21 days) | $70-80 + $8-9/kg (7-10 days)

### 5. Tax Calculation

**Applied by destination country:**
- US: 0% (sales tax handled separately by state)
- Canada: 13% (GST+PST average)
- Mexico: 16% (IVA)
- UK: 20% (VAT)
- France: 20% (TVA)
- Germany: 19% (MwSt)
- Spain: 21% (IVA)
- Italy: 22% (IVA)
- China: 13% (VAT)
- Japan: 10% (Consumption Tax)
- Australia: 10% (GST)

**Tax applied to:** `(Subtotal + Shipping) × Tax Rate`

### 6. Total Calculation

```typescript
subtotal = sum of (item.unitPrice × item.qty)
shipping = selected method cost
tax = (subtotal + shipping) × taxRate
discount = promo code discount (if applied)
total = subtotal + shipping + tax - discount
```

## Usage Example

### In Checkout Component:

```typescript
import { ShippingService } from '@services/shipping.service';
import { CartService } from '@services/cart.service';

export class CheckoutReviewComponent {
  private shipping = inject(ShippingService);
  private cart = inject(CartService);
  
  shippingMethods: ShippingMethod[] = [];
  selectedMethod: ShippingMethod | null = null;
  
  calculateShipping(address: Address) {
    const cartId = this.cart.snapshot()?.id;
    
    if (!cartId || !address) {
      return;
    }
    
    this.shipping.calculateShipping(cartId, address).subscribe({
      next: (response) => {
        this.shippingMethods = response.shippingMethods;
        this.selectedMethod = response.shippingMethods[0]; // Default to standard
        
        console.log('Calculated totals:', response.totals);
        // Cart is automatically updated in Firestore
      },
      error: (err) => {
        console.error('Failed to calculate shipping:', err);
        this.error = 'Unable to calculate shipping. Please try again.';
      }
    });
  }
  
  selectMethod(method: ShippingMethod) {
    this.selectedMethod = method;
    // Optionally re-calculate with selected method
    // For now, standard is applied by default
  }
}
```

## Testing

### Local Testing with Emulator:
```bash
cd functions
npm run serve
```

### Test Call:
```typescript
// In your Angular app, ensure Functions points to emulator
import { connectFunctionsEmulator } from '@angular/fire/functions';

// In app.config.ts
provideFirebaseApp(() => {
  const functions = getFunctions(app);
  if (environment.useEmulators) {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
  return functions;
});
```

### Manual Test:
```bash
# Using Firebase CLI
firebase functions:shell

# Then in shell:
cartReprice({ 
  cartId: 'test-cart-id', 
  address: { country: 'US', region: 'CA', postalCode: '94102' } 
})
```

## Deployment

```bash
# Deploy only shipping function
firebase deploy --only functions:cartReprice

# Deploy all functions
cd functions
npm run deploy
```

## Future Enhancements

1. **Real-time carrier rates** - Integrate with UPS/FedEx/DHL APIs for live quotes
2. **Insurance options** - Add optional shipping insurance for high-value orders
3. **Tracking integration** - Generate tracking numbers and sync with carriers
4. **Multi-warehouse** - Calculate shipping from nearest warehouse
5. **Bulk discounts** - Reduced per-kg rates for large orders (10+ miners)
6. **Customs calculation** - Detailed duties and import fees for international orders

## Security Notes

- Function validates cart ownership (user UID or anonymous ID)
- Only authenticated users can call the function
- Cart must exist in Firestore
- Address country must be provided
- All prices rounded to 2 decimal places
- Cart updates use server timestamp for consistency
