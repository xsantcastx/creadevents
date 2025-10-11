0) Quick diagnosis (2 mins)

A. Find mixed imports

# look for multiple SDK styles in the project
grep -RIn "from 'firebase/" src apps libs | grep -E "compat|/firestore'|/app'"
grep -RIn "@angular/fire" src apps libs


If you see a mix like:

import firebase from 'firebase/compat/app'

and import { getFirestore, doc } from 'firebase/firestore'

or import { Firestore, doc } from '@angular/fire/firestore'

…you’re mixing types. Pick one stack (AngularFire or pure Firebase modular).

B. Ensure only one app

grep -RIn "initializeApp\(" src apps libs


You should initialize Firebase once.

C. Check for duplicate versions

npm ls firebase @angular/fire
# If peer dependency issues or multiple firebase versions appear, fix them.

1) Pick ONE approach and refactor to it
Option A — Angular app using AngularFire only (recommended for Angular)

app.module.ts

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

@NgModule({
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
  ],
})
export class AppModule {}


service.ts

import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, addDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private firestore: Firestore) {}

  async saveProduct(id: string, data: unknown) {
    const ref = doc(this.firestore, `products/${id}`); // ref from SAME Firestore
    await setDoc(ref, data);
  }

  async addProduct(data: unknown) {
    const col = collection(this.firestore, 'products');
    await addDoc(col, data);
  }
}


Do not import from firebase/firestore or firebase/compat/* anywhere.

Option B — Pure Firebase modular (no AngularFire anywhere)

firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

const app = getApps().length ? getApp() : initializeApp(environment.firebase);
export const db = getFirestore(app);


usage.ts

import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

await setDoc(doc(db, 'products/my-id'), { /* data */ });


