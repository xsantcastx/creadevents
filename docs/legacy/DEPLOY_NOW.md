# 🚀 READY TO DEPLOY - Quick Checklist

## ✅ Status: All Code Complete
- ✅ Firebase logged in (ogaitnas.9615@gmail.com)
- ✅ Project selected (theluxmining-91ab1)
- ✅ Functions built successfully
- ✅ Environment variables configured (.env file created)

---

## 📝 STEP 1: Get Your Stripe Test Keys (2 minutes)

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
   - Sign in (or create free account)
   - **Make sure "Test Mode" toggle is ON** (top right)

2. **Copy these 2 keys**:
   - **Publishable key**: Starts with `pk_test_...` (you can see it)
   - **Secret key**: Starts with `sk_test_...` (click "Reveal test key")

---

## 🔧 STEP 2: Configure Stripe Keys (1 minute)

### A) Frontend Key (environment.ts):
```bash
# Open this file:
src/environments/environment.ts

# Replace this line:
publishableKey: 'pk_test_51QJ7ZtP9wy1example'

# With your actual key:
publishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE'
```

### B) Backend Key (functions/.env):
```bash
# Open this file:
functions/.env

# Replace this line:
STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_SECRET_KEY

# With your actual key:
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE

# Note: Leave STRIPE_WEBHOOK_SECRET as is for now (we'll get it after deploying)
```

---

## 🚀 STEP 3: Deploy Cloud Functions (2 minutes)

```bash
# Deploy all 3 Cloud Functions
firebase deploy --only functions

# This will deploy:
# - cartReprice (shipping calculator)
# - createPaymentIntent (payment processing)
# - handleStripeWebhook (order creation)
```

**Expected output**: You'll see 3 function URLs. **Copy the webhook URL** (handleStripeWebhook).

---

## 🔗 STEP 4: Configure Stripe Webhook (2 minutes)

1. **Go to**: https://dashboard.stripe.com/test/webhooks

2. **Click** "Add endpoint"

3. **Endpoint URL**: Paste your `handleStripeWebhook` function URL
   - Example: `https://us-central1-theluxmining-91ab1.cloudfunctions.net/handleStripeWebhook`

4. **Events to send**: Select these 3 events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`

5. **Click** "Add endpoint"

6. **Copy the signing secret**:
   - Click on your new webhook
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_...`)

7. **Add webhook secret to .env**:
```bash
# Open functions/.env again
# Replace:
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET

# With your actual secret:
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET
```

8. **Redeploy webhook function**:
```bash
firebase deploy --only functions:handleStripeWebhook
```

---

## ✅ STEP 5: Test the Payment Flow (3 minutes)

1. **Start dev server**:
```bash
npm start
```

2. **Open app**: http://localhost:4200

3. **Add product to cart** → Go to checkout

4. **Test card number**: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

5. **Submit payment** → Should redirect to confirmation page

6. **Verify**:
   - ✅ Check Firestore `orders` collection (new order created)
   - ✅ Check Stripe Dashboard → Payments (successful payment)
   - ✅ Check Firestore `webhooks_log` (webhook received)
   - ✅ Check product stock (should be decremented)

---

## 🎉 You're Done!

If all tests pass, your payment system is **LIVE** (in test mode)!

### Next Steps (Optional):
- [ ] Implement Order History page (Step 13)
- [ ] Add Admin Order Management (Step 14)
- [ ] Configure Email Notifications (Step 15)
- [ ] When ready for production: Switch to Stripe live keys

---

## 🆘 Troubleshooting

**Payment fails?**
- Check browser console for errors
- Check Firebase Functions logs: `firebase functions:log`
- Verify Stripe keys are correct in both files

**Webhook not working?**
- Check webhook secret is set in `.env`
- Check webhook URL in Stripe Dashboard is correct
- Check Functions logs for webhook errors

**Need help?**
- Firebase docs: https://firebase.google.com/docs/functions
- Stripe docs: https://stripe.com/docs/payments/accept-a-payment
- Check `QUICK_START.md` for detailed explanations
