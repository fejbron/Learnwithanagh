# Learn With Ana Gh - Admin Platform

A comprehensive admin platform for managing the "Learn With Ana Gh" kids' store. Built with Next.js 14+, TypeScript, and Supabase (PostgreSQL).

## Features

- **Product Management**: Create, read, update, and delete products
- **Inventory Tracking**: Monitor and update stock levels with low stock alerts
- **Pricing & Discounts**: Set prices and create product-specific or global discounts
- **Sales Analytics**: View revenue charts, sales volume, and top-selling products
- **Admin Authentication**: Secure login system with NextAuth.js

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL) - Explicit Supabase integration
- **Database Client**: Supabase JS Client + Direct PostgreSQL queries for complex operations
- **Authentication**: NextAuth.js v5
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (local or remote)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase database:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Get your credentials from Supabase Dashboard:
     - **Settings** > **API**: Project URL, anon key, service_role key
     - **Settings** > **Database**: Connection string (URI mode)
   - Add all credentials to your `.env.local` file (see Environment Variables section)

3. Set up database schema:
   - Run the Supabase setup script to create tables:
   ```bash
   npm run supabase:setup
   ```
   - Or manually run the SQL migrations from `scripts/setup-supabase-schema.ts`

4. Seed the database with an admin user:
```bash
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login Credentials

- **Email**: admin@learnwithanagh.com
- **Password**: admin123

**⚠️ Important**: Change the default password in production!

## Project Structure

```
/
├── app/
│   ├── (auth)/          # Authentication routes
│   ├── (admin)/          # Protected admin routes
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/
│   ├── admin/            # Admin-specific components
│   ├── layout/           # Layout components (Sidebar, Header)
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   └── db.ts             # Database connection and query helpers
├── scripts/
│   ├── seed.ts           # Database seed script
│   └── setup-supabase-schema.ts  # Database schema setup
└── public/
    └── uploads/          # Product image uploads
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed the database with admin user
- `npm run db:reset-password` - Reset admin password
- `npm run supabase:setup` - Set up database schema in Supabase

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require

# NextAuth Configuration (Required)
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
```

### Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. **Settings** > **API**:
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
3. **Settings** > **Database**:
   - Copy connection string (URI mode) → `SUPABASE_DATABASE_URL`

## Features Overview

### Dashboard
- Overview cards showing total revenue, today's revenue, total products, and low stock alerts
- Quick action links to common tasks

### Products
- List all products with search functionality
- Create new products with name, description, price, stock, and category
- Edit existing products
- Delete products
- View discounted prices when discounts are active

### Inventory
- View all products with current stock levels
- Edit stock levels inline
- Low stock warnings (products with stock < 10)
- Stock history tracking

### Discounts
- Create product-specific or global discounts
- Set percentage or fixed amount discounts
- Set start and end dates
- Activate/deactivate discounts

### Analytics
- Revenue charts (daily/weekly/monthly/yearly)
- Sales volume charts
- Top-selling products table
- Revenue summary cards

## Security Considerations

- Password hashing with bcrypt
- Protected API routes with session validation
- File upload validation (when implemented)
- SQL injection prevention (parameterized queries)
- XSS prevention (React escapes by default)

## Future Enhancements

- Customer-facing storefront
- Order management system
- Email notifications
- Multi-admin roles/permissions
- Product variants (sizes, colors)
- Image upload functionality
- Export functionality (CSV/PDF) for analytics

## License

Private project for Learn With Ana Gh

