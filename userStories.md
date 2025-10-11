User stories (prioritized & actionable)
Epic A — Global theming (no transparency, consistent contrast)

US-A1: As a visitor, I always see solid backgrounds (no translucency) so text/icons are readable on every page.
Acceptance criteria

No element uses rgba(..., <1) or opacity < 1 for backgrounds in the theme.

Global tokens defined: --bg-surface, --bg-elevated, --text, --muted, --primary, --on-primary, --border.

Contrast ≥ 4.5:1 for body text and ≥ 3:1 for large text/buttons.

Dark overlays replaced by solid brand tints; images never sit behind text without a solid layer.

US-A2: As an editor, I can apply one of the predefined solid themes site-wide from a single SCSS map.
Acceptance criteria

One SCSS source of truth (e.g., _theme.scss) controls page, menu, dialog, cookie banner, and admin forms.

Changing a token updates all components after a rebuild.

Epic B — Megamenu reliability & accessibility

US-B1: As a visitor, the megamenu opens on hover/focus and stays open when moving the pointer into the panel.
Acceptance criteria

Uses :focus-within and click-to-open on touch devices.

Submenu does not disappear when crossing the gap between trigger and panel (no “hover gap”).

Menu closes on Esc, traps focus within panel, and restores focus to trigger on close.

Works at 320px–1920px widths; overlaps content correctly (z-index/stacking).

US-B2: As a visitor, the megamenu is readable (no transparency; solid panel).
Acceptance criteria

Panel background uses --bg-elevated; text uses --text.

Link hover/active states meet contrast rules.

Epic C — Cookie consent banner contrast

US-C1: As a visitor, cookie banner buttons are clearly visible (no white text on white background).
Acceptance criteria

Primary and secondary buttons use brand tokens: --primary + --on-primary and --bg-surface + --text.

Focus outlines visible; buttons have hover/active styles.

Banner readable on all breakpoints; not obscured by other fixed elements.

Epic D — Product upload form (admin) buttons & layout

US-D1: As an admin, the bottom action bar (Save/Cancel/Publish) is always visible and legible.
Acceptance criteria

Sticky footer bar with solid background --bg-elevated and border; buttons use btn-primary/btn-ghost tokens.

No white-on-white; loading/disabled states are distinct.

Keyboard-navigable; Enter triggers primary action; Esc cancels if safe.

US-D2: As an admin, I get validation and clear error states on upload.
Acceptance criteria

Inline error messages with icon + text; ARIA aria-invalid on fields.

Submit disabled while uploading; spinner shown.

Epic E — Design-system hardening

US-E1: As a dev, I have lint rules that block low-contrast colors or transparent backgrounds.
Acceptance criteria

Stylelint rule (or custom lint) rejects rgba with alpha < 1 for background-color.

Pre-commit hook runs stylelint and unit tests.

Visual regression snapshots for megamenu, cookie banner, and product upload footer.

Definition of Done (for all above)

Keyboard a11y verified: Tab order, Esc close, focus outlines.

Lighthouse Accessibility score ≥ 95 on key pages.

Tested in Chrome, Safari, Firefox; responsive from 320px to 1440px+.

Firestore error: “Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?”

This almost always means you’re mixing different Firestore instances or SDK styles. Common culprits:

Compat vs Modular mix

Imports like import firebase from 'firebase/compat/app' + import { getFirestore } from 'firebase/firestore' in the same app.

Or AngularFire (@angular/fire) mixed with raw firebase/firestore refs.

Multiple app instances

Calling initializeApp(...) more than once (or initializing a second default app).

Creating a ref (doc(db, ...)) with dbA and passing it into a function expecting dbB.

Mismatched packages/versions

Two versions of firebase or @angular/fire in node_modules.

Emulator vs prod mismatch

A ref created on emulator DB used with a function wired to prod (or vice-versa).

Quick diagnosis checklist

npm ls firebase @angular/fire → ensure single versions.

