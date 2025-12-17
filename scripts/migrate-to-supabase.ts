/**
 * Migration script to export data from local PostgreSQL and import to Supabase
 * 
 * Usage:
 * 1. Set SUPABASE_DATABASE_URL in .env file
 * 2. Run: tsx scripts/migrate-to-supabase.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { generateId } from '../lib/id';

// Local database connection (current)
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'learnwithanagh',
  user: 'postgres',
  password: '14norbde',
});

// Supabase connection (target)
// Try to get connection string from various environment variables
let supabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

// If we have the public URL and key, we can try to construct the connection string
// But we still need the database password
if (!supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('⚠️  Found NEXT_PUBLIC_SUPABASE_URL but need database connection string');
  console.log('📝 To get your database connection string:');
  console.log('   1. Go to Supabase Dashboard > Settings > Database');
  console.log('   2. Scroll to "Connection string" section');
  console.log('   3. Select "URI" tab');
  console.log('   4. Copy the connection string (it includes your password)');
  console.log('   5. Add it to .env as: SUPABASE_DATABASE_URL="postgresql://..."\n');
}

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

const supabasePool = new Pool({
  connectionString: supabaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function migrateTable(
  tableName: string,
  columns: string[],
  transformRow?: (row: any) => any
) {
  console.log(`\n📦 Migrating ${tableName}...`);

  try {
    // Fetch data from local database
    const localResult = await localPool.query(`SELECT * FROM "${tableName}"`);
    const rows = localResult.rows;

    if (rows.length === 0) {
      console.log(`   ⚠️  No data to migrate for ${tableName}`);
      return;
    }

    console.log(`   📊 Found ${rows.length} records`);

    // Clear existing data in Supabase (optional - comment out if you want to keep existing data)
    await supabasePool.query(`DELETE FROM "${tableName}"`);

    // Insert data into Supabase
    let inserted = 0;
    for (const row of rows) {
      const transformedRow = transformRow ? transformRow(row) : row;
      
      // Build INSERT query dynamically
      const values = columns.map((_, index) => `$${index + 1}`).join(', ');
      const query = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values}) ON CONFLICT DO NOTHING`;
      
      try {
        await supabasePool.query(query, columns.map(col => transformedRow[col]));
        inserted++;
      } catch (error: any) {
        console.error(`   ❌ Error inserting row:`, error.message);
      }
    }

    console.log(`   ✅ Migrated ${inserted}/${rows.length} records`);
  } catch (error: any) {
    console.error(`   ❌ Error migrating ${tableName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting migration to Supabase...\n');

  try {
    // Test connections
    console.log('🔌 Testing database connections...');
    await localPool.query('SELECT 1');
    console.log('   ✅ Local database connected');
    
    await supabasePool.query('SELECT 1');
    console.log('   ✅ Supabase database connected\n');

    // Migrate tables in order (respecting foreign key constraints)
    await migrateTable('User', ['id', 'email', 'password', 'name', 'role', 'createdAt', 'updatedAt']);
    
    await migrateTable('Product', [
      'id', 'name', 'description', 'price', 'stock', 'category', 
      'barcode', 'images', 'createdAt', 'updatedAt'
    ]);
    
    await migrateTable('Discount', [
      'id', 'productId', 'discountType', 'value', 'startDate', 
      'endDate', 'isActive', 'createdAt', 'updatedAt'
    ]);
    
    await migrateTable('Order', [
      'id', 'orderNumber', 'totalAmount', 'createdAt'
    ]);
    
    await migrateTable('OrderItem', [
      'id', 'orderId', 'productId', 'quantity', 'price'
    ]);
    
    await migrateTable('InventoryHistory', [
      'id', 'productId', 'previousStock', 'newStock', 'changeReason', 'createdAt'
    ]);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update your .env file with SUPABASE_DATABASE_URL');
    console.log('   2. Restart your development server');
    console.log('   3. Test the application to verify everything works');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.message.includes('password authentication failed') || error.code === '28P01') {
      console.error('\n🔐 Authentication Error:');
      console.error('   The database password in your connection string is incorrect.');
      console.error('\n📝 How to fix:');
      console.error('   1. Go to Supabase Dashboard > Settings > Database');
      console.error('   2. Find "Database password" section');
      console.error('   3. Click "Reset database password" (or check if you have the correct password)');
      console.error('   4. Copy the new connection string from "Connection string" > "URI" tab');
      console.error('   5. Update SUPABASE_DATABASE_URL in your .env file');
    }
    process.exit(1);
  } finally {
    await localPool.end();
    await supabasePool.end();
  }
}

main();

