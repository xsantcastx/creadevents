# Backfill Images Script

This script migrates existing Firebase Storage images to Firestore metadata for use with the enhanced Images Dashboard.

## 🚨 Before You Start

**You need a Firebase Admin SDK service account file to run this script.** This file contains sensitive credentials and should NEVER be committed to git.

## Step-by-Step Setup

### Step 1: Get Firebase Service Account Credentials

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `creadevents` 
3. **Navigate to Settings**: Click the gear icon → "Project settings"
4. **Go to Service Accounts tab**: Click "Service accounts" 
5. **Generate new key**: Click "Generate new private key" button
6. **Download the JSON file**: Save it as something like `creadevents-service-account.json`
7. **Store it securely**: Put it somewhere safe on your computer (NOT in this project folder)

### Step 2: Set Environment Variables

**Windows PowerShell (your current setup):**
```powershell
# Set the path to your service account file
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\xsanc\path\to\creadevents-service-account.json"

# Set your storage bucket (replace with your actual bucket name)
$env:STORAGE_BUCKET="creadevents-437a8.appspot.com"

# Optional: limit to specific sections only
# $env:SECTIONS="hero,gallery"
```

**Example with actual path:**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\xsanc\Downloads\creadevents-service-account.json"
$env:STORAGE_BUCKET="creadevents-437a8.appspot.com"
```

### Step 3: Test Your Setup (Recommended)

Before running the backfill script, test your configuration:

```bash
npm run test:firebase
```

This will verify:
- ✅ Environment variables are set correctly
- ✅ Service account file exists and is valid
- ✅ Firebase connection works
- ✅ Storage and Firestore are accessible

### Step 4: Run the Backfill Script

Once the test passes, run the main script:

```bash
npm run backfill:images
```

## 🔍 Troubleshooting

### Error: "MODULE_NOT_FOUND"
- Make sure you downloaded the service account JSON file
- Check that the file path in `GOOGLE_APPLICATION_CREDENTIALS` is correct
- Verify the file exists at that location

### Error: "GOOGLE_APPLICATION_CREDENTIALS not set"
- Run the PowerShell command to set the environment variable
- Make sure you're in the same PowerShell session

### Error: "Service account file not found"
- Double-check the file path
- Use the full absolute path (C:\Users\...)
- Make sure the file wasn't moved or deleted

## What It Does

- Scans all files in `gs://<bucket>/public/<section>/`
- Ensures each file has a download token for public access
- Creates/updates Firestore documents in `/images` collection
- Uses SHA1 hash of storage path as document ID (idempotent)
- Sets default values for alt text, caption, and order

## Output Example

```
Using bucket: creadevents-437a8.appspot.com
Filtering sections: hero, gallery
Done. created=24, updated=3, skipped=0
```

## Security Notes

- Keep the service account JSON file secure and never commit it
- The script only needs to run locally, not in CI/CD
- Generated Firestore documents follow the security rules in `firestore.rules`

## Firestore Document Structure

```javascript
{
  section: "gallery",
  path: "public/gallery/image.jpg",
  url: "https://firebasestorage.googleapis.com/v0/b/.../image.jpg?alt=media&token=...",
  name: "image.jpg",
  order: 1699123456789, // timestamp for initial ordering
  alt: "",              // empty, to be filled via dashboard
  caption: "",          // empty, to be filled via dashboard
  createdAt: Timestamp  // from storage metadata
}
```

## Re-running

The script is idempotent - you can run it multiple times safely:
- Existing documents will be updated with current storage info
- New files will create new documents
- Existing order/alt/caption values are preserved