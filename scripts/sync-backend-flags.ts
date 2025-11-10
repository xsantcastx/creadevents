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

const getEnv = (key: string, fallback = '') =>
  process.env[key] ?? exampleEnv[key] ?? fallback;

const brandKey = getEnv('APP_BRAND_KEY', 'default').trim() || 'default';
const src = path.join(repoRoot, 'config', 'brands', brandKey, 'backend.json');

if (!fs.existsSync(src)) {
  console.error(`[flags] Missing backend config for brand "${brandKey}". Expected at ${src}`);
  process.exit(1);
}

const raw = fs.readFileSync(src, 'utf8');
const json = JSON.parse(raw);

const dstDir = path.join(repoRoot, 'functions', 'src', 'config');
fs.mkdirSync(dstDir, { recursive: true });

const dst = path.join(dstDir, 'backend.flags.ts');
const out = `/* AUTO-GENERATED: do not edit */
export const BackendFlags = ${JSON.stringify(json, null, 2)} as const;
export type BackendFlagKeys = keyof typeof BackendFlags;
`;

fs.writeFileSync(dst, out);
console.log(`[flags] ${path.relative(repoRoot, src)} -> ${path.relative(repoRoot, dst)}`);
