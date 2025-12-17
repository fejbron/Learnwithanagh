# Learn With Ana Gh - Admin Platform

A comprehensive admin platform for managing the "Learn With Ana Gh" kids' store. Built with Next.js 14+, TypeScript, Prisma, and SQLite.

## Features

- **Product Management**: Create, read, update, and delete products
- **Inventory Tracking**: Monitor and update stock levels with low stock alerts
- **Pricing & Discounts**: Set prices and create product-specific or global discounts
- **Sales Analytics**: View revenue charts, sales volume, and top-selling products
- **Admin Authentication**: Secure login system with NextAuth.js

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts

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

2. Set up PostgreSQL database:
   - Create a PostgreSQL database named `learnwithanagh` (or your preferred name)
   - Update the `DATABASE_URL` in `.env` file with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/learnwithanagh?schema=public"
   ```
   Replace `username`, `password`, `localhost`, `5432`, and `learnwithanagh` with your actual PostgreSQL credentials.

3. Run database migrations:
```bash
npx prisma migrate dev
```

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
│   └── prisma.ts         # Prisma client instance
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed script
└── public/
    └── uploads/          # Product image uploads
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed the database

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

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
- SQL injection prevention (Prisma handles this)
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

