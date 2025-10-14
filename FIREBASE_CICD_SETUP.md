# Firebase CI/CD Setup Guide for GitHub Actions

## Step 1: Create Service Account in Google Cloud Console

1. Go to [Google Cloud Console - Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=theluxmining-91ab1)

2. Click **"+ CREATE SERVICE ACCOUNT"**

3. Fill in the details:
   - **Service account name**: `github-actions`
   - **Service account ID**: `github-actions` (will auto-generate as `github-actions@theluxmining-91ab1.iam.gserviceaccount.com`)
   - **Description**: `Service account for GitHub Actions CI/CD`
   - Click **"CREATE AND CONTINUE"**

4. Grant the following roles:
   - `Firebase Hosting Admin`
   - `Cloud Run Admin` (if using Cloud Run)
   - `Service Account User`
   - Click **"CONTINUE"**

5. Skip "Grant users access" (click **"DONE"**)

## Step 2: Create and Download Service Account Key

1. Find your newly created service account in the list
2. Click on the service account email
3. Go to the **"KEYS"** tab
4. Click **"ADD KEY"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"CREATE"**
7. The JSON key file will download automatically - **SAVE THIS FILE SECURELY**

## Step 3: Add Service Account Key to GitHub Secrets

1. Go to your GitHub repository: https://github.com/xsantcastx/TheLuxMining

2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**

3. Click **"New repository secret"**

4. Add the secret:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_THELUXMINING_91AB1`
   - **Value**: Paste the **ENTIRE CONTENT** of the downloaded JSON file
   - Click **"Add secret"**

## Step 4: Verify GitHub Workflows

Your workflows are already set up at:
- `.github/workflows/firebase-hosting-merge.yml` (deploys on merge to main)
- `.github/workflows/firebase-hosting-pull-request.yml` (preview deploys on PRs)

These should work automatically once the secret is added.

## Step 5: Test the Setup

1. Make a small change to your code
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "test: CI/CD setup"
   git push origin main
   ```

3. Go to GitHub repository → **"Actions"** tab
4. You should see the workflow running
5. Once complete, your site will be deployed to Firebase Hosting

## Troubleshooting

### If you get "Permission Denied" errors:

Go back to Google Cloud Console and add these additional roles to the service account:
- `Firebase Admin`
- `API Keys Admin`
- `Cloud Datastore User`

### If builds fail:

Check the workflow logs in GitHub Actions for specific errors. Common issues:
- Node version mismatch (update in workflow file)
- Missing environment variables
- Build command errors

## Alternative: Use Firebase Token (Simpler but less secure)

Instead of service account, you can use a CI token:

1. Run: `firebase login:ci`
2. Copy the token
3. Add to GitHub Secrets as `FIREBASE_TOKEN`
4. Update workflow to use token instead of service account

However, service accounts are recommended for production.

## Your Current Workflow Files

### firebase-hosting-merge.yml
Triggers on push to `main` branch and deploys to live site.

### firebase-hosting-pull-request.yml
Triggers on pull requests and creates preview channels.

Both are already configured correctly and just need the secret to be added!
