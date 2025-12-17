import { Pool } from 'pg';

// Get database connection string from environment variable
// For Supabase: Use the connection string from Supabase dashboard
// Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

// Parse connection string or use direct config
let poolConfig: any;

if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
  // Use connection string (Supabase format)
  // Supabase requires SSL, detect by checking for supabase.co or supabase.com in the URL
  const requiresSSL = databaseUrl.includes('supabase.co') || databaseUrl.includes('supabase.com') || databaseUrl.includes('supabase');
  poolConfig = {
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: requiresSSL ? { rejectUnauthorized: false } : false,
  };
} else {
  // Fallback to direct config (for local development)
  poolConfig = {
    host: 'localhost',
    port: 5432,
    database: 'learnwithanagh',
    user: 'postgres',
    password: '14norbde',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

// Create a connection pool
let pool: Pool;
try {
  pool = new Pool(poolConfig);
  
  // Test the connection
  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit in production, just log the error
    if (process.env.NODE_ENV === 'development') {
      console.error('Database connection error:', err);
    }
  });
} catch (error) {
  console.error('Failed to create database pool:', error);
  throw error;
}

export { pool };

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
}

// Helper function to get a client from the pool for transactions
export async function getClient() {
  const client = await pool.connect();
  return client;
}

