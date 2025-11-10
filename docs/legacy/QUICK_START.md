# 🚀 Quick Start Deployment Guide

## Overview
This guide will get your payment system deployed and tested in **~30 minutes**.

---

## Prerequisites Checklist
- [x] Cloud Functions built successfully (`npm run build` ✅)
- [ ] Stripe account created
- [ ] Firebase CLI installed and logged in
- [ ] Firebase project selected

---

## Part 1: Get Stripe API Keys (5 minutes)

### Step 1: Access Stripe Dashboard
1. Go to: **https://dashboard.stripe.com**
2. Sign in or create account
3. Toggle to **Test Mode** (switch in top right corner)

### Step 2: Get Your API Keys
1. Navigate to: **Developers** → **API keys**
2. Copy **Publishable key** (starts with `pk_test_`)
   ```
   Example: pk_test_51ABC123...xyz
   ```
3. Click "Reveal test key" for **Secret key** (starts with `sk_test_`)
   ```
   Example: sk_test_51ABC123...xyz
   ```

**⚠️ Important**: Keep your secret key secure! Never commit it to git.

---

## Part 2: Configure Frontend (2 minutes)

### Update Environment File
Open: `src/environments/environment.ts`

Find this section:
```typescript
stripe: {
  publishableKey: 'pk_test_51QJ7ZtP9wy1example' // Replace with your actual test key
}
```

Replace with your **actual publishable key**:
```typescript
stripe: {
  publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE'
}
```

**Save the file** ✅

---

## Part 3: Configure Backend (3 minutes)

### Set Stripe Secret Key in Firebase
Run this command (replace with your actual secret key):

```bash
firebase functions:config:set stripe.secret_key="sk_test_YOUR_ACTUAL_SECRET_KEY"
```

### Verify Configuration
```bash
firebase functions:config:get
```

**Expected output**:
```json
{
  "stripe": {
    "secret_key": "sk_test_YOUR_KEY"
  }
}
```

---

## Part 4: Deploy Cloud Functions (10 minutes)

### Option A: Deploy All Functions (Recommended)
```bash
firebase deploy --only functions
```

### Option B: Deploy Individual Functions
```bash
# Deploy shipping calculator
firebase deploy --only functions:cartReprice

# Deploy payment intent creator
firebase deploy --only functions:createPaymentIntent

# Deploy webhook handler
firebase deploy --only functions:handleStripeWebhook
```

### Verify Deployment
After deployment completes, you'll see output like:
```
✔  functions[us-central1-cartReprice]: Successful update operation.
✔  functions[us-central1-createPaymentIntent]: Successful update operation.
✔  functions[us-central1-handleStripeWebhook]: Successful update operation.

Function URL (handleStripeWebhook):
https://us-central1-YOUR-PROJECT.cloudfunctions.net/handleStripeWebhook
```

**📋 Copy the handleStripeWebhook URL** - you'll need it in the next step!

---

## Part 5: Configure Stripe Webhook (5 minutes)

### Step 1: Add Webhook Endpoint in Stripe Dashboard
1. Go to: **https://dashboard.stripe.com/test/webhooks**
2. Click **"+ Add endpoint"** button
3. **Endpoint URL**: Paste your function URL
   ```
   https://us-central1-YOUR-PROJECT.cloudfunctions.net/handleStripeWebhook
   ```
4. **Description**: "TheLuxMining Order Processing" (optional)
5. Click **"Select events"**
6. Select these events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
7. Click **"Add endpoint"**

