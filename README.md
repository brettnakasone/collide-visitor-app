# collide-visitor-app
This form allows potential Collide Team Members to select which days they will visit Collide on a Thursday evening. 
[README.md](https://github.com/user-attachments/files/26776835/README.md)
# Collide Visitor Sign-Up App

## What This Does
- Lets visitors pick 2 Thursday nights to check out Collide (6–9 PM)
- Sends email notification to brett@c4.church + youth@c4.church via Formspree
- Logs submissions to your Notion database automatically
- Password-protected admin panel to block/open specific Thursdays

---

## 🚀 Deploy to Netlify (Step by Step)

### Step 1 — Get the code onto your computer
Download this entire folder (collide-visitor-app) to your computer.

### Step 2 — Push to GitHub
1. Go to github.com and create a free account (or log in)
2. Click "New Repository" → name it `collide-visitor-app` → Create
3. Upload all the files from this folder to that repo

### Step 3 — Connect to Netlify
1. Go to netlify.com and log in
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub → select `collide-visitor-app`
4. Build settings will auto-detect from netlify.toml
5. Click "Deploy site"

### Step 4 — Set your custom URL
In Netlify: Site settings → Domain management → Options → Edit site name
Suggest: `collide-visits.netlify.app`

### Step 5 — Add Notion auto-logging (optional but recommended)
1. Go to notion.so/my-integrations
2. Create a new integration → name it "Collide Visitor App" → Submit
3. Copy the "Internal Integration Token"
4. Share your Notion database with the integration (open DB → ··· → Add connections)
5. In Netlify: Site settings → Environment variables → Add:
   Key: NOTION_TOKEN
   Value: (paste your token)
6. Redeploy the site

---

## 🔧 Admin Panel
- Visit your site URL
- Scroll to the very bottom → tap "admin"
- Password: CollideHi
- Toggle any Thursday to block or open it

---

## 📊 Notion Database
View all submissions here:
https://www.notion.so/f727bf80465b4d1db688538649e3af73

Status options to track each person:
- Submitted → Confirmed → Visited Once → Visited Twice → In Onboarding → Not Moving Forward

---

## 📎 PDFs
The confirmation screen links to:
- Visitor Policy (Google Drive)
- Dress Code (Google Drive)

To update these links, edit VISITOR_POLICY_URL and DRESS_CODE_URL in src/App.js

---

## Questions?
Brett: brett@c4.church
