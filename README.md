# Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Users can sign in with Google OAuth, add bookmarks, and see updates in real-time across multiple browser tabs.

## Features

- Google OAuth authentication (no email/password required)
- Add bookmarks with URL and title
- Private bookmarks per user
- Real-time updates using Supabase Realtime
- Delete bookmarks
- Responsive design with Tailwind CSS

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Authentication, Database, Realtime)
- **Tailwind CSS** (Styling)
- **TypeScript**

## Prerequisites

Before you begin, you need:

1. A Supabase account (free tier works)
2. A Google Cloud project with OAuth credentials
3. Node.js 18+ installed
4. A Vercel account for deployment

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to Settings > API and copy your:
   - Project URL
   - Anon public key

### 2. Set Up Database

1. In your Supabase project, go to SQL Editor (found in the left sidebar)
2. Click "New Query"
3. Copy and paste the contents of `supabase-setup.sql` from this repository, or use the SQL below
4. Click "Run" to execute the query

The SQL creates:
- A `bookmarks` table to store user bookmarks
- Row Level Security (RLS) to ensure users can only see their own bookmarks
- Policies that allow users to view, insert, and delete only their own bookmarks

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Enable Realtime

1. In Supabase, go to Database > Replication
2. Find the `bookmarks` table
3. Toggle the switch to enable replication

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click the project dropdown at the top and create a new project (or select an existing one)
4. Give your project a name and click "Create"
5. Once the project is created, go to "APIs & Services" > "Library" in the left sidebar
6. Search for "Google+ API" and click on it, then click "Enable"
7. Go to "APIs & Services" > "Credentials" in the left sidebar
8. Click "Create Credentials" > "OAuth 2.0 Client ID"
9. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields (App name, User support email, Developer contact)
   - Click "Save and Continue" through the steps
10. Back in Credentials, set application type to "Web application"
11. Give it a name (e.g., "Smart Bookmark App")
12. Add authorized redirect URIs:
    - For local development: `http://localhost:3000/auth/callback`
    - For production: `https://your-vercel-url.vercel.app/auth/callback` (you'll add this after deployment)
13. Click "Create"
14. Copy your Client ID and Client Secret (you'll need these in the next step)

### 5. Configure Supabase Auth

1. In Supabase, go to Authentication > Providers (found in the left sidebar)
2. Scroll down to find "Google" in the list of providers
3. Toggle the "Enable Google provider" switch
4. Paste your Google Client ID (from step 4) into the "Client ID (for OAuth)" field
5. Paste your Google Client Secret (from step 4) into the "Client Secret (for OAuth)" field
6. The redirect URL should already be filled in automatically. It should look like: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Click "Save" at the bottom

### 6. Local Development Setup

1. Clone this repository to your computer:
   ```bash
   git clone https://github.com/your-username/smart-bookmark.git
   cd smart-bookmark
   ```

2. Install dependencies (this downloads all the packages the app needs):
   ```bash
   npm install
   ```
   Wait for this to finish - it may take a minute or two.

3. Create a `.env.local` file in the root directory (same folder as `package.json`):
   - On Windows: You can create this file in your code editor or use Notepad
   - On Mac/Linux: You can use `touch .env.local` in the terminal
   
   Add these lines to the file (replace with your actual values from Supabase):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   
   To find your Supabase URL and key:
   - Go to your Supabase project
   - Click Settings (gear icon) > API
   - Copy "Project URL" and paste it as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Run the development server:
   ```bash
   npm run dev
   ```
   You should see a message like "Ready on http://localhost:3000"

5. Open your browser and go to [http://localhost:3000](http://localhost:3000)
   
   You should see the sign-in page. Try signing in with Google!

### 7. Deploy to Vercel

1. Push your code to GitHub:
   - Create a new repository on GitHub
   - Follow GitHub's instructions to push your code
   - Make sure to NOT commit your `.env.local` file (it's already in `.gitignore`)

2. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account

3. Click "Add New" > "Project"

4. Import your GitHub repository (the one you just pushed)

5. Vercel will detect it's a Next.js project automatically. Click "Deploy"

6. While it's deploying, go to "Settings" > "Environment Variables" and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL (will be something like `https://your-app-name.vercel.app`)

7. After adding environment variables, go to "Deployments" and click the three dots on the latest deployment > "Redeploy" to apply the new environment variables

8. Once deployed, update your Google OAuth redirect URI:
   - Go back to Google Cloud Console > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add your Vercel URL: `https://your-app-name.vercel.app/auth/callback`
   - Save

9. Your app is now live! Visit your Vercel URL to test it.

## Problems Encountered and Solutions

### Problem 1: Real-time Updates Not Working

**Issue:** When adding a bookmark in one tab, it didn't appear in another tab automatically.

**Solution:** I needed to enable replication on the `bookmarks` table in Supabase. Realtime requires explicit replication to be enabled for each table. After enabling it in the Database > Replication section, the real-time updates started working correctly.

### Problem 2: Authentication Redirect Loop

**Issue:** After signing in with Google, users were stuck in a redirect loop between the auth page and home page.

**Solution:** The issue was with the callback route. I needed to use `exchangeCodeForSession` instead of just checking the code. Also, I had to ensure the redirect URL in Supabase matched exactly with the callback route path.

### Problem 3: Row Level Security (RLS) Blocking Queries

**Issue:** After creating the bookmarks table, users couldn't see or add bookmarks even though they were logged in.

**Solution:** I needed to create RLS policies that allow users to only access their own bookmarks. The policies check `auth.uid() = user_id` to ensure users can only see, insert, and delete their own bookmarks.

### Problem 4: CORS Errors with Supabase

**Issue:** Getting CORS errors when trying to connect to Supabase from the browser.

**Solution:** This was resolved by using the `@supabase/ssr` package which handles cookies and sessions properly for Next.js. The package provides separate client and server utilities that work correctly with Next.js App Router.

### Problem 5: Environment Variables Not Loading

**Issue:** Environment variables weren't being read in the client components.

**Solution:** In Next.js, environment variables need to be prefixed with `NEXT_PUBLIC_` to be accessible in the browser. I made sure all Supabase-related environment variables had this prefix.

### Problem 6: Sign Out Not Working

**Issue:** The sign out button wasn't redirecting users back to the auth page.

**Solution:** I needed to create a proper API route for sign out that calls `supabase.auth.signOut()` and then redirects. Also, I had to set the `NEXT_PUBLIC_SITE_URL` environment variable so the redirect URL was correct.

### Problem 7: Real-time Subscription Not Cleaning Up

**Issue:** Memory leaks and multiple subscriptions when navigating between pages.

**Solution:** I added a cleanup function in the `useEffect` hook that removes the channel subscription when the component unmounts. This prevents memory leaks and duplicate subscriptions.

## Project Structure

```
smart-bookmark/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts
│   │   ├── signout/
│   │   │   └── route.ts
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── BookmarkManager.tsx
│   └── SignInButton.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── middleware.ts
│       └── server.ts
├── middleware.ts
├── package.json
├── tailwind.config.ts
├── supabase-setup.sql
└── README.md
```

## License

MIT