Do not import from @angular/fire/* or firebase/compat/*.

2) Don’t pass refs across SDK boundaries

Bad (causes your error):

// ref created with AngularFire...
const refAF = doc(afFirestore, 'products/x');
// ...used in a function that imports from firebase/firestore (modular)
await setDoc(refAF as any, data); // ❌ different instance/type


Good:

// Pass path strings or plain data; create the ref locally inside the function
async function saveProduct(db: Firestore, path: string, data: unknown) {
  const ref = doc(db, path);
  return setDoc(ref, data);
}

3) SSR / Admin SDK caveat (Node vs browser)

If you’re doing SSR (Angular Universal) or any Node code:

Never pass an Admin SDK reference (from firebase-admin) to client-SDK functions.

Serialize data on the server; on the client, recreate refs with the client SDK.

Bad:

// server created adminRef -> sent to client -> used with client setDoc ❌


Good:

// server returns JSON data only; client does setDoc(doc(clientDb, path), data) ✅

4) Emulator vs Prod mismatch

If you connect to emulator in some places but not others, you’ll also get “different instance” types.

Make this consistent right after creating db:

import { connectFirestoreEmulator } from 'firebase/firestore';
if (!environment.production) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}


Ensure you don’t create a second Firestore later without the emulator attached.

5) Converters and types

If you use withConverter(), use the same converted ref everywhere for that collection.

Bad:

const refA = doc(db, 'products/x').withConverter(productConverter);
const refB = doc(db, 'products/x'); // no converter
await setDoc(refB, myProductTyped); // ❌ mismatch expectations


Good:

const ref = doc(db, 'products/x').withConverter(productConverter);
await setDoc(ref, myProductTyped); // ✅

6) Guardrails to catch the culprit

Temporarily log the app/DB associated with a ref where the crash happens:

// Works with both AngularFire and modular because both expose .firestore and .app
function debugRef(ref: any, label: string) {
  try {
    const db = ref.firestore;
    const app = db?.app;
    console.log(`[${label}] refType=${ref?.constructor?.name} app=${app?.name}`);
  } catch {}
}


Use it just before the failing call:

debugRef(ref, 'before setDoc');
await setDoc(ref, data);


If you see different app names (e.g., DEFAULT vs __some_other__), you’re mixing instances.

7) Clean up dependencies

Make sure there’s only one firebase and (if used) one @angular/fire version:

Align versions to current compatibles.

In monorepos, hoist or add a resolutions block to force a single firebase version if needed.

Remove firebase/compat/* unless you truly need the compat layer (then use compat everywhere, but it’s discouraged).

8) Common quick fixes (copy-paste)

Remove compat imports

// ❌ delete these everywhere
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';


Ensure single initialize

// If you have initializeApp in more than one lazy module, move it to Core/AppModule only.


Refactor helpers to take path, not ref

// before (bug-prone)
function save(ref: DocumentReference, data: any) { return setDoc(ref, data); }
// after (safe)
function save(db: Firestore, path: string, data: any) { return setDoc(doc(db, path), data); }


You’ve got two problems at once:

Two different firebase versions in the tree (11.x and 12.x)

Code most likely mixing Firestore objects created by different instances

Because rxfire@6.1.0 declares firebase peer ^9 || ^10 || ^11, your installed firebase@12.3.0 is invalid and NPM is complaining. That version split can also produce the “Type does not match the expected instance” Firestore error at runtime.

Below is a clean, reliable fix. Pick Option A (recommended) or Option B.

✅ Option A (recommended): Standardize on Firebase 11.x

Works with @angular/fire@20 and your current rxfire.

1) Pin dependencies

Add an overrides (npm) to force one firebase version everywhere:

// package.json
{
  "dependencies": {
    "@angular/fire": "20.0.1",
    "firebase": "11.10.0",
    "rxfire": "6.1.0"
  },
  "overrides": {
    "firebase": "11.10.0"
  }
}


If you don’t want to use overrides, just remove firebase@12.3.0 explicitly and install 11.x:

npm uninstall firebase
npm i firebase@11


2) Clean install (Windows PowerShell)

rmdir /s /q node_modules
del package-lock.json
npm cache verify
npm i
npm dedupe
npm ls firebase @angular/fire rxfire


You should see exactly one firebase@11.x in the tree.

3) Make your imports consistent (AngularFire-only path)

Use either AngularFire or pure modular Firebase, not both. If you’re using AngularFire, your code should import only from @angular/fire/*:

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

// product.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private firestore: Firestore) {}
  save(id: string, data: unknown) {
    const ref = doc(this.firestore, `products/${id}`);
    return setDoc(ref, data);
  }
}


Do not import from firebase/firestore or firebase/compat/* anywhere if you choose AngularFire.

✅ Option B: (Only if you must) Move to Firebase 12.x

This is only safe if all your libraries (including @angular/fire and rxfire) support 12.x. Today, rxfire@6.1.0 does not (it caps at 11), so you’d have to remove or upgrade rxfire to a version that supports 12 (if/when available), and verify @angular/fire compatibility first. If you can’t guarantee that, stick with Option A.

Extra guardrails to kill the runtime error

Ensure you initialize your app once:

grep -RIn "initializeApp(" src apps libs


Don’t pass a ref created with one SDK into a function from the other. If needed, refactor helpers to accept paths and create the ref locally:

function save(db: Firestore, path: string, data: unknown) {
  return setDoc(doc(db, path), data);
}


Emulator/prod: connect the emulator right after creating the single db instance, everywhere:

import { connectFirestoreEmulator } from 'firebase/firestore';
if (!environment.production) connectFirestoreEmulator(db, '127.0.0.1', 8080);

Quick verification

npm ls firebase → shows one version (11.x if you did Option A).

Search your codebase:

grep -RIn "from 'firebase/" src apps libs | grep -E "compat|/firestore'|/app'"
grep -RIn "@angular/fire" src apps libs


You should see only one family of imports (preferably @angular/fire/* for Angular apps).

Re-run and the _FirebaseError: Type does not match the expected instance should disappear.