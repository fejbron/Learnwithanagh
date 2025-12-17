# Vercel Free Tier Deployment Guide

This guide will help you deploy your Next.js app to Vercel's free tier.

## ✅ Prerequisites

- Your code pushed to a GitHub repository
- A Vercel account (free tier is sufficient)
- A PostgreSQL database (Supabase, Railway, Neon, or any PostgreSQL provider)

---

## 🚀 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

If you haven't already:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
   - Use "Continue with GitHub" for easiest setup

2. **Click "Add New Project"**

3. **Import your GitHub repository**
   - Select your repository from the list
   - Vercel will auto-detect Next.js

4. **Configure Project Settings** (usually auto-detected):
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

5. **Add Environment Variables** (IMPORTANT!)

   Click "Environment Variables" and add these:

   #### Required Variables:

   ```env
   # Database Connection
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   # OR if using Supabase:
   SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   
   # NextAuth Authentication
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=https://your-app-name.vercel.app
   AUTH_URL=https://your-app-name.vercel.app
   ```

   **How to get these values:**

   - **DATABASE_URL**: 
     - If using Supabase: Go to Settings > Database > Connection String (URI mode)
     - If using other PostgreSQL: Your provider's connection string
   
   - **NEXTAUTH_SECRET**: Generate a random secret:
     ```bash
     openssl rand -base64 32
     ```
     Or use: https://generate-secret.vercel.app/32
   
   - **NEXTAUTH_URL**: 
     - Initially: `https://your-app-name.vercel.app` (Vercel will show you the URL after first deploy)
     - After first deploy: Update with your actual Vercel URL
     - If using custom domain: `https://yourdomain.com`

6. **Click "Deploy"**

   Vercel will:
   - Install dependencies
   - Build your app
   - Deploy to production
   - Give you a URL like `https://your-app-name.vercel.app`

---

## 🔧 Post-Deployment Configuration

### 1. Update NEXTAUTH_URL

After your first deployment:

1. Go to your Vercel project dashboard
2. Go to Settings > Environment Variables
3. Update `NEXTAUTH_URL` with your actual Vercel URL
4. Update `AUTH_URL` with the same value
5. Click "Redeploy" to apply changes

### 2. Run Database Migrations

Your database needs to be set up. You have two options:

#### Option A: Run migrations locally (recommended)

```bash
# Make sure DATABASE_URL points to your production database
npx prisma migrate deploy
npm run db:seed
```

#### Option B: Use Vercel Build Command

Add a build script that runs migrations. Update `package.json`:

```json
{
  "scripts": {
    "build": "prisma migrate deploy && next build",
    "postbuild": "prisma generate"
  }
}
```

**Note**: This requires `DATABASE_URL` to be available during build.

### 3. Verify Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Try logging in with default credentials:
   - Email: `admin@learnwithanagh.com`
   - Password: `admin123`
3. Test key features:
   - ✅ Login works
   - ✅ Dashboard loads
   - ✅ Products page works
   - ✅ API routes respond

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to your main branch:

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Vercel automatically:**
   - Detects the push
   - Builds your app
   - Deploys to production
   - Updates your live site

You can see deployment status in your Vercel dashboard.

---

## 🆓 Free Tier Limits

Vercel's free tier includes:

- ✅ **100GB bandwidth/month** (usually plenty)
- ✅ **100 serverless function executions/day** (for API routes)
- ✅ **Unlimited deployments**
- ✅ **Automatic HTTPS**
- ✅ **Custom domains** (1 free)
- ✅ **Preview deployments** for every PR

**Note**: If you exceed limits, you'll get a notification. Most small-to-medium apps stay well within free tier limits.

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check that all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Prisma Client not generated"**
- Add to `package.json`:
  ```json
  {
    "scripts": {
      "postinstall": "prisma generate"
    }
  }
  ```

### Database Connection Fails

**Error: "Connection refused" or "SSL required"**

1. Check your `DATABASE_URL` format:
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```

2. For Supabase, ensure you're using the connection pooler URL if available

3. Check that your database allows connections from Vercel's IPs (most cloud providers allow all by default)

### Authentication Not Working

**Error: "NEXTAUTH_SECRET missing"**

1. Go to Vercel Dashboard > Settings > Environment Variables
2. Ensure `NEXTAUTH_SECRET` is set
3. Ensure `NEXTAUTH_URL` matches your Vercel URL exactly
4. Redeploy after adding variables

**Error: "Redirect URI mismatch"**

- Ensure `NEXTAUTH_URL` in Vercel matches your actual deployment URL
- Check for trailing slashes (should be no trailing slash)
- Redeploy after updating

### API Routes Return 404

- Ensure API routes are in `app/api/` directory
- Check Vercel function logs in dashboard
- Verify environment variables are set

---

## 📋 Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `DATABASE_URL` or `SUPABASE_DATABASE_URL` - Your PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Random secret (32+ characters)
- [ ] `NEXTAUTH_URL` - Your Vercel deployment URL
- [ ] `AUTH_URL` - Same as NEXTAUTH_URL

**Optional** (if using Supabase client-side features):
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Your Supabase anon key

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong `NEXTAUTH_SECRET`** - Generate with `openssl rand -base64 32`
3. **Change default admin password** after first login
4. **Use environment variables** for all secrets
5. **Enable Vercel's security headers** (automatic on Vercel)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://nextjs.org/docs/deployment#vercel-recommended)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

## 🎉 You're Done!

Your app should now be live at `https://your-app-name.vercel.app`

Every time you push to GitHub, Vercel will automatically deploy your changes!
