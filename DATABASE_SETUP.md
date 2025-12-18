# Supabase Database Setup

This application uses **Supabase** as the primary database. Supabase provides a hosted PostgreSQL database with additional features.

## Quick Setup Guide

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up/login and create a new project
   - Wait for the project to be provisioned

2. **Get Connection String**:
   - Go to Supabase Dashboard > Settings > Database
   - Find "Connection string" section
   - Select "URI" mode
   - Copy the connection string (it includes your password)

3. **Get Supabase Credentials**:
   - Go to **Settings** > **API**
     - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - Copy `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
   - Go to **Settings** > **Database**
     - Copy connection string (URI mode) → `SUPABASE_DATABASE_URL`

4. **Update .env.local file**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?sslmode=require
   ```

5. **Set Up Database Schema**:
   ```bash
   npm run supabase:setup
   ```
   This will create all necessary tables in your Supabase database.

6. **Seed Database**:
   ```bash
   npm run db:seed
   ```
   This creates the default admin user.

## Architecture

This application uses a hybrid approach:

1. **Supabase Client**: For simple CRUD operations and real-time features
2. **Direct PostgreSQL Queries**: For complex queries (joins, aggregations) via connection string

Both methods connect to the same Supabase PostgreSQL database.

## Troubleshooting

- **Authentication failed**: Check your Supabase credentials in `.env.local`
- **Connection refused**: Verify your Supabase project is active
- **SSL required**: Supabase requires SSL - ensure `?sslmode=require` is in your connection string
- **Missing environment variables**: Ensure all required Supabase variables are set (see Step 3)

