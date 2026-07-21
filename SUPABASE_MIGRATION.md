# PhishLens AI - Supabase SaaS Conversion Guide

## What's Changed

The PhishLens AI app has been converted from a frontend-only demo into a **production-ready SaaS application** with real Supabase authentication and data persistence.

### Key Features

✅ **Real Authentication** - Email/password signup and login via Supabase Auth  
✅ **User Profiles** - Automatically created on signup, stores email and join date  
✅ **Real Database** - All email analyses saved to Supabase `email_analysis` table  
✅ **Row-Level Security** - Users can only access their own data  
✅ **Real Dashboard** - Shows user's actual scan history and statistics  
✅ **Realtime Updates** - Dashboard updates automatically when new analyses are saved  
✅ **Protected Routes** - Only authenticated users can access the dashboard and analyzer  
✅ **User Session** - Sessions persist across page refreshes  

---

## Quick Start (5 minutes)

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **"New Project"** 
3. Choose your region, set a password, and click **"Create new project"**
4. Wait ~2 minutes for your project to initialize

### Step 2: Run the Database Setup

1. In your Supabase dashboard, go to **SQL Editor** → **New Query**
2. Open the file: `SUPABASE_SETUP.sql` in this repo
3. Copy **ALL** the SQL code and paste it into the SQL Editor
4. Click **"Run"** (▶ button)
5. You should see ✅ messages indicating success

**What this does:**
- Creates a `profiles` table (linked to auth.users)
- Creates an `email_analysis` table (stores email scan results)
- Sets up Row-Level Security so users can only see their own data
- Adds a trigger to auto-create a profile when a user signs up

### Step 3: Get Your Supabase Keys

1. In your Supabase dashboard, go to **Settings** → **API** → **Project URL**
2. Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Under **Project API keys**, copy the **anon public key**

### Step 4: Set Up Environment Variables

1. In your project root, create a file named `.env.local`
2. Add these two lines, replacing with your actual Supabase URL and key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Do not commit `.env.local` to git.** The `.gitignore` should already exclude it.

### Step 5: Run the Dev Server

```bash
npm install  # (if you haven't already)
npm run dev
```

The app should now be running with full Supabase authentication!

---

## Testing the Integration

### Test 1: Sign Up & Create Account

1. Go to http://localhost:5173/signup
2. Fill in:
   - **Full name**: Jane Doe
   - **Email**: jane.doe@example.com
   - **Password**: Password123!
   - **Confirm**: Password123!
3. Click **Signup**
4. You should be redirected to `/dashboard`
5. Check Supabase: **SQL Editor** → run `SELECT * FROM auth.users;` to see your account
6. Run `SELECT * FROM profiles;` to see your profile was auto-created ✅

### Test 2: Login & Session Persistence

1. Logout by clicking the **Logout** button in the navbar
2. You should be redirected to `/login`
3. Try to access `/dashboard` directly - you'll be redirected to `/login` (protected route) ✅
4. Login with your email and password
5. Refresh the page - **you stay logged in** ✅ (session persists)
6. Your email should appear in the top navbar

### Test 3: Analyze Email & Save to Database

1. Click **Try Analyzer** in the navbar
2. Paste this suspicious email into the text area:

```
From: security@paypa1-support.com
Subject: URGENT ACTION REQUIRED - Account Suspension

Dear Customer,

Your account has been flagged for unusual activity. You must verify your details immediately
or your account will be permanently suspended within 24 hours.

Click here: http://fake-paypal-login.com/verify

Failure to respond will result in account closure.

Thank you,
PayPal Security Team
```

3. Click **"Analyze Email"**
4. You should see the analysis results with risk score, reasons, and recommendations
5. **Check Supabase**: Go to SQL Editor and run:

```sql
SELECT subject, sender, risk_score, level, created_at FROM email_analysis;
```

You should see your scan saved! ✅

### Test 4: Dashboard Shows Real Data

1. Go to `/dashboard`
2. You should see:
   - **Your email address** in the profile card
   - **Member since**: your signup date
   - **Total emails scanned**: 1 (from Test 3)
   - **Recent analysis history**: your analyzed email listed

3. Analyze another email from the dashboard
4. **Without refreshing**, your dashboard should update automatically ✅ (realtime)

### Test 5: Multiple Users

