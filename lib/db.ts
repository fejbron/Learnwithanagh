import { Pool } from 'pg';

// Get database connection string from environment variable
// For Supabase: Use the connection string from Supabase dashboard
// Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

// In production, DATABASE_URL must be set
if (!databaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error(
    'DATABASE_URL or SUPABASE_DATABASE_URL environment variable is required in production'
  );
}

// Parse connection string or use direct config
let poolConfig: any;

if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
  // Use connection string (Supabase format)
  // Supabase requires SSL, detect by checking for supabase.co or supabase.com in the URL
  const requiresSSL = databaseUrl.includes('supabase.co') || 
                      databaseUrl.includes('supabase.com') || 
                      databaseUrl.includes('supabase') ||
                      process.env.NODE_ENV === 'production';
  
  poolConfig = {
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: requiresSSL ? { rejectUnauthorized: false } : false,
  };
} else if (process.env.NODE_ENV === 'development') {
  // Only allow localhost fallback in development
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'learnwithanagh',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  throw new Error('Database configuration is missing. Set DATABASE_URL environment variable.');
}

// Create a connection pool
let pool: Pool;
try {
  pool = new Pool(poolConfig);
  
  // Test the connection (only log in development)
  pool.on('connect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Connected to PostgreSQL database');
    }
  });

  pool.on('error', (err) => {
    // Always log errors, but don't expose details in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error on idle client', err);
    } else {
      console.error('Database connection error occurred');
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
    // Only log slow queries in production, or all queries in development
    if (process.env.NODE_ENV === 'development' || duration > 1000) {
      console.log('Executed query', { 
        duration, 
        rows: res.rowCount,
        ...(process.env.NODE_ENV === 'development' && { text })
      });
    }
    return res;
  } catch (error) {
    // Log error details in development, generic message in production
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
  const client = await pool.connect();
  return client;
}