### Step 2: Get Webhook Signing Secret
1. Click on your newly created endpoint
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_`)
   ```
   Example: whsec_ABC123xyz...
   ```

### Step 3: Set Webhook Secret in Firebase
```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SIGNING_SECRET"
```

### Step 4: Redeploy Webhook Function (with secret)
```bash
firebase deploy --only functions:handleStripeWebhook
```

---

## Part 6: Start Development Server (1 minute)

### Start Angular App
```bash
npm start
```

**Wait for**:
```
✔ Browser application bundle generation complete.
Local: http://localhost:4200/
```

---

## Part 7: Test Payment Flow (10 minutes)

### 🧪 Complete End-to-End Test

#### 1. Add Product to Cart
1. Open browser: **http://localhost:4200**
2. Browse to products page
3. Click "Add to Cart" on any product
4. Verify cart icon shows item count

#### 2. Proceed to Checkout
1. Click cart icon or navigate to cart page
2. Click **"Proceed to Checkout"**
3. Sign in (or create account if needed)

#### 3. Checkout Review
1. Add or select shipping address
2. Wait for shipping calculator (should show rates)
3. Select shipping method (Standard or Express)
4. Verify order summary shows correct totals
5. Click **"Proceed to Payment"**

#### 4. Payment Page
1. Card Number: **4242 4242 4242 4242**
2. Expiry: **12/34** (any future date)
3. CVC: **123** (any 3 digits)
4. ZIP: **12345** (any 5 digits)
5. Fill in billing address
6. Click **"Pay $X.XX"**
7. Watch for loading spinner

#### 5. Confirmation Page
**Expected**: Automatic redirect to confirmation page

**Should see**:
- ✅ Green checkmark icon
- ✅ "Order Confirmed!" heading
- ✅ Order number (format: LUX-20251015-XXXX)
- ✅ "Confirmation Email Sent" notice
- ✅ Order summary with items
- ✅ Totals (subtotal, shipping, tax, total)
- ✅ Shipping information
- ✅ Estimated delivery date
- ✅ Action buttons (View Orders, Download Invoice, Continue Shopping)

---

## Part 8: Verify Data (5 minutes)

### Check Firestore Database
1. Go to: **Firebase Console** → **Firestore Database**

#### Verify Order Created
2. Collection: **orders**
3. Should see new document with:
   - `orderNumber`: "LUX-YYYYMMDD-XXXX"
   - `status`: "pending"
   - `items`: array of products
   - `total`: correct amount
   - `userId`: your user ID
   - `createdAt`: timestamp

#### Verify Payment Record
4. Collection: **payments**
5. Document ID should match PaymentIntent ID
6. Should contain:
   - `status`: "succeeded"
   - `orderId`: matches order above
   - `orderNumber`: matches order above
   - `amount`: correct total

#### Verify Stock Decremented
7. Collection: **products**
8. Find product you ordered
9. Verify `stock` field decreased by quantity ordered

#### Verify Stock Log
10. Collection: **stock_log**
11. Should see entry with:
    - `change`: negative number (-qty)
    - `reason`: "order_placed"
    - `orderId`: your order ID
    - `previousStock` and `newStock`

#### Verify Cart Completed
12. Collection: **carts**
13. Your cart should have:
    - `status`: "completed"
    - `orderId`: your order ID
    - `completedAt`: timestamp

#### Verify Webhook Logged
14. Collection: **webhooks_log**
15. Should see event with:
    - `type`: "payment_intent.succeeded"
    - `processed`: true
    - `processedAt`: timestamp

### Check Stripe Dashboard
1. Go to: **https://dashboard.stripe.com/test/payments**
2. Should see your payment with:
   - Amount matches order total
   - Status: **Succeeded**
   - Description: "TheLuxMining Order - X item(s)"

3. Go to: **https://dashboard.stripe.com/test/events**
4. Should see recent events:
   - `payment_intent.succeeded`
   - Webhook delivery should show **Succeeded**

---

## 🎉 Success Criteria

### ✅ All Systems Working If:
- [x] Payment page loaded without errors
- [x] Test payment succeeded
- [x] Redirected to confirmation page
- [x] Order number displayed
- [x] Order created in Firestore
- [x] Product stock decremented
- [x] Stock change logged
- [x] Cart marked as completed
- [x] Payment record updated
- [x] Webhook event logged
- [x] Stripe Dashboard shows payment
- [x] Webhook delivered successfully

---

## 🐛 Troubleshooting

### Issue: "Failed to create payment intent"
**Check**:
1. Is Stripe secret key set? `firebase functions:config:get`
2. Are functions deployed? Check Firebase Console → Functions
3. Is cart total > 0? Go back to checkout review and recalculate shipping

**Solution**:
```bash
# Verify config
firebase functions:config:get

# Redeploy if needed
firebase deploy --only functions:createPaymentIntent
```

### Issue: "Order not created after payment"
**Check**:
1. Stripe Dashboard → Events → Did webhook fire?
2. Firebase Functions → Logs → Any errors in handleStripeWebhook?
3. Firestore → webhooks_log → Was event processed?

**Solution**:
```bash
# Check function logs
firebase functions:log --only handleStripeWebhook

# Verify webhook secret
firebase functions:config:get

# Redeploy webhook function
firebase deploy --only functions:handleStripeWebhook
```

### Issue: "Webhook signature verification failed"
**Cause**: Wrong webhook secret

**Solution**:
```bash
# Get correct secret from Stripe Dashboard → Webhooks → Your endpoint → Signing secret
firebase functions:config:set stripe.webhook_secret="whsec_CORRECT_SECRET"
firebase deploy --only functions:handleStripeWebhook
```

### Issue: "Cannot find module './pages/checkout/payment.page'"
**Cause**: Route error (TypeScript file exists but Angular hasn't picked it up)

**Solution**:
```bash
# Restart dev server
# Press Ctrl+C to stop
npm start
```

### Issue: Stock went negative
**Cause**: Should not happen (we use Math.max(0, stock - qty))

**Solution**: Check stock_log to see what happened:
```
Firestore → stock_log → Review changes for that product
```

---

## 📋 Quick Command Reference

### Firebase Commands
```bash
# Login to Firebase
firebase login

