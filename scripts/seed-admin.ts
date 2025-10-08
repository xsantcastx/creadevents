/**
 * Admin User Creation Guide
 * 
 * This is a simple guide to create the admin user manually.
 * Firebase client SDK scripts don't work well in Node.js environment.
 * 
 * EASIEST METHOD: Use the temporary registration form with admin role
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║        TOP STONE - Admin User Creation Guide                   ║
╚════════════════════════════════════════════════════════════════╝

⚠️  Firebase Client SDK doesn't work in Node.js for Auth operations.

📋 RECOMMENDED METHOD - Use Application Registration:
─────────────────────────────────────────────────────────────────

1. Start your Angular dev server:
   npm start

2. Go to http://localhost:4200

3. Create a simple registration component or use browser console:

   In the browser console (F12), run:
   
   // Import the auth service (will be available after app loads)
   const auth = getAuth();
   
   // Create user
   createUserWithEmailAndPassword(auth, 'admin@topstone.com', 'Admin123!')
     .then(userCred => {
       console.log('User created:', userCred.user.uid);
       // Now manually add to Firestore via Firebase Console
     });

4. Go to Firebase Console → Firestore Database
   - Create collection: users
   - Add document with ID from step 3:
     {
       "uid": "[uid-from-step-3]",
       "email": "admin@topstone.com",
       "displayName": "Top Stone Admin",
       "role": "admin",
       "company": "Top Stone",
       "createdAt": [current timestamp]
     }

─────────────────────────────────────────────────────────────────
📋 ALTERNATIVE METHOD - Firebase Console Only:
─────────────────────────────────────────────────────────────────

1. Go to Firebase Console → Authentication → Users
   Click "Add user"
   - Email: admin@topstone.com
   - Password: Admin123! (or your choice)
   - Click "Add user"
   - Copy the UID

2. Go to Firebase Console → Firestore Database
   - Click "Start collection"
   - Collection ID: users
   - Document ID: [paste the UID from step 1]
   - Add fields:
     * uid: [the UID] (string)
     * email: admin@topstone.com (string)
     * displayName: Top Stone Admin (string)
     * role: admin (string)
     * company: Top Stone (string)
     * createdAt: [click "timestamp" type]

✅ DONE! You can now login with:
   Email: admin@topstone.com
   Password: Admin123! (or what you set)

─────────────────────────────────────────────────────────────────
For more details, see ADMIN_SETUP.md
─────────────────────────────────────────────────────────────────
`);

process.exit(0);
