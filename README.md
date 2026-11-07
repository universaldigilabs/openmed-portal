# OpenMed — Zero-Cost Clinical Intake & Care Coordination Portal

An open-source, full-stack medical intake and clinical triage coordination portal built with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security & Storage)**. Designed to run completely on **free tiers** (Supabase Free + Vercel Hobby) at \$0 hosting and maintenance costs.

---

## 🏗️ Architecture & Requirements Breakdown

| Component | Technology | Free Tier Provision | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) & npm | Local / Free | Core runtime environment and build engine |
| **Backend & DB** | Supabase PostgreSQL | 500 MB DB / 50,000 MAU | Relational database, RLS policies, automated triggers |
| **Document Storage**| Supabase Storage | 1 GB storage / 2 GB egress | Private `patient-docs` bucket for labs, scans, and PDFs |
| **Web Framework** | Next.js 16 (React 19) | Open Source (MIT) | Server-side APIs, SSR, and responsive client portal |
| **Styling** | Tailwind CSS v4 & Lucide | Open Source (MIT) | Clinical UI design system & accessible form elements |
| **Hosting & CI/CD** | Vercel (Hobby Tier) | Free SSL, Unlimited Deploys | Zero-config continuous deployment from GitHub |
| **Mobile App** | Capacitor | Open Source | Packages the web app into native iOS/Android APK/IPA |

---

## 🚀 Quick Setup & Deployment Guide

### 1. Database & Storage Setup (Supabase)

1. Create a free project at [database.new](https://database.new) (Supabase).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Paste and run the complete schema script located at:
   ```
   supabase/schema.sql
   ```
   This automatically provisions:
   - `public.medical_cases`: Stores intake forms with automated human-readable case IDs (`MC-1001`).
   - `public.notification_log`: Automated audit trail for email/SMS patient notifications.
   - **Indexes**: Optimized queries on `status`, `urgency_level`, `created_at`, and `case_id`.
   - **Row Level Security (RLS)**: Anonymous public users can only `INSERT` cases. Public access to read cases is blocked.
   - **Storage Bucket `patient-docs`**: Configured with private permissions. Public users can upload files; only authenticated staff or server credentials can access documents.

4. Retrieve your Supabase API keys from **Project Settings ➔ API**:
   - `Project URL`: `https://<project-ref>.supabase.co`
   - `anon public key`: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key`: `SUPABASE_SERVICE_ROLE_KEY` *(Never expose this in client-side code)*

---

### 2. Configure Local Environment Variables

Create or update your `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
COORDINATOR_ACCESS_CODE=coordinator2026
```

---

### 3. Run Locally

```bash
# Install dependencies (already pre-installed)
npm install

# Start development server
npm run dev
```

Visit:
- **Landing Portal**: `http://localhost:3000`
- **Patient Intake Form**: `http://localhost:3000/intake`
- **Coordinator Triage Dashboard**: `http://localhost:3000/coordinator`

---

### 4. Deploy to GitHub & Vercel (100% Free)

#### Step A: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: OpenMed medical intake and coordinator portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

#### Step B: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New Project"** and import your repository.
3. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. Vercel will build the Next.js app and provide an active HTTPS domain (e.g. `https://your-app.vercel.app`).

---

### 5. Packaging into Mobile App via Capacitor (Optional)

To distribute to mobile app stores without building separate native apps:

```bash
# 1. Install Capacitor CLI and Core
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 2. Initialize Capacitor with your app ID
npx cap init "Medical Portal" com.antigravity.medicalportal --web-dir out

# 3. Add Android or iOS platforms
npx cap add android
npx cap add ios

# 4. Open in Android Studio / Xcode
npx cap open android
```

---

## 🔒 Security & Privacy Implementation

- **Row Level Security (RLS)**: Anonymous web visitors submitting intake forms cannot read other patients' records or view database tables.
- **Private Storage Bucket**: Medical documents are stored in a private bucket (`patient-docs`). Files cannot be accessed by guessing URLs.
- **Signed URL Generator**: Staff and coordinators view attachments through the `/api/documents/signed-url` endpoint, which generates short-lived (60-minute) signed Supabase storage tokens.
- **Audit Logging**: Any status transition or case review updates write directly to `notification_log` for compliance and auditability.
