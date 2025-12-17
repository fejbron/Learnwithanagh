# GitHub Pages Deployment Guide

## ⚠️ Important: GitHub Pages Limitations

**GitHub Pages only serves static files** (HTML, CSS, JavaScript). Your Next.js application requires:

- ❌ **API Routes** (`/api/*`) - Won't work on GitHub Pages
- ❌ **Server-Side Rendering (SSR)** - Won't work on GitHub Pages  
- ❌ **NextAuth.js Authentication** - Requires server-side code
- ❌ **Database Connections** - Requires server environment
- ❌ **Middleware** - Requires Node.js runtime

**Your app will NOT work on GitHub Pages as-is.**

---

## ✅ Recommended Solution: Deploy to Vercel

Vercel is made by the creators of Next.js and is the best platform for your app. It's **free** and provides:

- ✅ Zero-configuration deployment
- ✅ Automatic HTTPS
- ✅ Serverless functions for API routes
- ✅ Environment variable management
- ✅ Automatic deployments from GitHub
- ✅ Free tier with generous limits

### Quick Setup (5 minutes):

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign up/login with GitHub

3. **Click "Add New Project"** and import your repository

4. **Vercel will auto-detect Next.js** - no configuration needed!

5. **Add Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` or `SUPABASE_DATABASE_URL`
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (will be your Vercel URL)
   - `AUTH_URL` (same as NEXTAUTH_URL)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

6. **Click "Deploy"** - Done! 🎉

Your app will be live at `https://your-app.vercel.app`

---

## 🔄 Alternative: GitHub Pages with Static Export (NOT RECOMMENDED)

If you **absolutely must** use GitHub Pages, you would need to:

1. **Convert your app to static export** (breaks most features)
2. **Remove all API routes** (products, orders, discounts, etc. won't work)
3. **Remove authentication** (NextAuth won't work)
4. **Remove database connections** (no data persistence)
5. **Use client-side only data** (mock data or external APIs)

### Steps for Static Export (if you really want to try):

1. **Update `next.config.js`**:
   ```js
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   }
   ```

2. **Remove or comment out**:
   - All `/app/api/*` routes
   - `middleware.ts`
   - NextAuth configuration
   - Database queries

3. **Build static site**:
   ```bash
   npm run build
   ```

4. **Deploy `out/` folder to GitHub Pages**

**⚠️ Warning**: This will break your entire application. Only do this if you're creating a completely different static version.

---

## 📋 GitHub Actions Workflow (For Vercel Deployment)

If you want automatic deployments to Vercel via GitHub Actions, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🎯 Summary

| Platform | Works? | Setup Time | Cost | Features |
|----------|--------|------------|------|----------|
| **Vercel** | ✅ Yes | 5 min | Free | All features work |
| **Netlify** | ✅ Yes | 10 min | Free | Most features work |
| **Railway** | ✅ Yes | 10 min | Free | All features work |
| **GitHub Pages** | ❌ No | N/A | Free | Only static files |

**Recommendation**: Use **Vercel** - it's the easiest and best option for Next.js apps.

---

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Your existing DEPLOYMENT.md](./DEPLOYMENT.md) has more details
