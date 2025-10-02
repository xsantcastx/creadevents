/**
 * 🔥 CreaDEvents Firestore Database Setup & Seeder
 * 
 * This script will:
 * 1. Help you initialize Firestore in your Firebase project
 * 2. Create sample data for testing
 * 3. Set up your admin user
 * 
 * Run: node firebase-setup.js
 */

const path = require('path');
const fs = require('fs');

console.log('🔥 CreaDEvents Firebase Setup & Database Seeder\n');

// Step 1: Firebase Console Setup Instructions
function displayFirebaseSetupInstructions() {
  console.log('📋 **STEP 1: Initialize Firestore Database**');
  console.log('');
  console.log('1. Go to: https://console.firebase.google.com');
  console.log('2. Select your CreaDEvents project');
  console.log('3. In the left sidebar, click "Firestore Database"');
  console.log('4. Click "Create database"');
  console.log('5. Choose "Start in test mode" (for now)');
  console.log('6. Select a location (e.g., us-central1)');
  console.log('7. Click "Done"');
  console.log('');
  console.log('✅ Your Firestore database is now ready!\n');
}

// Step 2: Sample Data Structure
function displaySampleData() {
  console.log('📊 **STEP 2: Sample Data Structure**');
  console.log('');
  console.log('Your Firestore will have these collections:');
  console.log('');
  console.log('🗂️ **Collections:**');
  console.log('├── users/          (User profiles & permissions)');
  console.log('├── projects/       (Portfolio projects)');
  console.log('├── services/       (Service offerings)');
  console.log('├── blog/           (Blog posts)');
  console.log('├── testimonials/   (Customer reviews)');
  console.log('└── inquiries/      (Contact form submissions)');
  console.log('');
}

// Step 3: Browser Console Seeder
function displayBrowserSeeder() {
  console.log('🌱 **STEP 3: Seed Database with Sample Data**');
  console.log('');
  console.log('After setting up Firestore, run this in your browser console:');
  console.log('(Go to http://localhost:4200, press F12, paste this code)');
  console.log('');
  console.log('```javascript');
  console.log(`
(async () => {
  console.log('🌱 Seeding CreaDEvents database...');
  
  try {
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    
    // Sample Projects
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
    
    // Sample Services
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
    
    // Sample Testimonials
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
    
    // Sample Blog Posts
    console.log('📝 Creating sample blog posts...');
    const blogPosts = [
      {
        title: "Summer Wedding Trends 2024",
        slug: "summer-wedding-trends-2024",
        excerpt: "Discover the hottest floral trends for summer weddings this year.",
        content: "Summer weddings are all about vibrant colors, tropical flowers, and outdoor elegance...",
        coverImage: "/assets/blog-summer-trends.jpg",
        category: "trends",
        featured: true,
        published: true,
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date("2024-06-01")
      }
    ];
    
    for (const post of blogPosts) {
      await addDoc(collection(db, 'blog'), post);
    }
    
    console.log('✅ Database seeded successfully!');
    console.log('📊 Created:');
    console.log('  - 2 sample projects');
    console.log('  - 2 sample services');
    console.log('  - 2 sample testimonials');
    console.log('  - 1 sample blog post');
    console.log('');
    console.log('🎉 Your CreaDEvents database is ready!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
})();
`);
  console.log('```');
  console.log('');
}

// Step 4: Admin User Setup
function displayAdminSetup() {
  console.log('👑 **STEP 4: Create Your Admin User**');
  console.log('');
  console.log('After seeding data, create your admin account:');
  console.log('');
  console.log('1. Go to http://localhost:4200/admin');
  console.log('2. Click "Register" and create your account');
  console.log('3. After registration, paste this in browser console:');
  console.log('');
  console.log('```javascript');
  console.log(`
(async () => {
  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');
    
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ Please log in first');
      return;
    }
    
    console.log('👤 Creating admin profile for:', user.email);
    
    // Create admin user profile
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Admin User',
      photoURL: user.photoURL || null,
      role: 'admin',
      permissions: {
        canManageContent: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canUploadFiles: true
      },
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date()
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('🔄 Refreshing page...');
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
})();
`);
  console.log('```');
  console.log('');
}

// Step 5: Security Rules
function displaySecurityRules() {
  console.log('🔒 **STEP 5: Production Security Rules**');
  console.log('');
  console.log('For production, replace your Firestore rules with:');
  console.log('(Firebase Console → Firestore → Rules)');
  console.log('');
  console.log('```javascript');
  console.log(`
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
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageContent == true;
    }
    
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageContent == true;
    }
    
    match /blog/{blogId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageContent == true;
    }
    
    match /testimonials/{testimonialId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canManageContent == true;
    }
  }
}
`);
  console.log('```');
  console.log('');
}

// Step 6: Verification
function displayVerification() {
  console.log('✅ **STEP 6: Verify Your Setup**');
  console.log('');
  console.log('After completing all steps:');
  console.log('');
  console.log('1. Navigate to http://localhost:4200');
  console.log('2. Check that the homepage loads with sample content');
  console.log('3. Go to /admin and verify you have admin access');
  console.log('4. Check the User Management tab works');
  console.log('5. Test creating/editing content');
  console.log('');
  console.log('🎉 **Your CreaDEvents app is fully configured!**');
  console.log('');
}

// Main execution
console.log('This script will guide you through setting up your Firestore database.\n');

displayFirebaseSetupInstructions();
displaySampleData();
displayBrowserSeeder();
displayAdminSetup();
displaySecurityRules();
displayVerification();

console.log('📚 **Need help?** Check PERMISSIONS_SETUP.md for detailed instructions.');
console.log('🚀 **Ready to start?** Follow the steps above in order.');