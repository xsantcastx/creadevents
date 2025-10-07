# 🚀 Brevo + Firebase Trigger Email Setup Guide

## ✅ What's Already Done
- ✅ AngularFire installed and configured
- ✅ Email service updated to use Firestore
- ✅ Firestore security rules configured
- ✅ Cart system ready for Brevo integration

## 📧 Step 1: Create Brevo Account (5 minutes)

1. **Sign up for Brevo**: Go to https://www.brevo.com
2. **Choose Free Plan**: 300 emails/day for free
3. **Verify your email**: Complete account verification
4. **Add your domain**: Go to Settings > Domains and verify your domain (optional but recommended)

## 🔑 Step 2: Get SMTP Credentials

1. **Navigate to SMTP**: In Brevo dashboard, go to Settings > SMTP & API
2. **Get SMTP details**:
   - Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: Your Brevo email
   - Password: Generate an SMTP password

**Note these down - you'll need them for Firebase!**

## 🔥 Step 3: Install Firebase Trigger Email Extension

1. **Open Firebase Console**: Go to https://console.firebase.google.com
2. **Select your project**: `tstone-e1de6`
3. **Go to Extensions**: Click "Extensions" in the left sidebar
4. **Find Trigger Email**: Search for "Trigger Email" or "firestore-send-email"
5. **Install the extension**

### Extension Configuration:
When prompted, enter these settings:

- **Collection path**: `mail`
- **SMTP connection URI**: `smtps://YOUR_BREVO_EMAIL:YOUR_SMTP_PASSWORD@smtp-relay.brevo.com:587`
- **Default FROM email**: `no-reply@yourdomain.com` (or your verified email)
- **Default reply-to email**: `ventas@yourdomain.com`

## 🛡️ Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This deploys the security rules that prevent abuse of your email system.

## 🔧 Step 5: Update Email Address

Edit `src/app/services/email.service.ts` line 32:
```typescript
to: ['your-business-email@yourdomain.com'], // Change to your actual business email
```

## 🧪 Step 6: Test the System

1. **Start development**: `ng serve`
2. **Add products to cart**: Go to `/productos/12mm` and add items
3. **Go to cart**: Navigate to `/cart`
4. **Fill contact form**: Enter your details
5. **Send email**: Click "Enviar selección por correo"
6. **Check your inbox**: You should receive a professional email!

## 🎯 How It Works

1. **User submits cart** → Angular writes to Firestore `mail` collection
2. **Firebase Extension detects** → New document in `mail` collection triggers email
3. **Brevo sends email** → Professional email sent via SMTP to your business
4. **You receive notification** → Cart contents delivered to your inbox

## ✨ Benefits of This Approach

- **No server code**: No Cloud Functions to maintain
- **Automatic scaling**: Firebase handles everything
- **Cost effective**: Brevo free tier + Firebase extension
- **Reliable delivery**: Brevo's professional SMTP
- **Security**: Firestore rules prevent email abuse

## 🚨 Important Security Notes

1. **Firestore Rules**: Deployed rules only allow sending to your business emails
2. **Rate Limiting**: Extension has built-in rate limiting
3. **Domain Verification**: Verify your domain in Brevo for better deliverability
4. **Monitor Usage**: Check Brevo dashboard for email usage

## 📋 Complete Workflow

```
User fills cart → Submits form → Firestore write → Extension triggers → Brevo sends → You receive email
```

## 🎉 You're Done!

Once the Firebase Extension is configured with your Brevo SMTP credentials:

- ✅ Cart system fully functional
- ✅ Professional email delivery
- ✅ No server maintenance required
- ✅ Secure and scalable
- ✅ Cost-effective solution

Your TopStone cart system now uses the professional Brevo email service! 🛒✨

## 🔧 Firebase Web App Config

**Important**: You still need to get your Firebase web app configuration:

1. Go to Firebase Console > Project Settings
2. Scroll to "Your apps" section
3. Click on your web app or create one
4. Copy the config object and update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    projectId: 'tstone-e1de6',
    appId: 'YOUR_ACTUAL_APP_ID',
    apiKey: 'YOUR_ACTUAL_API_KEY',
    authDomain: 'tstone-e1de6.firebaseapp.com',
    storageBucket: 'tstone-e1de6.appspot.com',
    messagingSenderId: 'YOUR_ACTUAL_SENDER_ID',
  }
};
```

This approach is much simpler than the previous Cloud Functions + SendGrid method! 🚀