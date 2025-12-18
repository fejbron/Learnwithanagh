# Vercel + Supabase Deployment Guide

This guide will help you deploy your Next.js application to Vercel with Supabase as the database.

## Prerequisites

- GitHub account with your code pushed to a repository
- Vercel account (free tier is sufficient)
- Supabase account (free tier is sufficient)

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: Your project name (e.g., "learnwithanagh")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

### 1.2 Get Supabase Credentials

1. Go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

3. Go to **Settings** > **Database**
4. Under "Connection string", select **URI** mode
5. Copy the connection string (it includes your password)

### 1.3 Set Up Database Schema

1. In your local project, ensure your `.env` file has:
   ```env
   SUPABASE_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?sslmode=require"
   ```

2. Run the schema setup:
   ```bash
   npm run supabase:setup
   ```

3. Seed the database:
   ```bash
   npm run db:seed
   ```

## Step 2: Deploy to Vercel

### 2.1 Connect Your Repository

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 2.2 Configure Environment Variables

In Vercel Dashboard > Your Project > Settings > Environment Variables, add:

#### Required Variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require

# NextAuth Configuration
NEXTAUTH_SECRET=your-generated-secret-here-minimum-32-characters
NEXTAUTH_URL=https://your-app-name.vercel.app
AUTH_URL=https://your-app-name.vercel.app
```

#### How to Get Each Value:

- **NEXT_PUBLIC_SUPABASE_URL**: From Supabase Dashboard > Settings > API > Project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: From Supabase Dashboard > Settings > API > anon/public key
- **SUPABASE_SERVICE_ROLE_KEY**: From Supabase Dashboard > Settings > API > service_role key (secret!)
- **SUPABASE_DATABASE_URL**: From Supabase Dashboard > Settings > Database > Connection string (URI mode)
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **NEXTAUTH_URL**: Your Vercel deployment URL (update after first deploy)
- **AUTH_URL**: Same as NEXTAUTH_URL

### 2.3 Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. After deployment, update `NEXTAUTH_URL` and `AUTH_URL` with your actual Vercel URL
4. Redeploy to apply the updated environment variables

## Step 3: Verify Deployment

1. Visit your Vercel deployment URL
2. Try logging in with:
   - Email: `admin@learnwithanagh.com`
   - Password: `admin123`

## Architecture Overview

### Database Layer

- **Supabase PostgreSQL**: Hosted PostgreSQL database
- **Supabase Client**: Used for simple CRUD operations
- **Direct SQL Queries**: Used for complex queries (joins, aggregations)

### Authentication

- **NextAuth.js**: Handles authentication
- **Supabase Database**: Stores user credentials
- **JWT Sessions**: Stored in cookies

### Deployment

- **Vercel**: Hosts Next.js application
- **Serverless Functions**: API routes run as serverless functions
- **Edge Network**: Global CDN for static assets

## Environment Variables Reference

### Development (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
```

### Production (Vercel)

Same as development, but:
- `NEXTAUTH_URL` and `AUTH_URL` should be your production URL
- Use production Supabase project credentials

## Troubleshooting

### Database Connection Issues

- Verify `SUPABASE_DATABASE_URL` is correct
- Check that your Supabase project is active
- Ensure SSL is enabled (`?sslmode=require`)

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your Vercel URL exactly
- Check that `NEXTAUTH_SECRET` is set
- Ensure cookies are being set (check browser dev tools)

### Build Errors

- Check that all environment variables are set in Vercel
- Verify Supabase credentials are correct
- Check Vercel build logs for specific errors

## Security Best Practices

1. **Never commit** `.env` files to git
2. **Use service_role key** only on the server (never expose to client)
3. **Rotate secrets** regularly in production
4. **Enable RLS** in Supabase for additional security (if needed)
5. **Use HTTPS** in production (Vercel provides this automatically)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
