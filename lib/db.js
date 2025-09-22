import pkg from 'pg';
const { Client } = pkg;

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taxdb'
});

// Initialize connection
let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log('Connected to PostgreSQL database');
  }
  return client;
}

// Helper function to execute queries
async function query(text, params) {
  const db = await connectDB();
  try {
    const result = await db.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function createTables() {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tax calculations table
    await query(`
      CREATE TABLE IF NOT EXISTS tax_calculations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tax_year INTEGER NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tax_year)
      )
    `);

    console.log('Database tables ready');
    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
}

export async function saveCalculation(userId, taxYear, calculationData) {
  try {
    await createTables(); // Ensure tables exist
    
    const result = await query(
      `INSERT INTO tax_calculations (user_id, tax_year, data)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, tax_year) 
       DO UPDATE SET 
         data = $3, 
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, taxYear, JSON.stringify(calculationData)]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Save calculation error:', error);
    throw error;
  }
}

export async function getCalculation(userId, taxYear) {
  try {
    const result = await query(
      `SELECT * FROM tax_calculations 
       WHERE user_id = $1 AND tax_year = $2
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId, taxYear]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Get calculation error:', error);
    throw error;
  }
}

export async function createUser(email, passwordHash) {
  try {
    await createTables(); // Ensure tables exist
    
    const result = await query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const result = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}