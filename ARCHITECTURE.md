# Architecture Overview

## Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel
- **UI**: Tailwind CSS + shadcn/ui

## Database Architecture

### Supabase Integration

This application uses **Supabase** as the primary database with a hybrid approach:

1. **Supabase JS Client** (`@supabase/supabase-js`)
   - Used for simple CRUD operations
   - Provides type safety and query builder
   - Located in `lib/supabase.ts`

2. **Direct PostgreSQL Queries** (`pg` library)
   - Used for complex queries (joins, aggregations, transactions)
   - Connects via Supabase connection string
   - Same database, different access method

### Why Hybrid Approach?

- **Simple operations**: Supabase client is cleaner and more type-safe
- **Complex queries**: Direct SQL is more flexible for joins and aggregations
- **Performance**: Both methods connect to the same Supabase PostgreSQL instance

## File Structure

```
lib/
  ├── supabase.ts      # Supabase client + PostgreSQL connection
  ├── db.ts            # Deprecated (exports from supabase.ts)
  ├── auth.ts          # NextAuth configuration
  └── ...

app/api/
  ├── products/        # Product CRUD operations
  ├── orders/          # Order management
  ├── inventory/       # Stock management
  ├── discounts/       # Discount management
  └── analytics/       # Analytics and reporting
```

## Authentication Flow

1. User submits credentials via login form
2. NextAuth calls `authorize()` function in `lib/auth.ts`
3. Function queries Supabase database for user
4. Password is verified using bcrypt
5. JWT session is created and stored in cookies
6. Middleware protects admin routes

## Database Schema

All tables are created via `scripts/setup-supabase-schema.ts`:

- **User**: Admin users and authentication
- **Product**: Product catalog
- **Order**: Sales orders
- **OrderItem**: Order line items
- **Discount**: Product and global discounts
- **InventoryHistory**: Stock change tracking

## Environment Variables

### Required for Development

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
```

### Required for Production (Vercel)

Same variables, but:
- `NEXTAUTH_URL` and `AUTH_URL` point to production domain
- Use production Supabase project credentials

## Deployment Architecture

```
┌─────────────┐
│   Vercel    │  ← Next.js Application
│  (Hosting)  │
└──────┬──────┘
       │
       ├──→ API Routes (Serverless Functions)
       │
       └──→ ┌──────────────┐
            │   Supabase   │
            │  (Database)   │
            └──────────────┘
```

### Vercel

- Hosts Next.js application
- Runs API routes as serverless functions
- Provides global CDN for static assets
- Automatic HTTPS

### Supabase

- Hosted PostgreSQL database
- Connection pooling
- Automatic backups
- SSL/TLS encryption

## Security

1. **Authentication**: NextAuth.js with JWT sessions
2. **Password Hashing**: bcrypt with salt rounds
3. **SQL Injection**: Parameterized queries
4. **XSS Protection**: React's built-in escaping
5. **Environment Variables**: Never committed to git
6. **Service Role Key**: Only used server-side

## Performance Considerations

1. **Connection Pooling**: Supabase handles connection pooling
2. **Query Optimization**: Complex queries use direct SQL for better control
3. **Caching**: Next.js automatic caching for static pages
4. **CDN**: Vercel's global CDN for assets

## Future Enhancements

- Real-time subscriptions via Supabase Realtime
- Row Level Security (RLS) policies in Supabase
- Supabase Storage for product images
- Edge Functions for serverless operations
