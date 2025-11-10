# Stripe Webhook Setup Guide

## Current Status
✅ Stripe Secret Key: Configured in `functions/.env`
✅ Webhook Secret: Configured in `functions/.env`
✅ Cloud Functions: Deployed and working
✅ Webhook Function URL: `https://us-central1-theluxmining-91ab1.cloudfunctions.net/handleStripeWebhook`

## Verify Webhook in Stripe Dashboard

### 1. Check Webhook Registration
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Look for endpoint: `https://us-central1-theluxmining-91ab1.cloudfunctions.net/handleStripeWebhook`
3. Verify it's listening for: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`

### 2. If Webhook NOT Found:
**Add the webhook:**
1. Click "Add endpoint"
2. Enter URL: `https://us-central1-theluxmining-91ab1.cloudfunctions.net/handleStripeWebhook`
3. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. Click "Add endpoint"
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update `functions/.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_NEW_SECRET_HERE
   ```
7. Redeploy functions:
   ```bash
   cd functions
   firebase deploy --only functions --project theluxmining-91ab1
   ```

### 3. Test Customer Data in Stripe

After the webhook is properly configured, when you make a payment:

**✅ What you should see in Stripe Dashboard:**

Go to: https://dashboard.stripe.com/test/payments

Click on a payment → You should see:
- **Customer details section** with:
  - Name: John Doe
  - Email: customer@example.com
  
- **Shipping information section** with:
  - Name: John Doe
  - Phone: +1234567890
  - Address: 123 Main St, City, State, ZIP, Country

**❌ If you DON'T see customer info:**
- The payment was made BEFORE we deployed the updated `createPaymentIntent` function
- Make a NEW test payment to see the customer data

### 4. Recent Logs Show Webhook Working

```
2025-10-15T20:31:15 - handleStripeWebhook: Function execution started
2025-10-15T20:31:20 - Processing payment success: pi_3SIbLpFOgtmX1g3v1i9PdjW2
2025-10-15T20:31:21 - Order created successfully: LUX-20251015-6804
```

The webhook IS processing payments and creating orders! ✅

### 5. Customer Information Flow

1. **Cart Page** → User selects address → Saved to `cart.shippingAddress`
2. **Payment Page** → Calls `createPaymentIntent` function
3. **Cloud Function** → Creates Stripe PaymentIntent with shipping info
4. **Stripe** → Shows customer data in dashboard
5. **Webhook** → After payment succeeds, creates order in Firestore

## Troubleshooting

### No customer data in Stripe?
- Make sure you selected an address in the cart BEFORE going to payment
- The address must be saved to the cart (check Firestore → carts → your-cart-id → shippingAddress field)
- Make a NEW payment after the latest function deployment

### Webhook not receiving events?
- Check webhook is enabled in Stripe Dashboard
- Verify the endpoint URL matches exactly
- Check webhook signing secret matches in `.env` file
- Look at Stripe Dashboard → Webhooks → [Your endpoint] → Recent deliveries

### Orders not appearing?
- Check Firebase Functions logs: `firebase functions:log --project theluxmining-91ab1`
- Look for "Order created successfully" messages
- Check Firestore → orders collection directly

## Current Configuration

**Function URLs:**
- Create Payment Intent: `https://us-central1-theluxmining-91ab1.cloudfunctions.net/createPaymentIntent`
- Handle Webhook: `https://us-central1-theluxmining-91ab1.cloudfunctions.net/handleStripeWebhook`
- Cart Reprice: `https://us-central1-theluxmining-91ab1.cloudfunctions.net/cartReprice`

**Test Mode Keys:**
- Secret Key: `sk_test_51SIVd0FOgtmX1g3v...` (in functions/.env)
- Webhook Secret: `whsec_6sQfZVHy1oAhkbDtWxN2HS0qoEG9lV2I` (in functions/.env)

## Next Steps

1. ✅ Verify webhook is registered in Stripe Dashboard
2. ✅ Make a test payment with full address selected
3. ✅ Check Stripe payment for customer information
4. ✅ Verify order appears in admin panel
5. ✅ Verify order appears in client orders page
