# Fixing HTTP 500 Error on Vercel

## Problem

Your Vercel deployment is showing HTTP 500 errors. This is almost certainly a database connection issue.

## Quick Fix: Use Connection Pooler URL

### Why?

Vercel serverless functions have issues with:
- IPv6 addresses (Supabase direct connections often resolve to IPv6)
- Direct connections (port 5432) on serverless platforms
- Connection limits on direct connections

**Solution**: Use Supabase's connection pooler (port 6543) which is designed for serverless.

### Steps

1. **Get Connection Pooler URL from Supabase:**
   - Go to Supabase Dashboard
   - Settings > Database
   - "Connection string" section
   - Click **"Connection pooling"** tab
   - Select **"Transaction mode"**
   - Copy the connection string

2. **Update Vercel Environment Variable:**
   - Vercel Dashboard > Your Project > Settings > Environment Variables
   - Find `DATABASE_URL`
   - Replace it with the **connection pooler URL** (port 6543)
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require`

3. **Redeploy:**
   - Deployments tab
   - Click ⋯ on latest deployment
   - Click "Redeploy"

## Check Vercel Logs

To see the exact error:

1. Go to Vercel Dashboard > Your Project
2. Click on the latest deployment
3. Click "Functions" tab
4. Click on any function that failed
5. Check "Logs" tab

You'll likely see:
- `ENETUNREACH` errors
- IPv6 address connection failures
- Database connection timeouts

## Verify Fix

After updating to connection pooler URL and redeploying:

1. Check Vercel logs - should see successful connections
2. Visit your site - should load without 500 errors
3. Test login - should work if database is set up

## Common Issues

### Still getting 500 errors?

1. **Check environment variable is set correctly:**
   - Must use port **6543** (not 5432)
   - Must include `?sslmode=require`
   - Must have correct password

2. **Check database schema is set up:**
   - Run `npm run supabase:setup` pointing to production DB
   - Or manually create tables in Supabase SQL Editor

3. **Check database is seeded:**
   - Run `npm run db:seed` pointing to production DB
   - Or manually create admin user

4. **Check Supabase project is active:**
   - Ensure project isn't paused
   - Check project status in Supabase dashboard

## Connection Pooler vs Direct Connection

| Feature | Direct (5432) | Pooler (6543) |
|--------|--------------|---------------|
| Vercel Compatibility | ❌ IPv6 issues | ✅ Works perfectly |
| Serverless Optimized | ❌ No | ✅ Yes |
| Connection Limits | Lower | Higher |
| Recommended for Vercel | ❌ No | ✅ Yes |

## Need Help?

If you're still having issues:

1. Check Vercel function logs for specific error messages
2. Verify `DATABASE_URL` is set correctly in Vercel
3. Test connection string locally with `psql` or `node`
4. Ensure Supabase project is active and accessible
