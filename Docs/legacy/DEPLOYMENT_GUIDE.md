# Quick Deployment Guide - Stripe Payment System

## Overview
This guide will help you deploy and test the complete Stripe payment integration in under 30 minutes.

## Prerequisites
- [x] Firebase project created
- [x] Firebase CLI installed (`npm install -g firebase-tools`)
- [x] Logged in to Firebase (`firebase login`)
- [ ] Stripe account created (https://dashboard.stripe.com)

## Step 1: Get Stripe API Keys (5 minutes)

### 1.1 Create/Login to Stripe Account
1. Go to: https://dashboard.stripe.com
2. Create account or sign in
3. Switch to **Test Mode** (toggle in top right)

### 1.2 Get API Keys
1. Navigate to: **Developers** → **API keys**
2. Copy **Publishable key** (starts with `pk_test_...`)
3. Reveal and copy **Secret key** (starts with `sk_test_...`)

**Important**: Keep your secret key secure! Never commit it to git.

## Step 2: Configure Frontend (2 minutes)

### 2.1 Update Environment File
Edit `src/environments/environment.ts`:

```typescript
stripe: {
  publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE'  // Replace with your key
}
```

### 2.2 Update Production Environment
Edit `src/environments/environment.prod.ts`:

```typescript
stripe: {
  publishableKey: 'pk_live_YOUR_ACTUAL_KEY_HERE'  // When ready for production
}
```

**Note**: Use test keys (pk_test_*) for development, live keys (pk_live_*) for production.

## Step 3: Configure Cloud Functions (3 minutes)

### Option A: For Production Deployment

Set Stripe secret key in Firebase Functions config:
```bash
firebase functions:config:set stripe.secret_key="sk_test_YOUR_SECRET_KEY_HERE"
```

Verify it's set:
```bash
firebase functions:config:get
```

Should see:
```json
{
  "stripe": {
    "secret_key": "sk_test_..."
  }
}
```

### Option B: For Local Emulator Testing

Set environment variable in PowerShell:
```powershell
$env:STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"
```

Or in `.env` file (create in `functions/` directory):
```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

## Step 4: Build Functions (1 minute)

```bash
cd functions
npm run build
```

Should see:
```
> build
> tsc

# No errors = success ✅
```

## Step 5: Deploy to Firebase (5 minutes)

### 5.1 Deploy Functions Only
```bash
firebase deploy --only functions
```

This will deploy:
- ✅ `cartReprice` - Shipping calculator
- ✅ `createPaymentIntent` - Payment intent creation

### 5.2 Verify Deployment
Check Firebase Console:
1. Go to: https://console.firebase.google.com
2. Select your project
3. Navigate to: **Functions**
4. Should see both functions listed with status: **✅ Deployed**

### 5.3 Note Function URLs
Copy the function URLs (you'll need them):
- `https://us-central1-YOUR-PROJECT.cloudfunctions.net/cartReprice`
- `https://us-central1-YOUR-PROJECT.cloudfunctions.net/createPaymentIntent`

## Step 6: Start Development Server (1 minute)

```bash
# In project root
npm start
```

Wait for:
```
✔ Browser application bundle generation complete.
✔ Server application bundle generation complete.

Local: http://localhost:4200/
```

## Step 7: Test Payment Flow (10 minutes)

### 7.1 Add Products to Cart
1. Navigate to: http://localhost:4200
2. Browse products
3. Click "Add to Cart" for any product
4. Verify cart icon shows item count

### 7.2 Go to Checkout
1. Click cart icon
2. Click "Proceed to Checkout"
3. If not logged in, sign in or create account

### 7.3 Complete Checkout Review
1. Add/select shipping address
2. Wait for shipping calculator to load
3. Select shipping method (Standard/Express)
4. Verify order summary shows correct totals
5. Click "Proceed to Payment"

### 7.4 Complete Payment
1. Should see payment page with card input
2. Enter test card details:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: `12/34` (any future date)
   - **CVC**: `123` (any 3 digits)
   - **ZIP**: `12345` (any 5 digits)
3. Fill in billing address
4. Click "Pay $X.XX"
5. Wait for processing (shows spinner)

### 7.5 Verify Success
**Expected**: Should redirect to confirmation page (or show success message)

**Check Browser Console**:
- Should see no errors
- Network tab → XHR → `createPaymentIntent` should return 200

**Check Firestore**:
1. Firebase Console → Firestore Database
2. Collection: `payments`
3. Should see new document with:
   - `paymentIntentId`: "pi_..."
   - `status`: "succeeded"
   - `amount`: Your cart total
   - `currency`: "USD"

**Check Stripe Dashboard**:
1. Go to: https://dashboard.stripe.com/test/payments
2. Should see payment with status: **Succeeded**
3. Amount should match cart total

## Step 8: Test Error Cases (5 minutes)

### Test 1: Card Declined
- **Card**: `4000 0000 0000 0002`
- **Expected**: Error message "Your card was declined"

### Test 2: Insufficient Funds
- **Card**: `4000 0000 0000 9995`
- **Expected**: Error message "Insufficient funds"

### Test 3: 3D Secure Authentication
- **Card**: `4000 0027 6000 3184`
- **Expected**: 3D Secure modal appears, complete authentication, payment succeeds

More test cards: https://stripe.com/docs/testing#cards

## Troubleshooting

### Issue: "Stripe is not defined"
**Solution**: Check that `publishableKey` is set correctly in `environment.ts`

### Issue: "Failed to create payment intent"
**Solutions**:
1. Check Firebase Functions logs:
   ```bash
   firebase functions:log --only createPaymentIntent
   ```
2. Verify Stripe secret key is set:
   ```bash
   firebase functions:config:get
   ```
3. Check cart has items and total > 0
4. Verify user is authenticated

### Issue: "Cart total must be greater than zero"
**Solution**: 
1. Go back to checkout review
2. Select shipping address
3. Wait for shipping calculator to run
4. Verify totals are calculated
5. Then proceed to payment

### Issue: "Payment succeeds but no confirmation page"
**Status**: Confirmation page not yet implemented (Step 12)
**Workaround**: Check browser console and Firestore for payment record

### Issue: Functions deployment fails
**Solutions**:
1. Check you're logged in: `firebase login`
2. Verify project is selected: `firebase use --add`
3. Check functions build: `cd functions; npm run build`
4. Review error message in deployment output

### Issue: CORS errors when calling functions
**Solution**: Cloud Functions should have CORS enabled by default for Firebase Hosting. If testing from localhost:
1. Functions are deployed (not local emulator)
2. Or use Firebase emulators: `firebase emulators:start`

## Local Development with Emulators (Optional)

### Start Firebase Emulators
```bash
firebase emulators:start
```

This starts:
- ✅ Functions emulator (port 5001)
- ✅ Firestore emulator (port 8080)
- ✅ Auth emulator (port 9099)
- ✅ Emulator UI (port 4000)

### Configure App to Use Emulators
Check `src/environments/environment.ts`:
```typescript
useEmulators: true  // Already set to true
```

This automatically connects to local emulators instead of production Firebase.

### Set Stripe Secret for Emulator
```powershell
$env:STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
firebase emulators:start
```

## Production Deployment Checklist

Before going live with real payments:

### 1. Switch to Live Stripe Keys
- [ ] Get live keys from Stripe Dashboard (pk_live_*, sk_live_*)
- [ ] Update `environment.prod.ts` with `pk_live_*` key
- [ ] Set live secret key: `firebase functions:config:set stripe.secret_key="sk_live_*"`
- [ ] Re-deploy functions: `firebase deploy --only functions`

### 2. Security
- [ ] Enable Stripe Radar (fraud detection)
- [ ] Set up Stripe webhooks (Step 9)
- [ ] Review Firestore security rules
- [ ] Enable HTTPS only in production
- [ ] Add rate limiting to functions

### 3. Testing
- [ ] Test with live card (your own)
- [ ] Verify money appears in Stripe balance
- [ ] Test refund process (when implemented)
- [ ] Load test payment flow
- [ ] Test error scenarios

### 4. Monitoring
- [ ] Set up Firebase Performance Monitoring
- [ ] Configure Cloud Functions alerts
- [ ] Monitor Stripe dashboard for failed payments
- [ ] Set up error tracking (Sentry, etc.)

### 5. Legal & Compliance
- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add Refund Policy
- [ ] Display PCI compliance badge
- [ ] Add SSL certificate info

## Quick Reference

### Test Cards
| Card Number         | Scenario                    |
|---------------------|----------------------------|
| 4242 4242 4242 4242 | Success (no auth)          |
| 4000 0027 6000 3184 | Success (requires 3DS)     |
| 4000 0000 0000 0002 | Declined                   |
| 4000 0000 0000 9995 | Insufficient funds         |
| 4000 0000 0000 0127 | Incorrect CVC              |

### Useful Commands
```bash
# Deploy everything
firebase deploy

# Deploy functions only
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:createPaymentIntent

# View function logs
firebase functions:log

# Start emulators
firebase emulators:start

# Build functions
cd functions; npm run build

# Check Firebase config
firebase functions:config:get
```

### Useful URLs
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Firebase Console**: https://console.firebase.google.com
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Stripe API Docs**: https://stripe.com/docs/api
- **Firebase Functions Docs**: https://firebase.google.com/docs/functions

## Success Criteria ✅

After completing this guide, you should have:
- [x] Stripe test keys configured in frontend and backend
- [x] Cloud Functions deployed to Firebase
- [x] Successfully processed a test payment
- [x] Payment record created in Firestore
- [x] Payment visible in Stripe Dashboard
- [x] No errors in browser console or function logs

## Next Steps

After successful deployment:
1. ✅ **Step 8 Complete**: Payment processing working
2. 🔄 **Step 9**: Implement Stripe webhooks for order finalization
3. 🔄 **Step 10**: Create order in Firestore after payment success
4. 🔄 **Step 12**: Build order confirmation page
5. 🔄 **Step 13**: Add order history to client dashboard

**Estimated time to complete Steps 9-12**: ~2-3 hours

---

**Last Updated**: January 27, 2025  
**Status**: Ready for deployment  
**Support**: Check Stripe docs or Firebase docs for detailed troubleshooting
