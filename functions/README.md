# Cloud Functions for TheLuxMining

This directory contains Firebase Cloud Functions for backend operations like shipping calculation, payment processing, and order management.

## Setup

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Build TypeScript:**
   ```bash
   npm run build
   ```

3. **Run locally with emulator:**
   ```bash
   npm run serve
   ```

## Functions

### `cartReprice`
**Type:** HTTPS Callable Function  
**Purpose:** Calculate shipping costs and taxes for a cart based on delivery address

**Input:**
```typescript
{
  cartId: string;
  address: {
    country: string;
    region: string;
    postalCode: string;
  }
}
```

**Output:**
```typescript
{
  success: boolean;
  shippingMethods: [
    {
      id: "standard" | "express";
      name: string;
      description: string;
      cost: number;
      currency: "USD";
      estimatedDays: string;
    }
  ];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: "USD";
  }
}
```

**Shipping Rates:**
- Bitcoin mining hardware is heavy (5-15kg per unit)
- Rates vary by destination country
- Two options: Standard (5-14 days) and Express (2-7 days)

**Tax Calculation:**
- Applied based on destination country
- VAT/GST/Sales tax rates included for 11 countries
- 0% tax for unsupported countries (handle manually)

## Deployment

**Deploy all functions:**
```bash
npm run deploy
```

**Deploy specific function:**
```bash
firebase deploy --only functions:cartReprice
```

## Environment Variables

Set up environment variables for production:
```bash
firebase functions:config:set stripe.secret_key="sk_live_..."
firebase functions:config:set brevo.api_key="xkeysib-..."
```

## Testing

Test functions locally using the Firebase Emulator Suite:
```bash
npm run serve
```

Then call functions from your app pointed at `http://localhost:5001`.

## Security

- All callable functions validate input
- Cart ownership verified (user ID or anonymous ID)
- Payment operations require server-side validation
- Webhook signatures verified for Stripe events
