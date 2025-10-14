# GitHub Actions Firebase Deployment Fix

## Problem
GitHub Actions workflow failing with error:
```
Error: Input required and not supplied: firebaseServiceAccount
```

## Root Cause
- Workflow files were using old project ID: `tstone-e1de6`
- Missing GitHub secret: `FIREBASE_SERVICE_ACCOUNT_THELUXMINING_91AB1`

## Solution

### ✅ **Step 1: Generate Firebase Service Account Key**

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com/
   - Select project: **theluxmining-91ab1**

2. **Access Service Accounts**
   - Click ⚙️ gear icon → **Project settings**
   - Click **Service accounts** tab
   - Click **Generate new private key** button

3. **Download Key**
   - Click **Generate key** in confirmation dialog
   - A JSON file will download automatically
   - **IMPORTANT**: Keep this file secure - it contains sensitive credentials
   - File name will be something like: `theluxmining-91ab1-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`

### ✅ **Step 2: Add Secret to GitHub Repository**

1. **Navigate to Repository Settings**
   - Go to: https://github.com/xsantcastx/TheLuxMining
   - Click **Settings** tab (top navigation)

2. **Access Secrets**
   - In left sidebar, expand **Secrets and variables**
   - Click **Actions**

3. **Create New Secret**
   - Click green **New repository secret** button
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_THELUXMINING_91AB1`
   - **Secret**: Open the downloaded JSON file and copy ALL contents
   - Paste the entire JSON into the Secret field
   - Click **Add secret**

### ✅ **Step 3: Updated Workflow Files**

Both workflow files have been updated:

**File 1**: `.github/workflows/firebase-hosting-merge.yml`
- ✅ Updated project ID: `tstone-e1de6` → `theluxmining-91ab1`
- ✅ Updated secret name: `FIREBASE_SERVICE_ACCOUNT_TSTONE_E1DE6` → `FIREBASE_SERVICE_ACCOUNT_THELUXMINING_91AB1`

**File 2**: `.github/workflows/firebase-hosting-pull-request.yml`
- ✅ Updated project ID: `tstone-e1de6` → `theluxmining-91ab1`
- ✅ Updated secret name: `FIREBASE_SERVICE_ACCOUNT_TSTONE_E1DE6` → `FIREBASE_SERVICE_ACCOUNT_THELUXMINING_91AB1`

### ✅ **Step 4: Commit and Push Changes**

```bash
git add .github/workflows/
git commit -m "fix: update Firebase deployment workflows for theluxmining-91ab1 project"
git push origin main
```

### ✅ **Step 5: Verify Deployment**

1. After pushing, go to: https://github.com/xsantcastx/TheLuxMining/actions
2. You should see a new workflow run starting
3. Click on the workflow to see live progress
4. If the secret was added correctly, deployment should succeed ✅

## What the Workflows Do

### **firebase-hosting-merge.yml**
- **Triggers**: Every push to `main` branch
- **Action**: Builds and deploys to Firebase Hosting **production**
- **URL**: Your live site at Firebase

### **firebase-hosting-pull-request.yml**
- **Triggers**: Every pull request
- **Action**: Builds and creates preview URL
- **URL**: Temporary preview link posted in PR comments

## Troubleshooting

### If deployment still fails:

1. **Check secret name matches exactly**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Verify secret name is: `FIREBASE_SERVICE_ACCOUNT_THELUXMINING_91AB1`

2. **Verify JSON format**
   - Secret should start with `{` and end with `}`
   - Should contain fields like `type`, `project_id`, `private_key`, etc.

3. **Check Firebase project permissions**
   - Ensure service account has "Firebase Hosting Admin" role
   - In Firebase Console → Project settings → Service accounts

4. **View workflow logs**
   - Go to Actions tab in GitHub
   - Click on failed workflow
   - Expand steps to see detailed error messages

## Security Notes

⚠️ **NEVER commit the service account JSON file to your repository**
⚠️ **Always use GitHub Secrets for sensitive credentials**
⚠️ **Regenerate keys if accidentally exposed**

## Quick Reference

| Item | Value |
|------|-------|
| Firebase Project ID | `theluxmining-91ab1` |
| GitHub Secret Name | `FIREBASE_SERVICE_ACCOUNT_THELUXMINING_91AB1` |
| Deployment Branch | `main` |
| Build Command | `npm ci && npm run build` |

## Date Fixed
October 14, 2025
