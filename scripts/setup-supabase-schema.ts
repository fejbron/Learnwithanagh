/**
 * Script to create database schema in Supabase
 * Run this BEFORE running the migration script
 * 
 * Usage: tsx scripts/setup-supabase-schema.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';

let supabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_DATABASE_URL or DATABASE_URL environment variable is required');
  console.error('\n📋 How to get your Supabase database connection string:');
  console.error('   1. Go to your Supabase project dashboard');
  console.error('   2. Navigate to Settings > Database');
  console.error('   3. Scroll down to "Connection string" section');
  console.error('   4. Select the "URI" tab (not "Connection pooling")');
  console.error('   5. Copy the connection string - it looks like:');
  console.error('      postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres');
  console.error('   6. Add it to your .env file as:');
  console.error('      SUPABASE_DATABASE_URL="postgresql://..."');
  console.error('\n💡 Note: The connection string includes your database password');
  process.exit(1);
}

const pool = new Pool({
  connectionString: supabaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function setupSchema() {
  console.log('🏗️  Setting up Supabase database schema...\n');

  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to Supabase\n');

    // Create User table
    console.log('📋 Creating User table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    console.log('   ✅ User table created');

    // Create Product table
    console.log('📋 Creating Product table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" DOUBLE PRECISION NOT NULL,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "category" TEXT,
        "barcode" TEXT UNIQUE,
        "images" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    console.log('   ✅ Product table created');

    // Create Discount table
    console.log('📋 Creating Discount table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Discount" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT,
        "discountType" TEXT NOT NULL,
        "value" DOUBLE PRECISION NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Discount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('   ✅ Discount table created');

    // Create Order table
    console.log('📋 Creating Order table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderNumber" TEXT NOT NULL UNIQUE,
        "totalAmount" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✅ Order table created');

    // Create OrderItem table
    console.log('📋 Creating OrderItem table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    console.log('   ✅ OrderItem table created');

    // Create InventoryHistory table
    console.log('📋 Creating InventoryHistory table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "InventoryHistory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "previousStock" INTEGER NOT NULL,
        "newStock" INTEGER NOT NULL,
        "changeReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "InventoryHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('   ✅ InventoryHistory table created');

    console.log('\n✅ Schema setup completed successfully!');
    console.log('\n📝 Next step: Run "npm run migrate:supabase" to migrate your data');

  } catch (error: any) {
    console.error('\n❌ Schema setup failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some tables already exist. This is okay - continuing...');
    } else if (error.message.includes('password authentication failed') || error.code === '28P01') {
      console.error('\n🔐 Authentication Error:');
      console.error('   The database password in your connection string is incorrect.');
      console.error('\n📝 How to fix:');
      console.error('   1. Go to Supabase Dashboard > Settings > Database');
      console.error('   2. Find "Database password" section');
      console.error('   3. Click "Reset database password" (or check if you have the correct password)');
      console.error('   4. Copy the new connection string from "Connection string" > "URI" tab');
      console.error('   5. Update SUPABASE_DATABASE_URL in your .env file');
      throw error;
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

setupSchema();

