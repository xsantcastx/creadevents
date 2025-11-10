✅ High-level direction

I want to turn this repo into a reusable template so I can spin up new sites by:

dropping in a .env file,

selecting a brand config (logo/colors/hero copy), and

optionally toggling feature modules (e.g., Blog, Newsletter, Donations).

Core backend behavior (Auth, Firestore, Cloud Functions, Stripe, Brevo, Analytics) should remain intact across projects.

1) Which elements must stay fixed vs configurable?

Must stay fixed (shared across all sites):

Auth flows: Email/Password (and optional OAuth providers we already support), the same sign-in/sign-up/reset routes, and the same guard logic.

Firestore structure: Core collections and indexes (e.g., users, orders, products, site_settings, inventory, logs, etc.) and the data shapes our Cloud Functions expect.

Cloud Functions API contracts: Endpoints/events for Stripe checkout/webhooks, Brevo email triggers, inventory updates, audit logging, etc.

Security rules & server-side validation: The authorization model shouldn’t change per-site.

Analytics wiring: The GA4/GTM plumbing and client events schema stay consistent (only the tracking IDs change).

Configurable per site (via config + env):

Branding & UI: logo, favicon, color tokens, typography scale, layout density, CTA styles.

Copy & content: hero headline, subcopy, FAQs, footer links, legal pages (terms/privacy/refund).

Catalog & pricing: product list, categories, badges, purchase flow toggles (one-time vs donation).

SEO: site name, meta defaults, social share images, OpenGraph/Twitter.

Integrations: Stripe price IDs, GA4 ID, GTM ID, Brevo list IDs/templates, reCAPTCHA keys.

Navigation: header/footer menus, social links.

Feature flags: enable/disable Blog, Reviews, Newsletter, Affiliates, “Coming Soon” gate, etc.

2) Placeholder assets vs configuration layer?

Let’s introduce a formal configuration layer so each new site can be branded without code edits:

/config/site.json (runtime brand & content)

/config/features.json (feature flags)

.env (secrets & environment-specific IDs)

Optional: /config/catalog.seed.json to bootstrap Firestore with products/content

Why JSON + env?

JSON files are easy to review in PRs and can be edited by non-devs.

Secrets/keys stay in .env, never in JSON.

We can also mirror the JSON into Firestore site_settings/<siteId> so content tweaks don’t require redeploys.

3) Keep all pages/features or make modules optional?

Make sections modular and toggle with feature flags. Proposed flags:

// /config/features.json
{
  "blog": false,
  "newsletter": true,
  "donations": false,
  "reviews": true,
  "affiliates": false,
  "educationalHub": true,
  "cookieBanner": true,
  "maintenanceMode": false
}


Pages/components read these flags and tree-shake accordingly at build time (and/or guard at runtime).

4) Naming & IDs to generalize

We’ll generalize everything that binds to an environment or brand:

Firebase: FIREBASE_PROJECT_ID, FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_APP_ID, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_STORAGE_BUCKET.

Stripe: STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, plus per-site PRICE_ID_* values.

Brevo: BREVO_API_KEY, BREVO_LIST_ID, BREVO_TEMPLATE_ID_*.

Analytics: GA_MEASUREMENT_ID, GTM_CONTAINER_ID.

App identity: APP_NAME, APP_URL, APP_BRAND_KEY (maps to /config set).

Functions naming: prefix functions with APP_BRAND_KEY or read a FUNCTIONS_NAMESPACE to avoid collisions in multi-project dev.

Proposed repo structure (template-friendly)
/config
  /brands
    /default
      site.json            # logo URLs, colors, hero copy, nav, footer, SEO
      features.json        # feature flags
      emails.json          # template-friendly strings (brevo placeholders)
      catalog.seed.json    # optional seed data for Firestore
    /brand-x
      site.json
      features.json
  schema/
    site.schema.json       # JSON schema for validation
    features.schema.json
.env.example               # all keys with comments

