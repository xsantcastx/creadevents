# Firebase Authentication Setup for CreaDEvents

## Required Steps to Fix auth/operation-not-allowed Error

### 1. Firebase Console Setup (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `creadevents`
3. **Navigate to Authentication** → **Sign-in method**

### 2. Enable Authentication Methods

#### Email/Password Authentication:
- Click "Email/Password"
- Toggle "Enable" to ON
- Click "Save"

#### Google Sign-In (Recommended):
- Click "Google"
- Toggle "Enable" to ON
- Select your project support email
- Click "Save"

### 3. Configure Authorized Domains

Add these domains in the "Authorized domains" section:
- `localhost` (for development)
- `127.0.0.1` (for development)
- Your production domain (when deployed)

### 4. Security Rules (Optional but Recommended)

In Firestore Rules, update to allow authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to public collections
    match /projects/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /services/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /blog/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /testimonials/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // User profiles - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin can read all user data
    match /users/{document} {
      allow read: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### 5. Test Authentication

After enabling authentication methods:

1. **Restart your development server**:
   ```bash
   npm start
   ```

2. **Navigate to**: http://localhost:4200/auth/login

3. **Test Sign Up**:
   - Click "Create Account"
   - Enter email and password
   - Should create account successfully

4. **Test Sign In**:
   - Use the credentials you just created
   - Should sign in successfully

### 6. Verify Admin Access

1. **Set admin role** (in Firebase Console):
   - Go to Authentication → Users
   - Find your user
   - Set custom claims: `{"admin": true, "role": "admin"}`

2. **Test admin dashboard**:
   - Navigate to: http://localhost:4200/admin
   - Should have access to admin features

### 7. Troubleshooting

If you still see errors:

#### Check Firebase Config:
Make sure `src/environments/environment.ts` has correct Firebase config:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

#### Common Error Messages:
- `auth/operation-not-allowed` → Enable authentication methods in console
- `auth/invalid-api-key` → Check Firebase config
- `auth/network-request-failed` → Check internet connection
- `auth/too-many-requests` → Wait and try again

### 8. Production Deployment Notes

When deploying to production:
1. Add your production domain to authorized domains
2. Update environment.prod.ts with production Firebase config
3. Enable appropriate security rules
4. Test authentication in production environment

## Next Steps

After completing Firebase setup:
1. ✅ Authentication should work properly
2. ✅ Admin dashboard will be accessible
3. ✅ User roles and permissions will function
4. ✅ All advanced features will be fully operational

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Verify all authentication methods are enabled
3. Ensure authorized domains include your development URLs
4. Check browser console for detailed error messages