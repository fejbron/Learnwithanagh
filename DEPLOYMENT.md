# Deployment Guide

## Why Not GitHub Pages?

GitHub Pages only serves **static files** (HTML, CSS, JavaScript). Your application requires:
- ✅ **Node.js server** for API routes (`/api/*`)
- ✅ **Server-side rendering** (SSR)
- ✅ **Database connections** (Supabase PostgreSQL)
- ✅ **NextAuth.js** server-side authentication

**GitHub Pages cannot run these features.** You need a platform that supports Node.js.

## Recommended: Vercel (Best for Next.js)

Vercel is made by the creators of Next.js and provides:
- ✅ Zero-configuration deployment
- ✅ Automatic HTTPS
- ✅ Serverless functions for API routes
- ✅ Environment variable management
- ✅ Free tier with generous limits
- ✅ Automatic deployments from GitHub

## Deploy to Vercel

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Create a `.gitignore` file** (if not exists):
   ```
   .next
   node_modules
   .env
   .env.local
   .env*.local
   *.log
   .DS_Store
   ```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. **Add Environment Variables:**
   - `DATABASE_URL` or `SUPABASE_DATABASE_URL` - Your Supabase connection string
   - `NEXTAUTH_SECRET` - Your secret key (generate one: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `AUTH_URL` - Same as NEXTAUTH_URL
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Your Supabase anon key
6. Click **"Deploy"**

#### Option B: Via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add environment variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   # ... add all other env vars
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Step 3: Configure Supabase

1. **Update Supabase connection settings:**
   - Go to Supabase Dashboard > Settings > Database
   - Add your Vercel deployment URL to allowed hosts (if required)
   - Ensure connection pooling is enabled

2. **Update NEXTAUTH_URL:**
   - After deployment, update `NEXTAUTH_URL` in Vercel to your actual domain
   - Redeploy if needed

## Alternative Platforms

### Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in Netlify dashboard

**Note:** Netlify requires additional configuration for Next.js API routes.

### Railway

1. Sign up at [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables
4. Railway auto-detects Next.js and deploys

### Render

1. Sign up at [render.com](https://render.com)
2. Create new Web Service from GitHub
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test login functionality
- [ ] Test API routes (products, orders, etc.)
- [ ] Verify database connection
- [ ] Check that images upload correctly
- [ ] Test barcode scanning (if using camera)
- [ ] Update any hardcoded URLs to use environment variables
- [ ] Set up custom domain (optional)

## Troubleshooting

### "Database connection failed"
- Check that `SUPABASE_DATABASE_URL` is set correctly
- Verify Supabase allows connections from your deployment URL
- Check SSL settings

### "NEXTAUTH_SECRET missing"
- Ensure `NEXTAUTH_SECRET` is set in environment variables
- Regenerate if needed: `openssl rand -base64 32`

### "API routes return 404"
- Ensure you're using a platform that supports serverless functions
- Check that API routes are in the `app/api` directory

### "Static files not loading"
- Clear `.next` cache and rebuild
- Check that `next.config.js` is configured correctly

## Environment Variables Reference

```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
AUTH_URL=https://your-app.vercel.app

# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key-here
```

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)

