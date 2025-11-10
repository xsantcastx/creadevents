# Enable Eventarc API - Step by Step

## The service account doesn't exist because the API isn't enabled yet.

### Steps to Fix:

1. **Go to Google Cloud Console API Library:**
   https://console.cloud.google.com/apis/library/eventarc.googleapis.com?project=theluxmining-91ab1

2. **Click "ENABLE"** button

3. **Wait 1-2 minutes** for the API to fully activate

4. **Enable Cloud Functions v2 API as well:**
   https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=theluxmining-91ab1
   - Click "ENABLE"

5. **Enable Cloud Build API:**
   https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=theluxmining-91ab1
   - Click "ENABLE"

6. **After enabling all APIs, go back to Firebase:**
   https://console.firebase.google.com/project/theluxmining-91ab1/extensions

7. **Retry installing the "Trigger Email from Firestore" extension**

---

## Alternative: Use Cloud Shell

If you prefer using commands, click the Cloud Shell icon in Google Cloud Console (top right) and run:

```bash
# Enable required APIs
gcloud services enable eventarc.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudscheduler.googleapis.com

# Wait 30 seconds
sleep 30

# Verify APIs are enabled
gcloud services list --enabled | grep -E "eventarc|cloudfunctions|cloudbuild"
```

Then retry the Firebase extension installation.

---

## What to Configure in the Extension:

When the extension installs successfully, configure:

- **SMTP connection URI:** `smtps://YOUR_BREVO_EMAIL:YOUR_BREVO_SMTP_KEY@smtp-relay.brevo.com:465`
  
  OR use individual fields:
  - SMTP server: `smtp-relay.brevo.com`
  - SMTP port: `587`
  - SMTP username: Your Brevo account email
  - SMTP password: Your Brevo SMTP key (get from https://app.brevo.com/)

- **Default FROM address:** `noreply@theluxmining.com`
- **Email documents collection:** `mail`
- **Collection location:** `nam5` (or your preferred region)

After installation completes (takes 5-10 minutes), the service account will be created automatically.
