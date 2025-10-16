# 🎯 DEPLOYMENT COMMANDS - Copy & Paste Ready

## Quick Reference: All Commands You Need

---

## ✅ PRE-DEPLOYMENT (Already Done)
```bash
# Build functions ✅ COMPLETED
cd functions
npm run build
```

---

## 🔑 STEP 1: Configure Stripe Keys

### After getting keys from https://dashboard.stripe.com/test/apikeys

#### Update Frontend (Manual Edit)
**File**: `src/environments/environment.ts`
```typescript
// Find and replace this line:
publishableKey: 'pk_test_51QJ7ZtP9wy1example'

// With your actual key:
publishableKey: 'pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY'
```

#### Update Backend (Run This)
```bash
# Replace sk_test_YOUR_KEY with your actual secret key
firebase functions:config:set stripe.secret_key="sk_test_YOUR_ACTUAL_SECRET_KEY"
```

#### Verify Configuration
```bash
firebase functions:config:get
```

---

## 🚀 STEP 2: Deploy Cloud Functions

### Deploy All Functions (Recommended)
```bash
firebase deploy --only functions
```

### OR Deploy Individually
```bash
firebase deploy --only functions:cartReprice
firebase deploy --only functions:createPaymentIntent  
firebase deploy --only functions:handleStripeWebhook
```

**📋 Important**: After deployment, copy the `handleStripeWebhook` URL from the output!

---

## 🔗 STEP 3: Configure Stripe Webhook

### After adding endpoint in Stripe Dashboard and getting signing secret

```bash
# Replace whsec_YOUR_SECRET with the signing secret from Stripe
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SIGNING_SECRET"
```

### Redeploy Webhook Function (with secret)
```bash
firebase deploy --only functions:handleStripeWebhook
```

---

## 🖥️ STEP 4: Start Development Server

```bash
npm start
```

**Wait for**: `Local: http://localhost:4200/`

---

## 🧪 TEST PAYMENT DATA

### Test Card (Always Works)
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### Test Card (Requires 3D Secure)
```
Card Number: 4000 0027 6000 3184
Expiry: 12/34
CVC: 123
```

### Test Card (Decline)
```
Card Number: 4000 0000 0000 0002
Expiry: 12/34
CVC: 123
```

---

## 📊 VERIFICATION COMMANDS

### Check Firebase Configuration
```bash
firebase functions:config:get
```

### Check Function Logs
```bash
firebase functions:log
```

### Check Specific Function Logs
```bash
firebase functions:log --only createPaymentIntent
firebase functions:log --only handleStripeWebhook
```

### View Recent Logs (Last 50)
```bash
firebase functions:log --limit 50
```

---

## 🔄 TROUBLESHOOTING COMMANDS

### If Config Not Working
```bash
# View current config
firebase functions:config:get

# Set config again
firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"

# Redeploy
firebase deploy --only functions
```

### If Functions Not Deploying
```bash
# Check you're logged in
firebase login

# Check project is selected
firebase use

# Try deploying one function at a time
firebase deploy --only functions:createPaymentIntent
firebase deploy --only functions:handleStripeWebhook
firebase deploy --only functions:cartReprice
```

### If Dev Server Won't Start
```bash
# Stop any running servers (Ctrl+C)

# Clear cache
npm cache clean --force

# Reinstall dependencies
npm install

# Try again
npm start
```

---

## 📱 QUICK ACCESS URLS

### Stripe Dashboard
- Test Mode: https://dashboard.stripe.com/test/dashboard
- API Keys: https://dashboard.stripe.com/test/apikeys
- Webhooks: https://dashboard.stripe.com/test/webhooks
- Payments: https://dashboard.stripe.com/test/payments
- Events: https://dashboard.stripe.com/test/events

### Firebase Console
- Project Overview: https://console.firebase.google.com
- Firestore: https://console.firebase.google.com/project/_/firestore
- Functions: https://console.firebase.google.com/project/_/functions
- Authentication: https://console.firebase.google.com/project/_/authentication

### Local Development
- App: http://localhost:4200
- Products: http://localhost:4200/products
- Cart: http://localhost:4200/cart
- Checkout: http://localhost:4200/checkout/review

---

## 🎯 COMPLETE DEPLOYMENT SEQUENCE (Copy All)

### If Starting Fresh
```bash
# 1. Configure Stripe secret key
firebase functions:config:set stripe.secret_key="sk_test_YOUR_SECRET_KEY"

# 2. Deploy functions
firebase deploy --only functions

# 3. Copy webhook URL from output, configure in Stripe Dashboard

# 4. Set webhook secret
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"

# 5. Redeploy webhook function
firebase deploy --only functions:handleStripeWebhook

# 6. Verify configuration
firebase functions:config:get

# 7. Start dev server
npm start
```

---

## 🔥 ONE-LINE DEPLOY (After Config Set)

```bash
firebase deploy --only functions && echo "✅ Deployment Complete! Check output above for webhook URL"
```

---

## 📋 EXPECTED OUTPUT EXAMPLES

### Successful Config Set
```
✔ Functions config updated.
```

### Successful Deployment
```
✔  functions[us-central1-cartReprice]: Successful update operation.
✔  functions[us-central1-createPaymentIntent]: Successful update operation.
✔  functions[us-central1-handleStripeWebhook]: Successful update operation.

Function URL (handleStripeWebhook):
https://us-central1-theluxmining-91ab1.cloudfunctions.net/handleStripeWebhook
```

### Config Get Output
```json
{
  "stripe": {
    "secret_key": "sk_test_51...",
    "webhook_secret": "whsec_..."
  }
}
```

---

## ⚡ RAPID TESTING SEQUENCE

```bash
# Open browser
start http://localhost:4200

# In case of errors, check logs
firebase functions:log --limit 10

# Watch logs in real-time (PowerShell)
while($true) { firebase functions:log --limit 5; Start-Sleep -Seconds 5; Clear-Host }
```

---

## 🆘 EMERGENCY RESET

### If Everything Breaks
```bash
# 1. Clear all config
firebase functions:config:unset stripe

# 2. Set config fresh
firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"

# 3. Rebuild functions
cd functions
npm run build
cd ..

# 4. Deploy everything
firebase deploy --only functions

# 5. Restart dev server
# Press Ctrl+C, then:
npm start
```

---

## 📞 SUPPORT CHECKLIST

### Before Asking for Help, Check:
- [ ] Ran `firebase functions:config:get` - shows both keys?
- [ ] Ran `firebase deploy --only functions` - all 3 deployed?
- [ ] Stripe Dashboard → Webhooks - endpoint added?
- [ ] Stripe Dashboard → Webhooks - shows webhook secret?
- [ ] Browser console - any errors?
- [ ] Firebase Functions logs - any errors?
- [ ] Firestore → carts - cart has total > 0?
- [ ] Environment file - publishable key added?

---

**Ready to deploy? Start with Step 1! 🚀**
