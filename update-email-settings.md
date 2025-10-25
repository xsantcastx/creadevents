# Update Email Settings to Luxmining1@gmail.com

## The Problem
The email settings in Firestore are overriding the code defaults. You changed the code, but Firestore has saved settings that take priority.

## Solution Options

### Option 1: Update via Admin Panel (Easiest)
1. Go to your admin panel: http://localhost:4200/admin/settings
2. Login as admin
3. Find the "Contact Email" field
4. Change it to: `Luxmining1@gmail.com`
5. Click "Save Settings"

### Option 2: Update Firestore Directly
1. Go to Firebase Console: https://console.firebase.google.com/project/theluxmining-91ab1/firestore
2. Navigate to: `settings` collection → `app` document
3. Find the field: `contactEmail`
4. Change value to: `Luxmining1@gmail.com`
5. Click "Update"
6. Also update `settings` → `public` document with the same value

### Option 3: Delete Firestore Settings (Use Code Defaults)
1. Go to Firebase Console Firestore
2. Delete the `settings/app` document
3. Delete the `settings/public` document
4. The app will use the code defaults (already set to Luxmining1@gmail.com)

## Also Check Brevo Sender Verification

After fixing the contactEmail, you still need to verify the sender in Brevo:

1. Go to: https://app.brevo.com/senders
2. Add `Luxmining1@gmail.com` as a verified sender
3. Check your Gmail for verification email
4. Click the verification link

This allows Brevo to send emails FROM Luxmining1@gmail.com TO Luxmining1@gmail.com
