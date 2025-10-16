# Admin User Setup Guide

## Creating the Admin User

### Option 1: Using the Seed Script (Recommended)

1. **Install tsx (if not already installed):**
   ```powershell
   npm install -D tsx
   ```

2. **Edit the admin credentials:**
   Open `scripts/seed-admin.ts` and change these values:
   ```typescript
   const ADMIN_EMAIL = 'admin@topstone.com';
   const ADMIN_PASSWORD = 'Admin123!'; // Use a secure password!
   const ADMIN_NAME = 'Top Stone Admin';
   ```

3. **Run the seed script:**
   ```powershell
   npx tsx scripts/seed-admin.ts
   ```

4. **You should see:**
   ```
   🔧 Initializing Firebase...
   👤 Creating admin user in Firebase Auth...
   ✅ Admin user created: [uid]
   ✅ Display name updated
   📝 Creating admin profile in Firestore...
   ✅ Admin profile created in Firestore
   
   🎉 Admin user seeded successfully!
   ```

### Option 2: Manual Creation via Firebase Console

1. **Create user in Firebase Auth:**
   - Go to Firebase Console → Authentication → Users
   - Click "Add user"
   - Email: `admin@topstone.com`
   - Password: (your secure password)
   - Click "Add user"

2. **Create admin profile in Firestore:**
   - Go to Firebase Console → Firestore Database
   - Create collection: `users`
   - Add document with ID matching the Auth UID:
   ```json
   {
     "uid": "[the-auth-uid]",
     "email": "admin@topstone.com",
     "displayName": "Top Stone Admin",
     "role": "admin",
     "company": "Top Stone",
     "createdAt": [current timestamp]
   }
   ```

### Option 3: Create via Application (After Login Feature is Built)

1. **Temporarily modify the register function:**
   In `src/app/services/auth.service.ts`, temporarily change the role to 'admin':
   ```typescript
   role: 'admin', // Change from 'client' to 'admin'
   ```

2. **Register through the app UI**
   - Use the registration form
   - Email: admin@topstone.com
   - Password: (your secure password)

3. **Revert the code change:**
   Change the role back to 'client' after creating the admin user.

## Admin Credentials

**Default credentials (if using seed script):**
- Email: `admin@topstone.com`
- Password: `Admin123!`

⚠️ **IMPORTANT:** Change the password immediately after first login!

## Verifying Admin Access

1. **Check Firestore:**
   - Go to Firebase Console → Firestore Database
   - Navigate to `users` collection
   - Find the admin user document
   - Verify `role` field is set to `"admin"`

2. **Check Authentication:**
   - Go to Firebase Console → Authentication
   - Verify the admin email exists in the user list

3. **Test in Application:**
   - Login with admin credentials
   - Admin guard should grant access to admin routes
   - Check console: `isAdmin()` should return `true`

## Security Rules

The Firestore rules in `firestore.rules.new` protect admin operations:

```
// Only admins can write to products
match /products/{productId} {
  allow read: if true;
  allow write: if isAdmin();
}

// Helper function
function isAdmin() {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## Troubleshooting

### "Email already in use" error
- The admin user already exists
- Check Firebase Console → Authentication
- Delete the existing user if needed and run script again

### Admin can't access admin routes
- Verify the user document in Firestore has `role: "admin"`
- Check browser console for auth errors
- Verify admin.guard.ts is applied to the route

### Firestore permission denied
- Deploy the security rules: `firebase deploy --only firestore:rules`
- Verify the rules include the admin role check

## Next Steps

After creating the admin user:
1. ✅ Test login with admin credentials
2. ✅ Verify access to admin routes
3. ✅ Change the default password
4. ✅ Create additional admin users if needed (via admin panel)
5. ✅ Deploy Firestore security rules
