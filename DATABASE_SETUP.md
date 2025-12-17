# Supabase Database Setup

## Quick Setup Guide

### Recommended: Supabase (Cloud PostgreSQL)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up/login and create a new project
   - Wait for the project to be provisioned

2. **Get Connection String**:
   - Go to Supabase Dashboard > Settings > Database
   - Find "Connection string" section
   - Select "URI" mode
   - Copy the connection string (it includes your password)

3. **Update .env file**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?sslmode=require"
   # OR use the Supabase-specific variable:
   SUPABASE_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?sslmode=require"
   ```
   Replace `[YOUR-PASSWORD]` and `[YOUR-HOST]` with values from Supabase.

4. **Set Up Database Schema**:
   ```bash
   npm run supabase:setup
   ```
   This will create all necessary tables in your Supabase database.

5. **Seed Database**:
   ```bash
   npm run db:seed
   ```
   This creates the default admin user.

### Alternative: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql@14` or download from [postgresql.org](https://www.postgresql.org/download/)
   - Start PostgreSQL service: `brew services start postgresql@14`

2. **Create Database**:
   ```bash
   createdb learnwithanagh
   ```

3. **Update .env file**:
   ```env
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/learnwithanagh?schema=public"
   ```

4. **Set Up Schema** (run SQL from `scripts/setup-supabase-schema.ts` manually)

5. **Seed Database**:
   ```bash
   npm run db:seed
   ```

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

Example:
```
postgresql://postgres:mypassword@localhost:5432/learnwithanagh?schema=public
```

## Troubleshooting

- **Authentication failed**: Check your username and password in the connection string
- **Database does not exist**: Create the database first using `createdb learnwithanagh`
- **Connection refused**: Ensure PostgreSQL is running and the port (default 5432) is correct
- **SSL required**: Add `?sslmode=require` to your connection string for remote databases

