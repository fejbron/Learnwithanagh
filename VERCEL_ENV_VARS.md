# Vercel Environment Variables Quick Reference

Copy these into your Vercel project settings (Settings > Environment Variables):

## Required Environment Variables

```env
# Database Connection (choose one)
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public&sslmode=require
# OR
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require

# NextAuth Authentication
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
AUTH_URL=https://your-app-name.vercel.app
```

## How to Get Each Value

### DATABASE_URL or SUPABASE_DATABASE_URL

**If using Supabase:**
1. Go to Supabase Dashboard > Settings > Database
2. Find "Connection string" section
3. Select "URI" mode
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

**If using other PostgreSQL providers:**
- Check your provider's dashboard for the connection string
- Format: `postgresql://user:password@host:port/database?schema=public&sslmode=require`

### NEXTAUTH_SECRET

Generate a random secret (32+ characters):

**Option 1: Using OpenSSL (Terminal)**
```bash
openssl rand -base64 32
```

**Option 2: Online Generator**
Visit: https://generate-secret.vercel.app/32

**Option 3: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### NEXTAUTH_URL and AUTH_URL

1. **First deployment**: Use placeholder `https://your-app-name.vercel.app`
2. **After first deploy**: 
   - Go to Vercel Dashboard > Your Project
   - Copy the deployment URL (e.g., `https://learn-with-ana-gh.vercel.app`)
   - Update both `NEXTAUTH_URL` and `AUTH_URL` with this exact URL
   - **Important**: No trailing slash!

## Optional: Supabase Client-Side Variables

If you're using Supabase client-side features:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard > Settings > API

---

## Quick Setup Checklist

- [ ] Get database connection string
- [ ] Generate `NEXTAUTH_SECRET` (32+ characters)
- [ ] Set `NEXTAUTH_URL` to your Vercel URL (after first deploy)
- [ ] Set `AUTH_URL` same as `NEXTAUTH_URL`
- [ ] Add all variables in Vercel Dashboard
- [ ] Redeploy after adding variables

---

## After First Deployment

1. Copy your Vercel deployment URL
2. Update `NEXTAUTH_URL` and `AUTH_URL` in Vercel
3. Click "Redeploy" to apply changes
