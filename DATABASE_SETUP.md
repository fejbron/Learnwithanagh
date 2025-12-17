# PostgreSQL Database Setup

## Quick Setup Guide

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql@14` or download from [postgresql.org](https://www.postgresql.org/download/)
   - Start PostgreSQL service: `brew services start postgresql@14`

2. **Create Database**:
   ```bash
   createdb learnwithanagh
   ```

3. **Update .env file**:
   ```env
   DATABASE_URL="postgresql://your_username@localhost:5432/learnwithanagh?schema=public"
   ```
   
   If your PostgreSQL requires a password:
   ```env
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/learnwithanagh?schema=public"
   ```

4. **Run Migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Seed Database**:
   ```bash
   npm run db:seed
   ```

### Option 2: Remote PostgreSQL (e.g., Supabase, Railway, Neon)

1. **Get Connection String** from your PostgreSQL provider
2. **Update .env file**:
   ```env
   DATABASE_URL="your_provider_connection_string"
   ```

3. **Run Migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Seed Database**:
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

