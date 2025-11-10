# Brevo Email Setup - Fix Guide

## Current Error
```
Permission denied while using the Eventarc Service Agent
```

## Quick Fix Steps

### Option 1: Wait (Recommended First)
1. Wait 5-10 minutes for Firebase to propagate permissions
2. Try installing the extension again

### Option 2: Manual Permission Grant

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/iam-admin/iam?project=theluxmining-91ab1

2. **Find the Eventarc Service Agent:**
   - Look for: `service-28140566611@gcp-sa-eventarc.iam.gserviceaccount.com`
   - Or search for "Eventarc Service Agent"

3. **Grant Required Role:**
   - Click "Edit" (pencil icon) on the Eventarc Service Agent
   - Add role: **"Eventarc Service Agent"**
   - Click "Save"

4. **Retry Extension Installation:**
   - Go back to Firebase Console
   - Extensions > Trigger Email from Firestore
   - Click "Retry" or reinstall

### Option 3: Enable APIs Manually

Run these commands in Google Cloud Shell or locally with gcloud CLI:

```bash
# Set your project
gcloud config set project theluxmining-91ab1

# Enable required APIs
gcloud services enable eventarc.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudscheduler.googleapis.com

# Grant Eventarc Service Agent role
gcloud projects add-iam-policy-binding theluxmining-91ab1 \
  --member="serviceAccount:service-28140566611@gcp-sa-eventarc.iam.gserviceaccount.com" \
  --role="roles/eventarc.serviceAgent"
```

### Option 4: Uninstall & Reinstall Extension

1. **Uninstall the extension:**
   - Firebase Console > Extensions
   - Find "Trigger Email from Firestore"
   - Click "Uninstall"

2. **Wait 2-3 minutes**

3. **Reinstall the extension:**
   - Extensions > Explore Extensions
   - Find "Trigger Email from Firestore"
   - Click "Install"
   - Configure with Brevo SMTP:
     - SMTP server: `smtp-relay.brevo.com`
     - SMTP port: `587`
     - SMTP username: Your Brevo login email
     - SMTP password: Your Brevo SMTP password (from Brevo dashboard)
     - Default FROM: `noreply@theluxmining.com`

## Brevo SMTP Configuration

### Get Brevo SMTP Credentials:

1. **Login to Brevo:** https://app.brevo.com/
2. **Go to SMTP & API:** Settings > SMTP & API
3. **Create SMTP Key:**
   - Click "Generate a new SMTP key"
   - Copy the generated password (you can't see it again!)
4. **Use these settings:**
   ```
   SMTP Host: smtp-relay.brevo.com
   SMTP Port: 587
   Username: Your Brevo login email
   Password: The SMTP key you just generated
   ```

## Verify Email Collection

After installation, test by creating a document in the `mail` collection:

```javascript
// In Firestore Console
Collection: mail
Document: (auto-generated ID)
Fields:
{
  "to": ["your-email@example.com"],
  "message": {
    "subject": "Test Email",
    "html": "<p>This is a test email from TheLuxMining</p>"
  }
}
```

The extension should process it automatically and send the email.

## Alternative: Direct Brevo API Integration

If Firebase extensions continue to fail, we can implement direct Brevo API calls from Cloud Functions instead.

Let me know if you want to go that route!
