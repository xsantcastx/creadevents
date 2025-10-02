#!/usr/bin/env node

/**
 * Firebase Data Seeding Script
 * 
 * This script extracts sample data from the Angular components and uploads it to Firestore.
 * Run this after configuring your Firebase credentials in the environment files.
 * 
 * Usage: npm run seed-data
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc } = require('firebase/firestore');
const { readFileSync } = require('fs');
const path = require('path');

// Read environment configuration
function loadEnvironment() {
  try {
    // Go up one level from scripts/ to project root, then into src/environments
    const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
    const envContent = readFileSync(envPath, 'utf8');
    
    // Extract Firebase config from environment file
    const configMatch = envContent.match(/firebase:\s*{([^}]+)}/s);
    if (!configMatch) {
      throw new Error('Firebase config not found in environment file');
    }
    
    const configStr = configMatch[1];
    const config = {};
    
    // Parse each property
    const properties = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    properties.forEach(prop => {
      const match = configStr.match(new RegExp(`${prop}:\\s*["']([^"']+)["']`));
      if (match) {
        config[prop] = match[1];
      }
    });
    
    return config;
  } catch (error) {
    console.error('Error loading environment:', error.message);
    console.log('\nPlease ensure you have updated src/environments/environment.ts with your Firebase credentials.');
    console.log('See FIREBASE_SETUP.md for instructions.');
    process.exit(1);
  }
}

// Sample data generators
function generateServices() {
  return [
    {
      title: "Wedding Planning & Design",
      slug: "wedding-planning-design",
      summary: "Complete wedding planning and floral design services to create your perfect day.",
      description: "From intimate ceremonies to grand celebrations, we create stunning wedding experiences with personalized floral designs, venue coordination, and full event planning services.",
      inclusions: [
        "Initial consultation & vision development",
        "Custom floral design & arrangements",
        "Venue decoration & setup",
        "Timeline coordination",
        "Emergency support & backup plans"
      ],
      minBudget: 2500,
      images: ["/assets/logo1.jpg", "/assets/logo2.jpg"],
      category: "events",
      featured: true,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Corporate Event Planning",
      slug: "corporate-events",
      summary: "Professional corporate events that impress clients and inspire teams.",
      description: "Transform your corporate events with sophisticated floral installations and professional event coordination that reflects your brand excellence.",
      inclusions: [
        "Brand-aligned design concepts",
        "Professional floral installations",
        "Event logistics coordination",
        "Audio/visual setup support",
        "Post-event cleanup"
      ],
      minBudget: 1500,
      images: ["/assets/logo2.jpg", "/assets/logo3.jpg"],
      category: "events",
      featured: false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Custom Floral Arrangements",
      slug: "floral-arrangements",
      summary: "Beautiful, fresh floral designs for any occasion.",
      description: "Our expert floral designers create stunning arrangements using the freshest flowers, working with your color palette and style preferences.",
      inclusions: [
        "Fresh, seasonal flowers",
        "Custom color coordination",
        "Professional arrangement design",
        "Delivery & setup service",
        "Care instructions provided"
      ],
      minBudget: 150,
      images: ["/assets/logo3.jpg", "/assets/logo4.jpg"],
      category: "florals",
      featured: true,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

function generateProjects() {
  return [
    {
      title: "Romantic Beach Wedding",
      slug: "romantic-beach-wedding",
      eventType: "wedding",
      client: "Maria & Carlos Rodriguez",
      season: ["spring"],
      palette: ["#F8BBD9", "#FFFFFF", "#E8F5E8"],
      location: "Miami Beach, FL",
      venue: "The Ritz-Carlton South Beach",
      date: new Date('2024-09-15'),
      heroImage: "/assets/logo1.jpg",
      gallery: ["/assets/logo1.jpg", "/assets/logo2.jpg", "/assets/logo3.jpg"],
      description: "A breathtaking wedding celebration featuring cascading rose arrangements, elegant table settings, and romantic lighting. Maria and Carlos's special day was transformed into a fairy tale with our signature romantic style.",
      floralsUsed: ["Red Roses", "White Roses", "Baby's Breath", "Eucalyptus", "Peonies"],
      testimonialRef: "1",
      category: "wedding",
      featured: true,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    },
    {
      title: "Corporate Gala Evening",
      slug: "corporate-gala-evening",
      eventType: "corporate",
      client: "Tech Solutions Inc",
      season: ["summer"],
      palette: ["#FFFFFF", "#000000", "#C0C0C0"],
      location: "Downtown Miami, FL",
      venue: "InterContinental Miami",
      date: new Date('2024-08-20'),
      heroImage: "/assets/logo2.jpg",
      gallery: ["/assets/logo2.jpg", "/assets/logo3.jpg"],
      description: "A sophisticated corporate event featuring modern floral installations, ambient lighting, and professional table settings that impressed clients and colleagues alike.",
      floralsUsed: ["White Orchids", "Monstera Leaves", "White Hydrangeas", "Silver Dollar Eucalyptus"],
      category: "corporate",
      featured: false,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      title: "Garden Party Celebration",
      slug: "garden-party-celebration",
      eventType: "private-party",
      client: "The Johnson Family",
      season: ["spring", "summer"],
      palette: ["#90EE90", "#FFB6C1", "#F0F8FF"],
      location: "Coral Gables, FL",
      venue: "Private Garden Estate",
      date: new Date('2024-06-10'),
      heroImage: "/assets/logo3.jpg",
      gallery: ["/assets/logo3.jpg", "/assets/logo4.jpg", "/assets/logo1.jpg"],
      description: "An enchanting garden party with organic floral installations, whimsical table settings, and natural beauty that celebrated nature's abundance.",
      floralsUsed: ["Garden Roses", "Wildflowers", "Ivy", "Lavender", "Sunflowers"],
      category: "private-party",
      featured: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    }
  ];
}

function generateTestimonials() {
  return [
    {
      author: "Maria & Carlos Rodriguez",
      role: "Bride & Groom",
      event: "Wedding Reception",
      quote: "Creation Design & Events made our wedding absolutely magical! From the stunning floral arrangements to the perfect lighting, every detail was executed flawlessly. Our guests are still talking about how beautiful everything was.",
      photo: "/assets/logo1.jpg",
      rating: 5,
      featured: true,
      createdAt: new Date('2024-09-20')
    },
    {
      author: "Jennifer Martinez",
      role: "Event Coordinator",
      event: "Corporate Gala",
      quote: "Working with Creation Design & Events for our annual corporate gala was a dream. They understood our vision perfectly and delivered beyond our expectations. Professional, creative, and reliable.",
      photo: "/assets/logo2.jpg",
      rating: 5,
      featured: true,
      createdAt: new Date('2024-08-25')
    },
    {
      author: "Sarah Johnson",
      role: "Host",
      event: "Garden Party",
      quote: "The team transformed our backyard into an enchanted garden! The floral arrangements were breathtaking, and the attention to detail was incredible. Highly recommend for any special occasion.",
      photo: "/assets/logo3.jpg",
      rating: 5,
      featured: false,
      createdAt: new Date('2024-06-15')
    }
  ];
}

function generateBlogPosts() {
  return [
    {
      title: "Spring Wedding Trends 2024: Fresh Ideas for Your Big Day",
      slug: "spring-wedding-trends-2024",
      excerpt: "Discover the hottest spring wedding trends for 2024, from garden-inspired florals to sustainable decorations that will make your celebration unforgettable.",
      body: "Spring weddings are experiencing a renaissance of natural beauty and sustainable practices. This season, couples are embracing garden-inspired aesthetics with wild, organic arrangements that seem to have been picked straight from an English cottage garden.\n\nThe trend towards sustainability is reshaping how we think about wedding florals. Couples are choosing locally-sourced blooms, potted plants that guests can take home, and arrangements that can be repurposed after the ceremony.",
      coverImage: "/assets/logo1.jpg",
      tags: ["trends", "seasonal", "weddings"],
      published: true,
      featured: true,
      publishedAt: new Date('2024-02-15'),
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      title: "Corporate Event Florals: Making a Professional Statement",
      slug: "corporate-event-florals-professional-statement",
      excerpt: "Learn how the right floral arrangements can elevate your corporate events and create lasting impressions on clients and colleagues.",
      body: "Corporate events require a different approach to floral design. The arrangements should be sophisticated, professional, and aligned with your brand image while still creating a welcoming atmosphere.\n\nConsider the venue, lighting, and brand colors when selecting florals. Clean lines, monochromatic schemes, and structured arrangements often work best for corporate settings.",
      coverImage: "/assets/logo2.jpg",
      tags: ["corporate", "tips", "professional"],
      published: true,
      featured: false,
      publishedAt: new Date('2024-01-05'),
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    }
  ];
}

function generateSettings() {
  return {
    themeBySeason: {
      spring: {
        palette: {
          primary: "#F8BBD9",
          secondary: "#E8F5E8",
          accent: "#FFD700",
          background: "#FFFEF7",
          text: "#2C3E50"
        },
        heroImage: "/assets/logo1.jpg",
        copySnippets: {
          hero: "Spring into Beauty",
          tagline: "Fresh blooms for fresh beginnings",
          cta: "Plan Your Spring Event"
        }
      },
      summer: {
        palette: {
          primary: "#87CEEB",
          secondary: "#FFE4B5",
          accent: "#FF6347",
          background: "#F0F8FF",
          text: "#2C3E50"
        },
        heroImage: "/assets/logo2.jpg",
        copySnippets: {
          hero: "Summer Celebrations",
          tagline: "Vibrant designs for sunny days",
          cta: "Create Summer Magic"
        }
      },
      autumn: {
        palette: {
          primary: "#D2691E",
          secondary: "#CD853F",
          accent: "#B22222",
          background: "#FFF8DC",
          text: "#8B4513"
        },
        heroImage: "/assets/logo3.jpg",
        copySnippets: {
          hero: "Autumn Elegance",
          tagline: "Rich textures and warm tones",
          cta: "Plan Your Fall Event"
        }
      },
      winter: {
        palette: {
          primary: "#4682B4",
          secondary: "#B0C4DE",
          accent: "#DC143C",
          background: "#F8F8FF",
          text: "#2F4F4F"
        },
        heroImage: "/assets/logo4.jpg",
        copySnippets: {
          hero: "Winter Wonderland",
          tagline: "Sophisticated celebrations in season",
          cta: "Design Your Winter Event"
        }
      }
    },
    contactEmail: "hello@creadevents.com",
    socialLinks: {
      instagram: "https://instagram.com/creadevents",
      whatsapp: "https://wa.me/1234567890",
      email: "hello@creadevents.com"
    },
    businessInfo: {
      name: "Creation Design & Events",
      address: "Miami, FL",
      phone: "+1 (305) 123-4567",
      coverage: ["Miami", "Fort Lauderdale", "West Palm Beach", "Florida Keys"]
    },
    updatedAt: new Date()
  };
}

// Main seeding function
async function seedData() {
  console.log('🌱 Starting Firebase data seeding...');
  
  try {
    // Load Firebase config
    const firebaseConfig = loadEnvironment();
    console.log('✅ Firebase configuration loaded');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Seed Services
    console.log('📋 Seeding services...');
    const services = generateServices();
    for (const service of services) {
      await addDoc(collection(db, 'services'), service);
    }
    console.log(`✅ Added ${services.length} services`);
    
    // Seed Projects
    console.log('🎨 Seeding projects...');
    const projects = generateProjects();
    for (const project of projects) {
      await addDoc(collection(db, 'projects'), project);
    }
    console.log(`✅ Added ${projects.length} projects`);
    
    // Seed Testimonials
    console.log('💬 Seeding testimonials...');
    const testimonials = generateTestimonials();
    for (const testimonial of testimonials) {
      await addDoc(collection(db, 'testimonials'), testimonial);
    }
    console.log(`✅ Added ${testimonials.length} testimonials`);
    
    // Seed Blog Posts
    console.log('📝 Seeding blog posts...');
    const posts = generateBlogPosts();
    for (const post of posts) {
      await addDoc(collection(db, 'posts'), post);
    }
    console.log(`✅ Added ${posts.length} blog posts`);
    
    // Seed Settings
    console.log('⚙️ Seeding settings...');
    const settings = generateSettings();
    await setDoc(doc(db, 'settings', 'main'), settings);
    console.log('✅ Added application settings');
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your components to use FirestoreService');
    console.log('2. Test the application with live data');
    console.log('3. Deploy your Firestore rules: firebase deploy --only firestore');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure Firebase credentials are correctly set in environment.ts');
    console.log('2. Make sure Firestore is enabled in your Firebase project');
    console.log('3. Check that your Firebase project ID is correct');
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  seedData();
}

module.exports = { seedData };