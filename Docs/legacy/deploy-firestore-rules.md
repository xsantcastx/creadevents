# Deploy Firestore Security Rules

## Quick Fix for Email Service Error

The 400 Bad Request error was caused by a mismatch between the email recipient in the code and the allowed recipients in Firestore security rules.

### What was fixed:

1. **EmailService.ts**: Updated to send emails to `ventas@tstone.com` (matches security rules)
2. **Better validation**: Added input validation and error handling  
3. **Security rules**: Updated to allow your email address as well

### Deploy the updated security rules:

```bash
# Make sure you're in the project directory
cd "c:\Users\xsanc\Documents\5.Projects xsantcastx\2. TheStone\tstone-web"

# Deploy only the Firestore rules (not functions since we removed them)
firebase deploy --only firestore:rules
```

### Alternative: Update rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project `tstone-e1de6`
3. Go to **Firestore Database** → **Rules**
4. Replace the rules with the content from `firestore.rules` in your project
5. Click **Publish**

### Test the fix:

1. Add products to cart
2. Fill out the contact form  
3. Submit - you should see a success message
4. Check the browser console for "Email queued successfully" message

The email will now be properly queued in Firestore and sent via the Firebase Trigger Email extension once you set that up!