# 🔐 CreaDEvents Permission System Setup Guide

## 🚀 Quick Setup

### 1. Initialize Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your `creadevents` project
3. Navigate to **Firestore Database** → **Create database**
4. Choose **"Start in test mode"** for now
5. Select your preferred location (e.g., `us-central1`)

### 2. Make Yourself Admin

**Option A: Browser Console (Easy)**

1. **Register a user account** through your app at `/admin` 
2. **Open browser console** (F12)
3. **Run this command**:
   ```javascript
   // First, let's get the Firebase instances from the app
   const auth = window.getAuth?.() || firebase.auth();
   const db = window.getFirestore?.() || firebase.firestore();
   const user = auth.currentUser;
   
   if (user) {
     // Create admin profile
     if (window.updateDoc) {
       // Modern Firebase v9+
       const { doc, updateDoc } = await import('@angular/fire/firestore');
       await updateDoc(doc(db, 'users', user.uid), {
         role: 'admin',
         permissions: {
           canManageContent: true,
           canManageUsers: true,
           canViewAnalytics: true,
           canUploadFiles: true
         }
       });
     } else {
       // Fallback for older Firebase or direct access
       await db.collection('users').doc(user.uid).update({
         role: 'admin',
         permissions: {
           canManageContent: true,
           canManageUsers: true,
           canViewAnalytics: true,
           canUploadFiles: true
         }
       });
     }
     console.log('✅ Successfully promoted to admin!');
     window.location.reload(); // Refresh to apply changes
   } else {
     console.log('❌ Please log in first');
   }
   ```

**Option B: Firestore Console (Manual)**

1. Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore
2. Find the `users` collection → Your user document
3. Click **Edit** and update these fields:
   ```json
   {
     "role": "admin",
     "permissions": {
       "canManageContent": true,
       "canManageUsers": true,
       "canViewAnalytics": true,
       "canUploadFiles": true
     }
   }
   ```

**Option C: Command Line (Advanced)**

1. Install Firebase tools: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Run: `firebase firestore:update users/YOUR_USER_ID role=admin`

### 3. Access Admin Features

- Navigate to `/admin` 
- You now have full admin access!

## 📋 Permission System Overview

### **🔧 Available Roles**

| Role | Level | Description |
|------|-------|-------------|
| **👑 Admin** | Full Access | Complete system control |
| **✏️ Editor** | Content Manager | Content creation & editing |
| **👤 User** | Basic | Public content viewing only |

### **🎯 Granular Permissions**

#### **Content Management**
- `canManageContent` - General content editing access
- `canManageProjects` - Portfolio project management
- `canManageServices` - Service offerings management
- `canManageBlog` - Blog post creation/editing
- `canManageTestimonials` - Customer testimonial management

#### **User Management**
- `canManageUsers` - Change user roles and permissions
- `canViewUsers` - View user list and details

#### **System Access**
- `canViewAnalytics` - Access analytics dashboard
- `canUploadFiles` - File upload capabilities
- `canManageFiles` - Delete and organize files

#### **Advanced Features**
- `canManageSeasonalThemes` - Website theme management
- `canAccessAdminPanel` - Admin dashboard access
- `canExportData` - Data export functionality

## 👥 Managing Users

### **Through Admin Dashboard**

1. Go to **Admin Dashboard** → **User Management** tab
2. View all registered users
3. **Change roles** using the dropdown for each user
4. **Monitor activity** - see last login times

### **Permission Matrix**

| Permission | Admin | Editor | User |
|------------|-------|--------|------|
| Manage Content | ✅ | ✅ | ❌ |
| Manage Projects | ✅ | ✅ | ❌ |
| Manage Services | ✅ | ✅ | ❌ |
| Manage Blog | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| View Users | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |
| Upload Files | ✅ | ✅ | ❌ |
| Manage Files | ✅ | ❌ | ❌ |
| Seasonal Themes | ✅ | ❌ | ❌ |
| Export Data | ✅ | ❌ | ❌ |

## 🔒 Firestore Security Rules

Add these security rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read/write any user profile
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Public read access for content, admin/editor write access
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageProjects == true);
    }
    
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageServices == true);
    }
    
    match /blog/{blogId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageBlog == true);
    }
    
    match /testimonials/{testimonialId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageTestimonials == true);
    }
  }
}
```

## 🛠️ Using Permissions in Code

### **Component Templates**
```html
<!-- Only show to users who can manage content -->
@if (authService.canManageContent()) {
  <button>Edit Content</button>
}

<!-- Admin-only features -->
@if (authService.isAdmin()) {
  <admin-panel></admin-panel>
}

<!-- Specific permissions -->
@if (authService.canManageProjects()) {
  <project-editor></project-editor>
}
```

### **Route Guards**
```typescript
// In your route configuration
{
  path: 'admin',
  canActivate: [() => inject(AuthService).canAccessAdminPanel()]
}
```

### **Service Methods**
```typescript
async createProject(project: Project) {
  if (!this.authService.canManageProjects()) {
    throw new Error('Insufficient permissions');
  }
  // Create project logic
}
```

## 🔧 Troubleshooting

### **"No users found" in User Management**
- Users only appear after they register through the app
- Check Firestore Console to see if user documents exist

### **makeAdmin() not working**
- Make sure you're logged in first
- Check browser console for error messages
- Verify Firestore is initialized

### **Permission denied errors**
- Check your Firestore security rules
- Verify user has correct role in database
- Ensure user document exists in `/users` collection

## 📚 Next Steps

1. **Test the system**: Register test users and try different roles
2. **Customize permissions**: Modify roles/permissions as needed
3. **Add route guards**: Protect sensitive routes
4. **Monitor usage**: Use the analytics dashboard to track admin activity

---

**🎉 Your permission system is now fully configured!**

Users can register → You promote them → They get appropriate access levels.