1. Logout
2. Sign up with a different email
3. Analyze a few emails as this new user
4. Go back to the first user and login
5. You should **only see YOUR scans**, not the other user's scans ✅ (RLS working)

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts           # Supabase client setup
│   ├── database.ts            # Database types (profiles, email_analysis)
│   ├── parser.ts             # Email parsing logic (unchanged)
│   ├── detector.ts           # Email analysis AI (unchanged)
│   └── utils.ts              # Utilities
├── hooks/
│   └── useAuth.ts            # Auth context + provider (NEW)
├── components/
│   ├── ProtectedRoute.tsx     # Route guard for dashboard (NEW)
│   ├── shared/
│   │   ├── Navbar.tsx        # Updated - shows user email, logout
│   │   ├── Layout.tsx        # (unchanged)
│   │   └── ...
│   └── ui/                   # Shadcn UI components
├── pages/
│   ├── Analyzer.tsx          # Updated - saves to Supabase
│   ├── Dashboard.tsx         # Completely new - real data from DB
│   ├── Login.tsx             # Updated - Supabase auth
│   ├── Signup.tsx            # Updated - Supabase auth
│   ├── Results.tsx           # Updated - shows saved analysis timestamp
│   ├── Landing.tsx           # (unchanged)
│   ├── About.tsx             # (unchanged)
│   ├── Privacy.tsx           # (unchanged)
│   ├── Terms.tsx             # (unchanged)
│   └── Contact.tsx           # (unchanged)
├── App.tsx                   # Updated - AuthProvider wrapper, protected dashboard
└── main.tsx                  # (unchanged)
```

---

## New Files Created

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client initialization with TypeScript types |
| `src/lib/database.ts` | TypeScript interfaces for Database schema |
| `src/hooks/useAuth.ts` | Auth context provider + `useAuth()` hook |
| `src/components/ProtectedRoute.tsx` | Route guard that redirects unauthenticated users to login |
| `.env.example` | Template for environment variables |
| `SUPABASE_SETUP.sql` | SQL commands to initialize your Supabase database |

---

## Modified Files

| File | Changes |
|------|---------|
| `src/App.tsx` | Added `AuthProvider` wrapper, protected dashboard route with `ProtectedRoute` |
| `src/pages/Login.tsx` | Replaced localStorage with Supabase `signIn()` |
| `src/pages/Signup.tsx` | Replaced localStorage with Supabase `signUp()`, auto-create profile |
| `src/pages/Analyzer.tsx` | Added Supabase insert for email_analysis, redirect to login if not authenticated |
| `src/pages/Dashboard.tsx` | Complete rewrite - fetches user's real profile and analyses from Supabase, realtime updates |
| `src/pages/Results.tsx` | Shows saved analysis timestamp from Supabase |
| `src/components/shared/Navbar.tsx` | Shows logged-in user's email, logout button, profile display |
| `src/lib/detector.ts` | Type alignment for AnalysisResult (score, riskLevel properties) |

---

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Project URL (from Dashboard -> Settings -> API)
VITE_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase Anon Key (from Dashboard -> Settings -> API)
VITE_SUPABASE_ANON_KEY=xxxxxxxxxx
```

**Never commit `.env.local` to version control.**

---

## Database Schema

### `profiles` table
```sql
- id (uuid, PK) - references auth.users
- email (text, unique) - user's email
- created_at (timestamp) - account creation date
```

### `email_analysis` table
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- sender (text) - from email header
- subject (text) - email subject
- body (text) - email body
- risk_score (integer 0-100) - analysis score
- level (text) - "low" | "medium" | "high"
- reasons (jsonb) - array of risk factors
- recommendations (jsonb) - array of recommendations
- created_at (timestamp) - when analysis was saved
```

---

## Row-Level Security (RLS)

All tables have RLS enabled:

✅ **Users can:**
- View only their own profile and analyses
- Insert new analyses only under their own user_id

❌ **Users cannot:**
- Access other users' data
- Modify other users' analyses
- Delete data (not allowed by policy)

---

## Realtime Updates

The dashboard automatically subscribes to new email_analysis inserts:

```typescript
supabase.channel('email-analysis')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'email_analysis' 
  }, () => {
    fetchDashboard() // Refresh stats
  })
  .subscribe()
```

When you analyze an email as User A, and User A has the dashboard open in another tab, it updates **without a page refresh**.

---

## Security Notes

🔒 **Session Persistence**: Supabase Auth handles session tokens automatically. Sessions persist across page refreshes and survive browser restarts for up to 30 days (configurable).

🔒 **RLS Enforcement**: All queries are scoped to the authenticated user via Row-Level Security policies in Supabase.

🔒 **Anon Key**: The `ANON_KEY` is intentionally public (it's in your frontend). Users **cannot** use it to bypass RLS. Authentication is required to access the RLS-protected tables.

⚠️ **Production**: Before going live:
- Enable email verification on sign-ups
- Set up email templates for password resets
- Configure authorized redirect URLs in Supabase dashboard
- Use a stronger password policy in auth settings

---

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` is in your project root
- Restart the dev server after adding `.env.local`
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct

### "User can't login after signup"
- Make sure the trigger in `SUPABASE_SETUP.sql` ran successfully
- Check that the profile was created: `SELECT * FROM profiles;` in Supabase SQL Editor

### "Analyses not showing on dashboard"
- Verify RLS policies are enabled: go to **Authentication** → **Policies** in Supabase
- Check that `user_id` in the insert matches the authenticated user's ID

### "Can access other users' data"
- RLS policies are not enabled or not set up correctly
- Run the SUPABASE_SETUP.sql again to ensure all policies are created

---

## Packages Added

No new npm packages were added. The project already had `@supabase/supabase-js` installed.

---

## Next Steps

1. **Deploy to Production**:
   - Push to GitHub/GitLab
   - Deploy with Vercel, Netlify, or similar
   - Add environment variables to your hosting platform

2. **Enable Email Verification**:
   - In Supabase dashboard → Authentication → Providers → Email
   - Enable "Confirm email"

3. **Custom Email Templates**:
   - In Supabase dashboard → Authentication → Email Templates
   - Customize confirmation and password reset emails with your branding

4. **Monitoring**:
   - Set up error logging (Sentry, LogRocket, etc.)
   - Monitor Supabase usage in the dashboard

---

## Support

If you run into issues:
1. Check the browser console for error messages
2. Look at Supabase logs: Dashboard → Logs
3. Verify all SQL from `SUPABASE_SETUP.sql` ran successfully
4. Double-check environment variables in `.env.local`

---

**Your PhishLens AI app is now production-ready! 🚀**
