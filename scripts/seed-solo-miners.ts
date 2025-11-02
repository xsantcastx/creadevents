import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env['FIREBASE_API_KEY'] || '',
  authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || '',
  projectId: process.env['FIREBASE_PROJECT_ID'] || 'theluxmining-91ab1',
  storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || '',
  messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || '',
  appId: process.env['FIREBASE_APP_ID'] || ''
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface CategorySeed {
  name: string;
  slug: string;
  description?: string;
  order: number;
  active: boolean;
  icon?: string;
}

interface TagSeed {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  active: boolean;
}

const soloMinerCategory: CategorySeed = {
  name: 'Bitcoin Solo Miners',
  slug: 'solo-miners',
  description: 'Specialized Bitcoin solo mining hardware engineered for lottery mining and decentralized solo block discovery.',
  order: 10,
  active: true,
  icon: 'solo'
};

const soloMinerTags: TagSeed[] = [
  {
    name: 'Solo Miner',
    slug: 'solo-miner',
    description: 'Hardware purpose-built for solo mining and lottery block discovery.',
    color: '#F7931A',
    icon: '🎯',
    order: 10,
    active: true
  },
  {
    name: 'Lottery Mining',
    slug: 'lottery-mining',
    description: 'High-risk, high-reward solo mining strategies targeting full block rewards.',
    color: '#FF6B6B',
    icon: '🎰',
    order: 11,
    active: true
  },
  {
    name: 'Low Power',
    slug: 'low-power',
    description: 'Energy-efficient miners designed for home solo mining setups.',
    color: '#34D399',
    icon: '🔋',
    order: 12,
    active: true
  }
];

async function upsertCategory(category: CategorySeed): Promise<void> {
  const categoriesRef = collection(db, 'categories');
  const existing = await getDocs(query(categoriesRef, where('slug', '==', category.slug)));

  if (!existing.empty) {
    const docRef = doc(db, 'categories', existing.docs[0].id);
    await updateDoc(docRef, {
      ...category,
      updatedAt: Timestamp.now()
    });
    console.log(`Updated existing category (${category.slug})`);
    return;
  }

  await addDoc(categoriesRef, {
    ...category,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  console.log(`Created category (${category.slug})`);
}

async function upsertTag(tag: TagSeed): Promise<void> {
  const tagsRef = collection(db, 'tags');
  const existing = await getDocs(query(tagsRef, where('slug', '==', tag.slug)));

  if (!existing.empty) {
    const docRef = doc(db, 'tags', existing.docs[0].id);
    await updateDoc(docRef, {
      ...tag,
      updatedAt: Timestamp.now()
    });
    console.log(`Updated existing tag (${tag.slug})`);
    return;
  }

  await addDoc(tagsRef, {
    ...tag,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  console.log(`Created tag (${tag.slug})`);
}

async function run(): Promise<void> {
  console.log('🚀 Seeding Solo Miner collection metadata...\n');

  try {
    await upsertCategory(soloMinerCategory);

    for (const tag of soloMinerTags) {
      await upsertTag(tag);
    }

    console.log('\n✅ Solo miner taxonomy seeded successfully!');
    console.log('   • Category: Bitcoin Solo Miners');
    console.log('   • Tags:', soloMinerTags.map(tag => tag.slug).join(', '));
    console.log('\nℹ️  You can now assign products to the "solo-miners" category and tags inside the admin panel.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed solo miner taxonomy:', error);
    process.exit(1);
  }
}

run();
