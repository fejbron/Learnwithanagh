# Fixing NextAuth "Invalid URL" Error on Vercel

## Problem

You're seeing `TypeError: Invalid URL` errors on NextAuth routes (`/api/auth/*`). This happens when `NEXTAUTH_URL` is:
- Not set in Vercel
- Set to an empty string
- Set to a relative URL (like `/` or `localhost:3000`)
- Set to an invalid format

## Solution: Set NEXTAUTH_URL in Vercel

### Step 1: Get Your Vercel URL

Your Vercel deployment URL is:
```
https://learnwithanagh-cb5kk3ru3-edbrons-projects.vercel.app
```

Or if you have a custom domain, use that instead.

### Step 2: Set Environment Variable in Vercel

1. Go to **Vercel Dashboard** > Your Project
2. Click **Settings** > **Environment Variables**
3. Add or update `NEXTAUTH_URL`:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://learnwithanagh-cb5kk3ru3-edbrons-projects.vercel.app`
   - **Environment**: Select all (Production, Preview, Development)
4. Also add `AUTH_URL` with the same value:
   - **Key**: `AUTH_URL`
   - **Value**: `https://learnwithanagh-cb5kk3ru3-edbrons-projects.vercel.app`
   - **Environment**: Select all

**Important:**
- ✅ Must start with `https://` (not `http://`)
- ✅ Must be the full URL (not just the domain)
- ✅ No trailing slash
- ✅ Must match your actual Vercel deployment URL

### Step 3: Redeploy

After setting the environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Verify Fix

After redeploying:

1. Check Vercel logs - should no longer see "Invalid URL" errors
2. Visit your site - should load without 500 errors
3. Try logging in - authentication should work

## Common Mistakes

### ❌ Wrong Format
```
NEXTAUTH_URL=learnwithanagh.vercel.app          # Missing https://
NEXTAUTH_URL=http://learnwithanagh.vercel.app   # Should be https://
NEXTAUTH_URL=https://learnwithanagh.vercel.app/ # Trailing slash
NEXTAUTH_URL=localhost:3000                     # Relative URL
```

### ✅ Correct Format
```
NEXTAUTH_URL=https://learnwithanagh-cb5kk3ru3-edbrons-projects.vercel.app
```

## If You Have a Custom Domain

If you've set up a custom domain (e.g., `learnwithanagh.com`):

```
NEXTAUTH_URL=https://learnwithanagh.com
AUTH_URL=https://learnwithanagh.com
```

## Environment Variables Checklist

Make sure you have all these set in Vercel:

- [ ] `DATABASE_URL` - Your Supabase connection string
- [ ] `NEXTAUTH_SECRET` - Generated secret (32+ characters)
- [ ] `NEXTAUTH_URL` - Your Vercel deployment URL (https://...)
- [ ] `AUTH_URL` - Same as NEXTAUTH_URL

## Testing Locally

For local development, create a `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret
DATABASE_URL=your-local-database-url
```

## Still Having Issues?

1. **Check Vercel logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Check deployment** - make sure you redeployed after setting variables
4. **Test the URL** - make sure it's accessible in your browser

The updated code now provides better error messages if `NEXTAUTH_URL` is invalid, which will help debug any remaining issues.
