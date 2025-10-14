import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Load environment
const firebaseConfig = {
  apiKey: process.env['FIREBASE_API_KEY'] || '',
  authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || '',
  projectId: process.env['FIREBASE_PROJECT_ID'] || 'theluxmining-91ab1',
  storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || '',
  messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || '',
  appId: process.env['FIREBASE_APP_ID'] || ''
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Tag {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

const defaultTags: Omit<Tag, 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Mining Farm',
    slug: 'mining-farm',
    description: 'Large-scale mining operations and facilities',
    color: '#F7931A',
    icon: 'factory',
    order: 1,
    active: true
  },
  {
    name: 'Data Center',
    slug: 'data-center',
    description: 'Data center infrastructure and setups',
    color: '#FF9500',
    icon: 'database',
    order: 2,
    active: true
  },
  {
    name: 'ASIC Setup',
    slug: 'asic-setup',
    description: 'ASIC miner installations and configurations',
    color: '#FFB800',
    icon: 'chip',
    order: 3,
    active: true
  },
  {
    name: 'GPU Rig',
    slug: 'gpu-rig',
    description: 'GPU mining rig builds and setups',
    color: '#00D4AA',
    icon: 'gpu',
    order: 4,
    active: true
  },
  {
    name: 'Cooling System',
    slug: 'cooling-system',
    description: 'Cooling solutions and thermal management',
    color: '#00B8D4',
    icon: 'fan',
    order: 5,
    active: true
  },
  {
    name: 'Infrastructure',
    slug: 'infrastructure',
    description: 'Power, networking, and facility infrastructure',
    color: '#7E57C2',
    icon: 'network',
    order: 6,
    active: true
  },
  {
    name: 'Installation',
    slug: 'installation',
    description: 'Equipment installation and deployment',
    color: '#26A69A',
    icon: 'tools',
    order: 7,
    active: true
  },
  {
    name: 'Maintenance',
    slug: 'maintenance',
    description: 'Maintenance and repair operations',
    color: '#FF7043',
    icon: 'wrench',
    order: 8,
    active: true
  }
];

async function seedTags() {
  console.log('🚀 Starting tag seeding...\n');

  try {
    const tagsCollection = collection(db, 'tags');

    for (const tag of defaultTags) {
      const tagData = {
        ...tag,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(tagsCollection, tagData);
      console.log(`✅ Created tag (${tag.slug}): ${docRef.id}`);
    }

    console.log(`\n🎉 Successfully created ${defaultTags.length} tags!`);
    console.log('\n📝 Tag Summary:');
    console.log(`   - Mining Farm: For large-scale mining facilities`);
    console.log(`   - Data Center: For data center setups`);
    console.log(`   - ASIC Setup: For ASIC miner installations`);
    console.log(`   - GPU Rig: For GPU mining rigs`);
    console.log(`   - Cooling System: For thermal management`);
    console.log(`   - Infrastructure: For power & networking`);
    console.log(`   - Installation: For equipment deployment`);
    console.log(`   - Maintenance: For repair operations`);
    console.log('\n✨ Tags are now ready to use in gallery and products!');
    
  } catch (error) {
    console.error('❌ Error seeding tags:', error);
    throw error;
  }
}

// Run the seeder
seedTags()
  .then(() => {
    console.log('\n✅ Tag seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Tag seeding failed:', error);
    process.exit(1);
  });