/src
  /app
    /core                  # auth guards, interceptors, analytics svc
    /shared                # UI kit, tokens, helpers
    /features
      /catalog             # product list, PDP, search
      /checkout            # stripe integration
      /newsletter          # brevo subscription form
      /blog                # optional
      /reviews             # optional
      /donations           # optional
    /pages                 # home, about, faq, legal
  /theme
    tokens.css             # CSS variables for colors/spacing/typography
    theme.ts               # applies tokens from config/brands/*/site.json
  /config-loader
    config.service.ts      # loads /config/brands/${APP_BRAND_KEY}/site.json
    features.service.ts    # ditto for features

/functions
  /src
    stripe/
    brevo/
    inventory/
    auth/
  .runtimeconfig.json      # populated by CI from secrets

/scripts
  seed-firestore.ts
  create-site.sh           # scaffolds /config/brands/<new>

Example: .env.example
# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_APP_ID=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_STORAGE_BUCKET=

# Stripe
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PRICE_ID_MAIN=
PRICE_ID_DONATION_OPTIONAL=

# Brevo
BREVO_API_KEY=
BREVO_LIST_ID=
BREVO_TEMPLATE_ID_ORDER=
BREVO_TEMPLATE_ID_NEWSLETTER_WELCOME=

# Analytics
GA_MEASUREMENT_ID=
GTM_CONTAINER_ID=

# App
APP_NAME=The Lux Mining
APP_URL=https://theluxmining.com
APP_BRAND_KEY=default
FUNCTIONS_NAMESPACE=tlm

Example: /config/brands/default/site.json
{
  "brand": {
    "name": "The Lux Mining",
    "logo": "/assets/brand/logo.svg",
    "favicon": "/assets/brand/favicon.png"
  },
  "theme": {
    "primary": "#E2B714",
    "onPrimary": "#0F0F0F",
    "background": "#0A0A0A",
    "surface": "#111214"
  },
  "hero": {
    "title": "Hand-built Bitcoin miners & premium crypto gear",
    "subtitle": "Numbered, signed, and battle-tested. Built by humans.",
    "ctaLabel": "Shop now",
    "ctaHref": "/products"
  },
  "navigation": {
    "header": [
      { "label": "Products", "href": "/products" },
      { "label": "About", "href": "/about" },
      { "label": "FAQ", "href": "/faq" }
    ],
    "footer": [
      { "label": "Terms", "href": "/legal/terms" },
      { "label": "Privacy", "href": "/legal/privacy" },
      { "label": "Refunds", "href": "/legal/refund" }
    ]
  },
  "seo": {
    "titleTemplate": "%s — The Lux Mining",
    "defaultDescription": "Hand-built miners and premium crypto accessories."
  },
  "social": {
    "twitter": "https://x.com/theluxmining",
    "instagram": "https://instagram.com/theluxmining"
  }
}

Example: feature gating in code
// features.service.ts
import features from '../../config/brands/default/features.json';
export const Features = {
  blog: !!features.blog,
  newsletter: !!features.newsletter,
  donations: !!features.donations,
  reviews: !!features.reviews,
  affiliates: !!features.affiliates,
  educationalHub: !!features.educationalHub,
  cookieBanner: !!features.cookieBanner,
  maintenanceMode: !!features.maintenanceMode
};

// route guard example
if (Features.maintenanceMode) {
  this.router.navigateByUrl('/maintenance');
}

Theming: one place to change logo/colors

Logo path and color tokens come from site.json.

We map those tokens to CSS variables in tokens.css at app start:

// theme.ts
export function applyTheme(theme: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
}

Cloud Functions & Firestore: stable contracts

Functions read only from env/runtime config (functions:config:set in CI).

Firestore data shapes for orders, users, products, site_settings won’t change between sites.

We can ship a schema doc and seed script:

npm run seed:firestore -- --brand=default → imports catalog.seed.json.

Security rules remain the same; indexes are version-controlled.

Spinning up a new site (template flow)

Use this repo as a template → create new repo.

Create Firebase project → enable Auth, Firestore, Hosting, Storage.

Create Stripe account/products → collect price IDs.

Set Brevo API key & list IDs.

Copy .env.example → .env and fill values.

Duplicate /config/brands/default → /config/brands/<brand-key> and customize site.json & features.json.

APP_BRAND_KEY=<brand-key> in .env.

