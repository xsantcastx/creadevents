# 🚀 Simple Database Setup - Browser Console Method

Since you're already logged into your Angular app, let's use a simple browser console approach that uses your app's Firebase instance directly.

## ✅ Prerequisites
1. **You're already logged in** ✅ (Shows "Logout (your@email.com)" in navigation)
2. **Firestore security rules updated** ✅ (Allow authenticated users to read/write)

## 🎯 Quick Setup - Copy & Paste This Code

### Step 1: Open Browser Console
1. Go to your Angular app: **http://localhost:56170**
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. **Copy and paste this entire code block:**

```javascript
(async () => {
  console.log('🔥 CreaDEvents Database Setup Starting...');
  
  // Wait for Angular app to fully initialize Firebase
  console.log('⏳ Waiting for Angular Firebase initialization...');
  
  let retries = 0;
  const maxRetries = 30; // Wait up to 30 seconds
  
  while (retries < maxRetries) {
    try {
      // Try to access Firebase from Angular's global scope
      if (window.ng && window.ng.getInjector) {
        // Angular is loaded, try to get Firebase
        break;
      }
      
      // Alternative: Check if Firebase is available globally
      const { getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const apps = getApps();
      
      if (apps.length > 0) {
        console.log('✅ Found existing Firebase app');
        break;
      }
      
      // If no app found, wait and retry
      console.log(`⏳ Waiting for Firebase... (${retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
      
    } catch (error) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (retries >= maxRetries) {
    console.error('❌ Firebase not initialized within timeout. Please refresh the page and try again.');
    return;
  }
  
  // Import Firebase services
  const { getFirestore, collection, addDoc, doc, setDoc, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
  const { getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
  
  // Get the existing Firebase app
  const apps = getApps();
  if (apps.length === 0) {
    console.error('❌ No Firebase app found. Please refresh the page and try again.');
    return;
  }
  
  const app = apps[0]; // Use the first (default) app
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  // Wait a bit more for auth to be ready
  let authUser = auth.currentUser;
  let authRetries = 0;
  
  while (!authUser && authRetries < 10) {
    console.log('⏳ Waiting for authentication...');
    await new Promise(resolve => setTimeout(resolve, 500));
    authUser = auth.currentUser;
    authRetries++;
  }
  
  if (!authUser) {
    console.log('❌ Please make sure you\'re logged in first');
    console.log('💡 Go to http://localhost:56170/auth/login to login');
    return;
  }
  
  console.log(`✅ Logged in as: ${authUser.email}`);
  
  try {
    // 1. Create sample projects
    console.log('📁 Creating sample projects...');
    const projects = [
      {
        title: "Elegant Spring Wedding",
        slug: "elegant-spring-wedding",
        eventType: "wedding",
        season: ["spring"],
        palette: ["#FFB6C1", "#98FB98", "#F0F8FF"],
        location: "Miami, FL",
        date: new Date("2024-04-15"),
        heroImage: "/assets/wedding-spring.jpg",
        gallery: ["/assets/wedding-spring-1.jpg", "/assets/wedding-spring-2.jpg"],
        description: "A beautiful spring wedding with soft pastels and garden florals.",
        client: "Sarah & Michael",
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Corporate Summer Event",
        slug: "corporate-summer-event",
        eventType: "corporate",
        season: ["summer"],
        palette: ["#4169E1", "#FFD700", "#FFFFFF"],
        location: "Orlando, FL",
        date: new Date("2024-07-20"),
        heroImage: "/assets/corporate-summer.jpg",
        gallery: ["/assets/corporate-1.jpg", "/assets/corporate-2.jpg"],
        description: "Professional corporate event with modern blue and gold theme.",
        client: "TechCorp Inc",
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const project of projects) {
      await addDoc(collection(db, 'projects'), project);
    }
    console.log('✅ Projects created successfully');
    
    // 2. Create sample services
    console.log('⚙️ Creating sample services...');
    const services = [
      {
        title: "Wedding Florals",
        slug: "wedding-florals",
        summary: "Complete floral design for your special day",
        description: "From bridal bouquets to ceremony arrangements and reception centerpieces.",
        price: "Starting at $500",
        inclusions: ["Bridal bouquet", "Ceremony arrangements", "Reception centerpieces", "Consultation"],
        minBudget: 500,
        images: ["/assets/service-wedding.jpg"],
        category: "wedding",
        featured: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Corporate Events",
        slug: "corporate-events",
        summary: "Professional event planning and floral design",
        description: "Elegant arrangements for corporate meetings, conferences, and celebrations.",
        price: "Starting at $300",
        inclusions: ["Event consultation", "Floral arrangements", "Setup", "Cleanup"],
        minBudget: 300,
        images: ["/assets/service-corporate.jpg"],
        category: "corporate",
        featured: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const service of services) {
      await addDoc(collection(db, 'services'), service);
    }
    console.log('✅ Services created successfully');
    
    // 3. Create sample testimonials
    console.log('💬 Creating sample testimonials...');
    const testimonials = [
      {
        author: "Maria Rodriguez",
        role: "Bride",
        event: "Spring Wedding",
        quote: "CreaDEvents made our wedding absolutely magical! The floral arrangements were breathtaking and exceeded all our expectations.",
        rating: 5,
        date: new Date("2024-04-20"),
        featured: true,
        createdAt: new Date()
      },
      {
        author: "David Chen",
        role: "Event Manager",
        event: "Corporate Conference",
        quote: "Professional, reliable, and creative. They transformed our corporate event into something truly special.",
        rating: 5,
        date: new Date("2024-07-25"),
        featured: true,
        createdAt: new Date()
      }
    ];
    
    for (const testimonial of testimonials) {
      await addDoc(collection(db, 'testimonials'), testimonial);
    }
    console.log('✅ Testimonials created successfully');
    
    // 4. Create admin user profile
    console.log('👑 Creating admin user profile...');
    await setDoc(doc(db, 'users', authUser.uid), {
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName || 'Admin User',
      photoURL: authUser.photoURL || null,
      role: 'admin',
      permissions: {
        canManageContent: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canUploadFiles: true,
        canManageProjects: true,
        canManageServices: true,
        canManageBlog: true,
        canManageTestimonials: true,
        canManageInquiries: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: true,
        canManageThemes: true,
        canManagePermissions: true,
        canDeleteContent: true,
        canAccessAdvancedFeatures: true
      },
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date()
    });
    console.log('✅ Admin user profile created');
    
    // 5. Verification
    console.log('🔍 Verifying setup...');
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    const testimonialsSnapshot = await getDocs(collection(db, 'testimonials'));
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`📊 Projects: ${projectsSnapshot.size} documents`);
    console.log(`📊 Services: ${servicesSnapshot.size} documents`);
    console.log(`📊 Testimonials: ${testimonialsSnapshot.size} documents`);
    console.log(`📊 Users: ${usersSnapshot.size} documents`);
    
    console.log('🎉 Database setup complete!');
    console.log('🔄 Refreshing page to see admin features...');
    
    // Refresh the page to show admin features
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    console.log('💡 Make sure:');
    console.log('  1. You are logged in');
    console.log('  2. Firestore security rules allow authenticated users to write');
    console.log('  3. Firestore database exists in Firebase Console');
  }
})();
```

### Step 2: Press Enter
- After pasting the code, press **Enter**
- Watch the console output for progress messages
- The page will automatically refresh after 2 seconds

### Step 3: Verify Success
After the page refreshes:
1. You should see **"Admin Dashboard"** link in navigation
2. Go to `/admin` to see the admin interface
3. Check the **User Management** tab to see your admin profile

## 🎯 What This Does
- ✅ Creates sample projects, services, and testimonials
- ✅ Makes you an admin user with all permissions
- ✅ Uses your existing login session
- ✅ Works with your Angular app's Firebase instance
- ✅ Automatically refreshes to show admin features

## 🔧 Troubleshooting
If you get any errors:
1. Make sure you're on **http://localhost:56170** (your Angular app)
2. Make sure you see **"Logout (your@email.com)"** in navigation
3. Check that Firestore security rules allow authenticated users to write
4. Verify Firestore database exists in Firebase Console

This method is much simpler because it uses your existing login session directly!