# Supabase Migration Guide

This guide will help you migrate your database from local PostgreSQL to Supabase.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Database**
3. Scroll down to **Connection string** section
4. Select **URI** tab
5. Copy the connection string (it looks like: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`)

## Step 2: Set Up Environment Variables

1. Create or update your `.env` file in the project root
2. Add your Supabase connection string:

```env
SUPABASE_DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
# Or use DATABASE_URL
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:** Replace `[PROJECT_REF]`, `[PASSWORD]`, and `[REGION]` with your actual Supabase values.

## Step 3: Set Up Supabase Schema

Run the schema setup script to create all necessary tables in Supabase:

```bash
npm run supabase:setup
```

This will create all the required tables (User, Product, Discount, Order, OrderItem, InventoryHistory) in your Supabase database.

## Step 4: Migrate Your Data

Once the schema is set up, migrate all your data:

```bash
npm run migrate:supabase
```

This script will:
- Export all data from your local PostgreSQL database
- Import it into your Supabase database
- Preserve all relationships and data integrity

## Step 5: Verify Migration

1. Check your Supabase dashboard > **Table Editor** to verify all data was migrated
2. Restart your development server: `npm run dev`
3. Test the application to ensure everything works correctly

## Step 6: Update Your Application

The application is already configured to use the `DATABASE_URL` or `SUPABASE_DATABASE_URL` environment variable. Once you've set it up, the app will automatically connect to Supabase instead of your local database.

## Troubleshooting

### Connection Issues
- Make sure your Supabase connection string is correct
- Check that your IP is allowed in Supabase (Settings > Database > Connection Pooling)
- Verify SSL is enabled (the script handles this automatically)

### Migration Errors
- Ensure the schema setup script ran successfully first
- Check that your local database is still accessible
- Verify all foreign key relationships are correct

### Data Not Showing
- Clear your browser cache
- Restart the development server
- Check Supabase dashboard to verify data exists

## Notes

- The migration script uses `ON CONFLICT DO NOTHING` to prevent duplicate entries
- All existing data in Supabase tables will be cleared before migration (you can modify this in the script if needed)
- The local database remains unchanged - you can always roll back by removing the Supabase connection string

