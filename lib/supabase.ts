import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Supabase client for simple CRUD operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key for server-side operations
// This bypasses RLS (Row Level Security) for admin operations
export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Direct PostgreSQL connection for complex queries
// Use Supabase connection string
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

let pool: Pool | null = null;

if (databaseUrl) {
  const requiresSSL = databaseUrl.includes('supabase.co') || 
                      databaseUrl.includes('supabase.com') || 
                      process.env.NODE_ENV === 'production';
  
  pool = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: requiresSSL ? { rejectUnauthorized: false } : false,
  });

  pool.on('error', (err) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Database connection error:', err);
    } else {
      console.error('Database connection error occurred');
    }
  });
}

// Helper function for complex SQL queries (joins, aggregations, etc.)
export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database connection not configured. Set SUPABASE_DATABASE_URL or DATABASE_URL.');
  }
  
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development' || duration > 1000) {
      console.log('Executed query', { 
        duration, 
        rows: res.rowCount,
        ...(process.env.NODE_ENV === 'development' && { text })
      });
    }
    return res;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Query error', { text, error });
    } else {
      console.error('Database query failed');
    }
    throw error;
  }
}

// Helper function to get a client from the pool for transactions
export async function getClient() {
  if (!pool) {
    throw new Error('Database connection not configured. Set SUPABASE_DATABASE_URL or DATABASE_URL.');
  }
  return await pool.connect();
}

// Export Supabase client for direct use
export { supabase as supabaseClient };
