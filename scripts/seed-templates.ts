import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBn0N8EE0zzTp0CXNcmLj2G4rNVqJ_w2GY",
  authDomain: "theluxmining-91ab1.firebaseapp.com",
  projectId: "theluxmining-91ab1",
  storageBucket: "theluxmining-91ab1.firebasestorage.app",
  messagingSenderId: "633634027863",
  appId: "1:633634027863:web:a5c0a94fc9c6e3d8da1d8b",
  measurementId: "G-XZH0BR1KL7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

interface Template {
  type: 'description' | 'seoTitle' | 'seoMeta' | 'specs';
  scope: 'material' | 'category' | 'family' | 'global';
  refId?: string;
  language: 'es' | 'en' | 'fr' | 'it';
  content?: string;
  specDefaults?: any;
  fields?: string[];
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

const defaultTemplates: Omit<Template, 'createdAt' | 'updatedAt'>[] = [
  // ===== GLOBAL DESCRIPTION TEMPLATES =====
  {
    type: 'description',
    scope: 'global',
    language: 'en',
    content: `Introducing the {name} - a cutting-edge Bitcoin mining solution designed for maximum efficiency and performance.

Key Features:
• Hash Rate: {size}
• Model: {material}
• Power Efficiency: Industry-leading performance
• Cooling System: Advanced thermal management
• Build Quality: Enterprise-grade components

This {material} miner is engineered to deliver exceptional mining performance while maintaining optimal energy efficiency. Perfect for professional mining operations and data centers looking to maximize their Bitcoin mining profitability.

Whether you're scaling your mining farm or starting fresh, the {name} provides the reliability and performance you need to stay competitive in the Bitcoin mining industry.`,
    fields: ['name', 'material', 'size', 'category'],
    active: true
  },
  {
    type: 'description',
    scope: 'global',
    language: 'es',
    content: `Presentamos el {name} - una solución de minería Bitcoin de vanguardia diseñada para máxima eficiencia y rendimiento.

Características Principales:
• Tasa de Hash: {size}
• Modelo: {material}
• Eficiencia Energética: Rendimiento líder en la industria
• Sistema de Enfriamiento: Gestión térmica avanzada
• Calidad de Construcción: Componentes de grado empresarial

Este minero {material} está diseñado para ofrecer un rendimiento de minería excepcional mientras mantiene una eficiencia energética óptima. Perfecto para operaciones de minería profesionales y centros de datos que buscan maximizar su rentabilidad en minería Bitcoin.

Ya sea que esté escalando su granja minera o comenzando de cero, el {name} proporciona la confiabilidad y el rendimiento que necesita para mantenerse competitivo en la industria de minería Bitcoin.`,
    fields: ['name', 'material', 'size', 'category'],
    active: true
  },

  // ===== GLOBAL SEO TITLE TEMPLATES =====
  {
    type: 'seoTitle',
    scope: 'global',
    language: 'en',
    content: '{name} - {size} Bitcoin Miner | TheLuxMining',
    fields: ['name', 'size'],
    active: true
  },
  {
    type: 'seoTitle',
    scope: 'global',
    language: 'es',
    content: '{name} - Minero Bitcoin {size} | TheLuxMining',
    fields: ['name', 'size'],
    active: true
  },

  // ===== GLOBAL SEO META TEMPLATES =====
  {
    type: 'seoMeta',
    scope: 'global',
    language: 'en',
    content: 'Buy {name} Bitcoin miner with {size} hash rate. {material} model featuring enterprise-grade components, advanced cooling, and industry-leading power efficiency. Professional mining solutions at TheLuxMining.',
    fields: ['name', 'material', 'size'],
    active: true
  },
  {
    type: 'seoMeta',
    scope: 'global',
    language: 'es',
    content: 'Compra el minero Bitcoin {name} con tasa de hash de {size}. Modelo {material} con componentes de grado empresarial, enfriamiento avanzado y eficiencia energética líder en la industria. Soluciones de minería profesional en TheLuxMining.',
    fields: ['name', 'material', 'size'],
    active: true
  },

  // ===== CATEGORY-SPECIFIC: ASIC MINERS =====
  {
    type: 'description',
    scope: 'category',
    language: 'en',
    content: `The {name} is a professional-grade ASIC miner delivering {size} of pure mining power.

Performance Specifications:
• Hash Rate: {size}
• Algorithm: SHA-256 (Bitcoin)
• Model: {material}
• Power Consumption: Optimized for profitability
• Noise Level: Designed for data center deployment

Built for Professionals:
This ASIC miner combines cutting-edge semiconductor technology with robust thermal management to ensure consistent, reliable performance 24/7. The {material} series represents the pinnacle of Bitcoin mining efficiency.

Ideal Applications:
• Large-scale mining farms
• Professional mining operations
• Data center deployments
• Commercial Bitcoin mining

Get maximum ROI with TheLuxMining's premium ASIC mining solutions.`,
    fields: ['name', 'material', 'size'],
    active: true
  },
  {
    type: 'description',
    scope: 'category',
    language: 'es',
    content: `El {name} es un minero ASIC de grado profesional que ofrece {size} de poder de minería puro.

Especificaciones de Rendimiento:
• Tasa de Hash: {size}
• Algoritmo: SHA-256 (Bitcoin)
• Modelo: {material}
• Consumo de Energía: Optimizado para rentabilidad
• Nivel de Ruido: Diseñado para implementación en centros de datos

Construido para Profesionales:
Este minero ASIC combina tecnología de semiconductores de vanguardia con gestión térmica robusta para garantizar un rendimiento consistente y confiable 24/7. La serie {material} representa el pináculo de la eficiencia de minería Bitcoin.

Aplicaciones Ideales:
• Granjas mineras a gran escala
• Operaciones de minería profesionales
• Implementaciones en centros de datos
• Minería comercial de Bitcoin

Obtenga el máximo ROI con las soluciones premium de minería ASIC de TheLuxMining.`,
    fields: ['name', 'material', 'size'],
    active: true
  }
];

async function seedTemplates() {
  console.log('🚀 Starting template seeding...\n');
  
  try {
    const templatesCollection = collection(firestore, 'templates');
    const now = Timestamp.now();
    
    for (const template of defaultTemplates) {
      const data = {
        ...template,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(templatesCollection, data);
      console.log(`✅ Created ${template.type} template (${template.scope}, ${template.language}): ${docRef.id}`);
    }
    
    console.log(`\n🎉 Successfully created ${defaultTemplates.length} templates!`);
    console.log('\n📝 Template Summary:');
    console.log('   - Description templates: 4 (2 global + 2 category)');
    console.log('   - SEO Title templates: 2 (global)');
    console.log('   - SEO Meta templates: 2 (global)');
    console.log('   - Languages: English & Spanish');
    console.log('\n✨ Auto-fill is now ready to use!');
    
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  }
}

// Run the seeder
seedTemplates()
  .then(() => {
    console.log('\n✅ Template seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Template seeding failed:', error);
    process.exit(1);
  });
