# Production Deployment Checklist

Use this checklist before deploying to Vercel to ensure everything is ready.

## ✅ Pre-Deployment

### Code Quality
- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] ESLint passes (`npm run lint`)
- [x] No hardcoded credentials
- [x] No localhost URLs in production code
- [x] Security headers configured
- [x] Production optimizations applied

### Configuration Files
- [x] `next.config.js` optimized for production
- [x] `vercel.json` configured
- [x] `package.json` has production build scripts
- [x] `.gitignore` excludes sensitive files

### Database
- [ ] Production database created and accessible
- [ ] Database schema setup script ready (`scripts/setup-supabase-schema.ts`)
- [ ] Connection string obtained
- [ ] SSL enabled for database connection

### Environment Variables
- [ ] `DATABASE_URL` or `SUPABASE_DATABASE_URL` ready
- [ ] `NEXTAUTH_SECRET` generated (32+ characters)
- [ ] `NEXTAUTH_URL` placeholder ready (update after deploy)
- [ ] `AUTH_URL` placeholder ready (update after deploy)

---

## 🚀 Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Production build ready"
git push origin main
```

### 2. Deploy on Vercel
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] Click "Add New Project"
- [ ] Import your repository
- [ ] Verify framework detection (Next.js)

### 3. Add Environment Variables
In Vercel Dashboard > Settings > Environment Variables, add:

- [ ] `DATABASE_URL` = your PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` = generated secret
- [ ] `NEXTAUTH_URL` = `https://your-app-name.vercel.app` (placeholder)
- [ ] `AUTH_URL` = same as NEXTAUTH_URL

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note your deployment URL

### 5. Post-Deployment

#### Update Environment Variables
- [ ] Copy your actual Vercel URL
- [ ] Update `NEXTAUTH_URL` in Vercel with actual URL
- [ ] Update `AUTH_URL` in Vercel with actual URL
- [ ] Redeploy to apply changes

#### Database Setup
- [ ] Set up schema: `npm run supabase:setup` (pointing to production DB)
- [ ] Seed database: `npm run db:seed` (if needed)

#### Testing
- [ ] Visit your Vercel URL
- [ ] Test login (default: admin@learnwithanagh.com / admin123)
- [ ] Test dashboard loads
- [ ] Test products page
- [ ] Test API routes
- [ ] Test image uploads (if applicable)
- [ ] Test barcode scanning (if applicable)

#### Security
- [ ] Change default admin password
- [ ] Verify HTTPS is working
- [ ] Check security headers in browser dev tools
- [ ] Verify no sensitive data in client-side code

---

## 🔍 Verification

### Build Status
- [ ] Build completed successfully
- [ ] No build errors or warnings
- [ ] All dependencies installed

### Runtime
- [ ] App loads without errors
- [ ] No console errors in browser
- [ ] Database connections working
- [ ] Authentication working
- [ ] API routes responding

### Performance
- [ ] Page load times acceptable
- [ ] Images loading correctly
- [ ] No 404 errors for assets

---

## 📝 Post-Deployment Notes

After successful deployment:

1. **Save your deployment URL** for future reference
2. **Document environment variables** (keep secure!)
3. **Set up monitoring** (optional)
4. **Configure custom domain** (optional)
5. **Set up automatic deployments** (already enabled by default)

---

## 🐛 Common Issues

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Check TypeScript compilation locally

### App Crashes
- Check function logs in Vercel
- Verify environment variables are set
- Check database connection string

### Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches deployment URL exactly
- Ensure no trailing slashes in URLs

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Check SSL settings (`?sslmode=require`)
- Verify database allows connections from Vercel

---

## 📚 Documentation

- `PRODUCTION_BUILD.md` - Build process details
- `VERCEL_DEPLOYMENT.md` - Step-by-step deployment guide
- `VERCEL_ENV_VARS.md` - Environment variables reference
- `env.production.example` - Environment variables template

---

## ✅ Ready to Deploy!

If all items above are checked, you're ready to deploy to Vercel!