Deploy Functions with FUNCTIONS_NAMESPACE=<brand-key> and set runtime config.

(Optional) Seed catalog: npm run seed:firestore -- --brand=<brand-key>.

Deploy Hosting/Functions.

CI/CD (nice-to-have)

Matrix builds for multiple brands:

For each <brand-key>: build with APP_BRAND_KEY=<brand-key>, deploy to its Firebase project.

Secrets stored in CI provider; Functions runtime config set per env.

Lint & JSON-schema validation on /config/brands/**.

TL;DR answers to your specific questions

Fixed vs configurable: Keep Auth, Firestore schema, Functions contracts, and analytics event model fixed. Make branding, copy, nav, catalog, SEO, IDs, and feature flags configurable via JSON + env.

Placeholders vs config layer: Use a JSON/env-driven configuration layer so each new site can change logo, colors, content, and IDs without touching code.

All pages vs optional modules: Keep core pages; gate extras (Blog, Newsletter, Reviews, Affiliates, Donations, Maintenance) behind feature flags.

Naming changes to generalize: Yes—parameterize Firebase/Stripe/Brevo/Analytics IDs, app/brand key, and optionally a FUNCTIONS_NAMESPACE to avoid collisions.

If this approach works for everyone, I’ll open a PR that:

adds /config with schemas and a default brand,

wires the config loader + theme tokens,

introduces feature flags,

documents the new “create-a-site” flow in README.md.

The plan (short)

Add a single source of truth: /config/brands/<brand>/backend.json with boolean flags.

At deploy time, a script copies that JSON into functions/src/config/backend.flags.ts so exports can be conditionally defined (needed for scheduled jobs).

At runtime, functions also read a live mirror in Firestore (site_settings/<brandKey>/backendFlags) so you can flip most features without re-deploying (webhooks, HTTP/callables, Firestore triggers can noop).

Client app also consumes the same flags to hide UI (optional but nice).

Example: /config/brands/default/backend.json
{
  "payments": true,              // Stripe checkout, prices, webhooks
  "subscriptions": false,        // recurring billing (if added)
  "donations": false,            // optional donation flow
  "emailNotifications": true,    // Brevo transactional sends
  "newsletter": true,            // Brevo list subscribe
  "inventory": true,             // stock reservation & decrements
  "orderAuditing": true,         // audit logs in Firestore
  "webAnalytics": true,          // GA/GTM events from server
  "dailyReports": false,         // scheduled report job
  "dbBackups": false             // scheduled export job
}

Deploy-time sync (so scheduled jobs can be disabled)

scripts/sync-backend-flags.ts (run from repo root during CI/deploy):

import fs from "fs";
import path from "path";

const brand = process.env.APP_BRAND_KEY || "default";
const src = path.join("config", "brands", brand, "backend.json");
const dst = path.join("functions", "src", "config", "backend.flags.ts");

const raw = fs.readFileSync(src, "utf8");
const json = JSON.parse(raw);

// emit a TS module the functions can import at load time
const out = `/* AUTO-GENERATED: do not edit */
export const BackendFlags = ${JSON.stringify(json, null, 2)} as const;
export type BackendFlagKeys = keyof typeof BackendFlags;
`;
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, out);
console.log(`[flags] ${src} -> ${dst}`);


CI step (pseudo):

APP_BRAND_KEY=mybrand node scripts/sync-backend-flags.ts
cd functions && npm run build && firebase deploy --only functions,hosting

Optional runtime toggles (no redeploy for most)

On bootstrap, functions try to read live flags from Firestore and merge with the compiled defaults. If the doc doesn’t exist, they fall back to compiled flags.

functions/src/config/flags.runtime.ts:

import { getFirestore } from "firebase-admin/firestore";
import { BackendFlags as compiled } from "./backend.flags";

let cached = compiled;

export async function getBackendFlags(): Promise<typeof compiled> {
  try {
    const brand = process.env.APP_BRAND_KEY || "default";
    const snap = await getFirestore()
      .doc(`site_settings/${brand}`)
      .get();
    const live = (snap.get("backendFlags") ?? {}) as Partial<typeof compiled>;
    cached = { ...compiled, ...live };
  } catch (_) { /* ignore and use compiled */ }
  return cached;
}


Why both compiled + runtime?

Compiled flags let us not export scheduled jobs at all when disabled.

Runtime flags let us no-op HTTP/callables/triggers instantly without redeploying.

Pattern: guard every function

functions/src/lib/guard.ts:

import { getBackendFlags } from "../config/flags.runtime";

export function withFlag<K extends string>(
  flag: K,
  handler: (...args: any[]) => Promise<any> | any,
  { ok = 200, disabledMsg = `${String(flag)} disabled` } = {}
) {
  return async (...args: any[]) => {
    const flags = await getBackendFlags();
    if (!(flags as any)[flag]) {
      // return benign responses for HTTP, swallow for triggers
      const maybeReq = args[0], maybeRes = args[1];
      if (maybeReq?.method && maybeRes?.status) {
        return maybeRes.status(ok).send(disabledMsg);
      }
      return; // no-op for background triggers
    }
    return handler(...args);
  };
}

Applying flags to each backend area
1) Stripe (payments/subscriptions/donations)
// HTTP webhook example
export const stripeWebhook = onRequest({ region: "us-central1" },
  withFlag("payments", async (req, res) => {
    // ...verify signature, handle events
    res.status(200).send("ok");
  })
);

// Callable example for checkout session creation
export const createCheckout = onCall(
  withFlag("payments", async (data, ctx) => {
    // ...create session
    return { url: "..." };
  })
);

2) Brevo (email notifications & newsletter)
export const sendOrderEmails = onDocumentCreated("orders/{id}",
  withFlag("emailNotifications", async (event) => {
    // ...send transactional emails
  })
);

export const subscribeNewsletter = onCall(
  withFlag("newsletter", async ({ email }) => {
    // ...add to list
    return { ok: true };
  })
);

3) Inventory & auditing
export const onOrderCreated = onDocumentCreated("orders/{id}",
  withFlag("inventory", async ({ data }) => {
    // ...reserve/decrement stock
  })
);

export const auditLog = onCall(
  withFlag("orderAuditing", async (payload, ctx) => {
    // ...write audit entry
  })
);

4) Scheduled jobs (must be decided at deploy)
import { BackendFlags } from "./config/backend.flags";
import { onSchedule } from "firebase-functions/v2/scheduler";

if (BackendFlags.dailyReports) {
  exports.dailyReports = onSchedule("0 3 * * *", async () => {
    // ...generate report
  });
}

if (BackendFlags.dbBackups) {
  exports.dbBackups = onSchedule("0 2 * * *", async () => {
    // ...export data
  });
}


If a flag is false, the export is not created, and no Cloud Scheduler job exists—clean and cheap.

Admin UX (flip flags without redeploy)

Create a doc: site_settings/<brandKey> with a field backendFlags that mirrors your JSON.

Build a tiny admin page (or Firestore Console) to toggle booleans.

Changes take effect immediately for HTTP/callables/webhooks and next-invocation for triggers.

Example Firestore doc:

{
  "backendFlags": {
    "payments": true,
    "newsletter": false,
    "emailNotifications": true
  }
}

Client app (optional, for UI)

You can also read flags into the client (from /config/brands/<brand>/backend.json or from site_settings) to hide/show flows:

// hide “Donate” if donations flag is off
*ngIf="flags.donations"

Security & consistency notes

Security rules don’t change with flags. Flags only enable/disable business logic, not authorization.

For webhooks, always return 200 when disabled to avoid retry storms.

For idempotency, ensure disabled paths don’t partially mutate state.

Consider a mandatory maintenanceMode flag to globally refuse writes in emergencies.

What you’ll get in the PR

config/brands/<brand>/backend.json (plus JSON schema).

scripts/sync-backend-flags.ts wired into deploy.

functions/src/config/backend.flags.ts (generated), flags.runtime.ts, and lib/guard.ts.

Guards applied to: Stripe webhook + callables, Brevo handlers, inventory, auditing, any other functions.

README updates: how to toggle, how deploy-time vs runtime flags interact.