# Select project
firebase use --add

# View current config
firebase functions:config:get

# Set config
firebase functions:config:set key="value"

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:functionName

# View logs
firebase functions:log

# Start emulators (for local testing)
firebase emulators:start
```

### Build Commands
```bash
# Build functions
cd functions
npm run build

# Build Angular app
npm run build

# Start dev server
npm start
```

### Testing Commands
```bash
# Run tests
npm test

# E2E tests
npm run e2e
```

---

## 🔐 Security Reminders

### DO ✅
- ✅ Use test keys (pk_test_*, sk_test_*) in development
- ✅ Set webhook secret via Firebase config
- ✅ Keep secret keys out of git
- ✅ Use environment variables
- ✅ Verify webhook signatures
- ✅ Test with Stripe test cards

### DON'T ❌
- ❌ Commit secret keys to git
- ❌ Use live keys in development
- ❌ Share secret keys via email/chat
- ❌ Hardcode keys in source code
- ❌ Skip webhook signature verification
- ❌ Test with real cards in test mode

---

## 📊 Expected Timeline

| Step | Task | Time |
|------|------|------|
| 1 | Get Stripe keys | 5 min |
| 2 | Configure frontend | 2 min |
| 3 | Configure backend | 3 min |
| 4 | Deploy functions | 10 min |
| 5 | Configure webhook | 5 min |
| 6 | Start dev server | 1 min |
| 7 | Test payment | 10 min |
| 8 | Verify data | 5 min |
| **Total** | **Ready to accept payments** | **~40 min** |

---

## 🎯 Next Steps After Testing

Once you've verified everything works:

### 1. Enable Email Notifications (Step 15)
- Configure Brevo email service
- Implement order confirmation emails
- Add shipping notification emails

### 2. Build Order History (Step 13)
- Create order list page
- Add order details view
- Implement order tracking

### 3. Admin Order Management (Step 14)
- Build admin orders dashboard
- Add status update functionality
- Implement bulk operations

### 4. Production Deployment
- Get Stripe **live** keys (pk_live_*, sk_live_*)
- Update production environment
- Deploy to Firebase Hosting
- Configure production webhook
- Enable Stripe Radar (fraud detection)

---

## 📞 Support Resources

### Stripe Documentation
- Test Cards: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks
- PaymentIntents: https://stripe.com/docs/payments/payment-intents
- API Reference: https://stripe.com/docs/api

### Firebase Documentation
- Cloud Functions: https://firebase.google.com/docs/functions
- Firestore: https://firebase.google.com/docs/firestore
- CLI Reference: https://firebase.google.com/docs/cli

### TheLuxMining Documentation
- Main guide: `CART_SYSTEM_COMPLETE.md`
- Stripe integration: `STEP8_STRIPE_COMPLETE.md`
- Webhooks: `STEP9_WEBHOOKS_COMPLETE.md`
- Deployment: This file

---

## ✅ Final Checklist

Before considering deployment complete:

### Configuration
- [ ] Stripe publishable key added to `environment.ts`
- [ ] Stripe secret key set in Firebase config
- [ ] Webhook secret set in Firebase config
- [ ] All three functions deployed successfully
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Webhook events configured (3 events)

### Testing
- [ ] Test payment with 4242 4242 4242 4242 succeeded
- [ ] Redirected to confirmation page
- [ ] Order number displayed correctly
- [ ] Order created in Firestore
- [ ] Stock decremented correctly
- [ ] Cart marked as completed
- [ ] Webhook processed successfully
- [ ] No errors in browser console
- [ ] No errors in Firebase Functions logs

### Verification
- [ ] Firestore: Order exists
- [ ] Firestore: Payment record exists
- [ ] Firestore: Stock updated
- [ ] Firestore: Stock log created
- [ ] Firestore: Cart completed
- [ ] Firestore: Webhook logged
- [ ] Stripe: Payment shows as succeeded
- [ ] Stripe: Webhook delivered

---

**🎉 Congratulations! Your payment system is live and ready to accept orders!**

---

**Last Updated**: January 27, 2025  
**Status**: Ready for Deployment  
**Estimated Setup Time**: 30-40 minutes
