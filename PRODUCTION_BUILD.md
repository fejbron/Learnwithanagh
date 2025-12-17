# Production Build Guide

This guide explains how to build and deploy the production version of your app to Vercel.

## ✅ Production Optimizations Applied

The following optimizations have been applied for production:

### 1. Security Fixes
- ✅ Removed hardcoded database credentials
- ✅ Added proper environment variable validation
- ✅ Added security headers (HSTS, X-Frame-Options, etc.)
- ✅ Removed `X-Powered-By` header

### 2. Performance Optimizations
- ✅ Enabled compression
- ✅ Optimized image formats (AVIF, WebP)
- ✅ Conditional logging (only in development)
- ✅ Query performance monitoring

### 3. Build Configuration
- ✅ Prisma client auto-generation on install
- ✅ Production build script
- ✅ Database migration script

---

## 🚀 Building for Production

### Option 1: Build Locally (for testing)

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build for production
npm run build

# Test production build locally
npm start
```

### Option 2: Deploy to Vercel (Recommended)

Vercel will automatically build your app when you deploy:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production build optimizations"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables (see `env.production.example`)
   - Click "Deploy"

Vercel will automatically:
- Run `npm install` (which triggers `postinstall` → `prisma generate`)
- Run `npm run build`
- Deploy to production

---

## 📋 Pre-Deployment Checklist

Before deploying to Vercel, ensure:

- [ ] **Environment Variables Set in Vercel:**
  - [ ] `DATABASE_URL` or `SUPABASE_DATABASE_URL`
  - [ ] `NEXTAUTH_SECRET` (32+ characters)
  - [ ] `NEXTAUTH_URL` (your Vercel URL)
  - [ ] `AUTH_URL` (same as NEXTAUTH_URL)

- [ ] **Database Migrations:**
  ```bash
  # Run migrations on production database
  npx prisma migrate deploy
  ```

- [ ] **Database Seeded:**
  ```bash
  # Seed production database (if needed)
  npm run db:seed
  ```

- [ ] **Code Changes:**
  - [ ] All hardcoded credentials removed
  - [ ] No localhost URLs in production code
  - [ ] Environment variables used everywhere

---

## 🔧 Environment Variables

See `env.production.example` for the complete list of required environment variables.

**Critical Variables:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your Vercel deployment URL

---

## 🐛 Troubleshooting Production Build

### Build Fails: "Prisma Client not generated"

**Solution:** The `postinstall` script should handle this automatically. If it fails:
```bash
npx prisma generate
```

### Build Fails: "DATABASE_URL not found"

**Solution:** This is expected during build. Vercel will use environment variables during runtime. If you need database access during build, add `DATABASE_URL` to Vercel's build-time environment variables.

### Build Succeeds but App Crashes: "Database connection failed"

**Solution:**
1. Check `DATABASE_URL` is set correctly in Vercel
2. Verify database allows connections from Vercel IPs
3. Check SSL settings (add `?sslmode=require` to connection string)

### Images Not Loading

**Solution:** 
1. Update `next.config.js` with your Vercel domain in `remotePatterns`
2. Or use absolute URLs for images

---

## 📊 Production Monitoring

### Check Build Logs
- Vercel Dashboard > Your Project > Deployments > Click on deployment > "Build Logs"

### Check Runtime Logs
- Vercel Dashboard > Your Project > Deployments > Click on deployment > "Function Logs"

### Monitor Performance
- Vercel Dashboard > Analytics (available on paid plans)
- Check browser console for client-side errors

---

## 🔐 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong `NEXTAUTH_SECRET`** - Minimum 32 characters
3. **Change default admin password** after first login
4. **Use HTTPS only** - Vercel provides this automatically
5. **Review security headers** in `next.config.js`

---

## 📚 Next Steps

After successful deployment:

1. ✅ Test login functionality
2. ✅ Test API routes
3. ✅ Verify database connections
4. ✅ Check image uploads (if applicable)
5. ✅ Update `NEXTAUTH_URL` with actual domain
6. ✅ Set up custom domain (optional)

---

## 🆘 Need Help?

- See `VERCEL_DEPLOYMENT.md` for detailed deployment steps
- See `VERCEL_ENV_VARS.md` for environment variable reference
- Check Vercel documentation: https://vercel.com/docs
