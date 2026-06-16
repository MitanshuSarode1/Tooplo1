# Vercel Deployment Guide - Tooplotech1

## Step 1: Import Repository (In Progress)
You're currently authorizing Vercel to access your GitHub account.

## Step 2: Select Your Repository
When prompted, select: **MitanshuSarode1/Tooplo1**

## Step 3: Project Configuration
Vercel will auto-detect Next.js. Keep default settings:
- **Framework Preset:** Next.js ✓
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)

## Step 4: Environment Variables ⭐ IMPORTANT
Before deploying, add these environment variables in Vercel Dashboard:

### From your .env.local file:
```
NEXT_PUBLIC_SUPABASE_URL=https://imyjrmllolmbjmeaexbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tC72WKejd7juGQZOZPJ0rw_fKJKpeV5
```

These variables are:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key (safe to expose)

## Step 5: Deploy!
Click "Deploy" and wait for the build to complete.

## After Deployment:
✓ Your app will be live at: `https://[your-project-name].vercel.app`
✓ Every push to the `main` branch will auto-deploy
✓ You can view deployment details in Vercel Dashboard

## Troubleshooting:
If deployment fails:
1. Check the build logs in Vercel Dashboard
2. Ensure all environment variables are set
3. Verify package.json dependencies are correct
4. Check that .env.local is in .gitignore (it is ✓)

## Important Security Note:
⚠️ The GitHub Personal Access Token you shared should be rotated:
1. Go to github.com/settings/tokens
2. Delete the token previously generated
3. Create a new one if needed for future use

