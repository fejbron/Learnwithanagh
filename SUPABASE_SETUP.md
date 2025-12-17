# Quick Supabase Setup Guide

## Step 1: Get Your Database Connection String

You have `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, but for database migrations, you need the **direct PostgreSQL connection string**.

### How to Find It:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to Database Settings**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **Database** in the settings menu

3. **Get the Connection String**
   - Scroll down to the **"Connection string"** section
   - You'll see multiple tabs: **URI**, **JDBC**, **Golang**, etc.
   - **Click on the "URI" tab**
   - You'll see a connection string like:
     ```
     postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - **Copy this entire string** (it includes your database password)

4. **Add to Your .env File**
   ```env
   # Your existing public keys (keep these)
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
   
   # Add this new one for database connection
   SUPABASE_DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

   **Important:** Replace `[YOUR-PASSWORD]` with your actual database password. If you don't know it:
   - In the same Database settings page, look for **"Database password"** section
   - You can reset it if needed (but this will require updating all connection strings)

## Step 2: Run the Migration

Once you've added `SUPABASE_DATABASE_URL` to your `.env` file:

```bash
# 1. First, set up the database schema in Supabase
npm run supabase:setup

# 2. Then, migrate all your data from local PostgreSQL to Supabase
npm run migrate:supabase
```

## Step 3: Verify

1. Check your Supabase dashboard > **Table Editor** to see all your migrated data
2. Restart your dev server: `npm run dev`
3. Test the application - everything should work with Supabase now!

## Troubleshooting

### "Connection string not found"
- Make sure you copied the **entire** connection string from the URI tab
- Make sure it starts with `postgresql://` or `postgres://`
- Check that there are no extra spaces or quotes in your `.env` file

### "Authentication failed"
- Verify your database password is correct in the connection string
- You can reset your database password in Supabase Dashboard > Settings > Database > Database password

### "SSL connection required"
- The migration scripts automatically handle SSL for Supabase
- If you still get SSL errors, make sure you're using the connection string from the **URI** tab (not Connection pooling)

## What's the Difference?

- **NEXT_PUBLIC_SUPABASE_URL** + **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY**: Used for Supabase JS client (for client-side operations, storage, auth, etc.)
- **SUPABASE_DATABASE_URL**: Direct PostgreSQL connection string (for server-side database operations, migrations, etc.)

Both are needed for different purposes!