Grep your codebase for initializeApp( → ensure it’s done once.

Ensure one way of using Firestore:

AngularFire only or Firebase modular only, not both.

If using AngularFire: import from @angular/fire/app and @angular/fire/firestore only; don’t import from firebase/*.

Safe patterns (pick one stack)
A) AngularFire (recommended in Angular apps)
// app.module.ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

@NgModule({
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
  ],
})
export class AppModule {}

// some.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private firestore: Firestore) {}

  saveProduct(id: string, data: any) {
    const ref = doc(this.firestore, `products/${id}`);
    return setDoc(ref, data);
  }
}

B) Pure Firebase modular (no AngularFire)
// firebase.ts (single source of truth)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const app = getApps().length ? getApp() : initializeApp(environment.firebase);
export const db = getFirestore(app);
// if (environment.useEmulator) connectFirestoreEmulator(db, 'localhost', 8080);

// usage
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

await setDoc(doc(db, 'products/my-id'), { ... });


Never pass a DocumentReference or CollectionReference created with AngularFire Firestore into a function expecting one from firebase/firestore (or vice versa). Keep them consistent.

Immediate SCSS/HTML patches (no transparency, fix white-on-white)

Drop these into your global stylesheet (e.g., styles.scss) and adapt tokens to your brand.

/* _tokens.scss */
:root {
  --bg-surface: #ffffff;
  --bg-elevated: #f6f7f9;
  --text: #0f172a;           /* slate-900 */
  --muted: #475569;          /* slate-600 */
  --primary: #0ea5e9;        /* sky-500 */
  --on-primary: #ffffff;
  --border: #e2e8f0;         /* slate-200 */
}

/* ban transparent backgrounds for core containers */
body, .app-shell, .page, .card, .dialog, .megamenu-panel, .cookie-banner,
.admin-footer, header, nav {
  background-color: var(--bg-surface) !important;
  opacity: 1 !important;
}

/* base text & links */
body {
  color: var(--text);
}
a { color: var(--primary); }
a:hover { text-decoration: underline; }

/* buttons */
.btn, button, [type="button"], [type="submit"] {
  background-color: var(--primary);
  color: var(--on-primary);
  border: 1px solid var(--primary);
}
.btn-ghost {
  background-color: var(--bg-surface);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* cookie banner */
.cookie-banner {
  position: fixed;
  inset-block-end: 0;
  inset-inline: 0;
  background-color: var(--bg-elevated);
  border-top: 1px solid var(--border);
  color: var(--text);
  padding: 12px 16px;
}
.cookie-banner .actions .btn {
  margin-inline-start: 8px;
}

/* admin product upload footer */
.admin-footer {
  position: sticky;
  bottom: 0;
  background-color: var(--bg-elevated);
  border-top: 1px solid var(--border);
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* megamenu – keep open on hover/focus and remove transparency */
.nav .has-submenu { position: relative; }
.nav .submenu {
  position: absolute;
  inset-block-start: 100%;
  inset-inline-start: 0;
  min-width: 280px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  box-shadow: 0 10px 24px rgba(0,0,0,.08);
  opacity: 0; visibility: hidden; transform: translateY(6px);
  transition: opacity .12s ease, transform .12s ease, visibility 0s linear .12s;
  z-index: 50;
  padding: 12px;
}
.nav .has-submenu:focus-within .submenu,
.nav .has-submenu:hover .submenu {
  opacity: 1; visibility: visible; transform: translateY(0);
  transition-delay: 0s;
}

/* increase hit area to avoid hover gap */
.nav .has-submenu::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  height: 10px;
  inset-block-start: 100%;
}

/* focus outlines */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}


If your CSS framework is overriding styles, add these at the end of styles.scss and, if needed, increase specificity with a root wrapper (e.g., .app-root .btn { ... }).

Megamenu HTML tweaks (prevent disappearing, support keyboard)
<li class="has-submenu">
  <button aria-haspopup="true" aria-expanded="false" aria-controls="mega-1" class="menu-trigger">
    Products
  </button>
  <div id="mega-1" class="submenu" role="menu" aria-label="Products">
    <!-- submenu content -->
  </div>
</li>


Add a tiny script to toggle aria-expanded on click for touch devices; keep hover/focus for desktop.

Sanity checks to avoid white-on-white in forms

Audit all .btn, .button, .mat-button, .p-button (if using Material/PrimeNG). Map them to btn and btn-ghost classes or override framework variables (e.g., Angular Material’s theming SCSS).

Ensure cookie component uses the same token variables; avoid inline styles.

Minimal test plan (quick pass)

Megamenu: hover→move cursor diagonally into panel; ensure it stays open. Press Tab and arrow keys; Esc closes.

Cookie banner: visible contrast; buttons noticeable; Tab order works.

Admin Upload: sticky footer always visible; buttons readable; disabled state during upload.

Lighthouse: A11y ≥ 95.