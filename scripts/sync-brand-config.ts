import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv, parse as parseEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const envPath = path.join(repoRoot, '.env');
if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath, override: true });
} else {
  loadEnv();
}

const exampleEnvPath = path.join(repoRoot, '.env.example');
const exampleEnv = fs.existsSync(exampleEnvPath)
  ? parseEnv(fs.readFileSync(exampleEnvPath))
  : {};

const getEnv = (key: string, fallback = ''): string => {
  return process.env[key] ?? exampleEnv[key] ?? fallback;
};

const brandKey = getEnv('APP_BRAND_KEY', 'default').trim() || 'default';
const brandDir = path.join(repoRoot, 'config', 'brands', brandKey);

if (!fs.existsSync(brandDir)) {
  console.error(`[template] Brand directory not found: ${brandDir}`);
  process.exit(1);
}

const generatedDir = path.join(repoRoot, 'src', 'config-loader', 'generated');
fs.mkdirSync(generatedDir, { recursive: true });

const copyJson = (filename: string) => {
  const src = path.join(brandDir, filename);
  if (!fs.existsSync(src)) {
    return false;
  }
  const dst = path.join(generatedDir, filename);
  fs.copyFileSync(src, dst);
  console.log(`[template] ${filename} -> ${path.relative(repoRoot, dst)}`);
  return true;
};

['site.json', 'features.json', 'backend.json', 'emails.json', 'catalog.seed.json'].forEach(copyJson);

const brandFile = path.join(generatedDir, 'brand.ts');
fs.writeFileSync(
  brandFile,
  `/* AUTO-GENERATED: do not edit directly */
export const ACTIVE_BRAND_KEY = '${brandKey}' as const;
`
);
console.log(`[template] brand key -> ${path.relative(repoRoot, brandFile)}`);

const generatedEnvPath = path.join(repoRoot, 'src', 'environments', 'environment.generated.ts');
const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
  measurementId: getEnv('FIREBASE_MEASUREMENT_ID')
};

const generatedEnv = `/* AUTO-GENERATED: do not edit directly */
import type { GeneratedEnvironment } from './environment.types';

export const generatedEnvironment: GeneratedEnvironment = {
  firebase: ${JSON.stringify(firebaseConfig, null, 2)},
  stripe: {
    publishableKey: '${getEnv('STRIPE_PUBLIC_KEY')}'
  },
  recaptcha: {
    siteKey: '${getEnv('RECAPTCHA_SITE_KEY')}',
    enabled: ${getEnv('RECAPTCHA_ENABLED', 'true').toLowerCase() !== 'false'}
  },
  appCheck: {
    provider: '${getEnv('APPCHECK_PROVIDER', 'recaptcha')}',
    siteKey: '${getEnv('APPCHECK_SITE_KEY') || getEnv('RECAPTCHA_SITE_KEY')}'
  },
  analytics: {
    gaMeasurementId: '${getEnv('GA_MEASUREMENT_ID')}',
    gtmContainerId: '${getEnv('GTM_CONTAINER_ID')}'
  },
  app: {
    name: '${getEnv('APP_NAME', 'Template Commerce')}',
    url: '${getEnv('APP_URL', 'https://example.com')}',
    brandKey: '${brandKey}'
  },
  useEmulators: ${getEnv('USE_FIREBASE_EMULATORS', 'false').toLowerCase() === 'true'}
};
`;

fs.mkdirSync(path.dirname(generatedEnvPath), { recursive: true });
fs.writeFileSync(generatedEnvPath, generatedEnv);
console.log(`[template] environment -> ${path.relative(repoRoot, generatedEnvPath)}`);
