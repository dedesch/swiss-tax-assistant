import { sql } from '@vercel/postgres';

export async function createTables() {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Tax calculations table
    await sql`
      CREATE TABLE IF NOT EXISTS tax_calculations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tax_year INTEGER NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tax_year)
      )
    `;

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
    
    const result = await sql`
      INSERT INTO tax_calculations (user_id, tax_year, data)
      VALUES (${userId}, ${taxYear}, ${JSON.stringify(calculationData)})
      ON CONFLICT (user_id, tax_year) 
      DO UPDATE SET 
        data = ${JSON.stringify(calculationData)}, 
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Save calculation error:', error);
    throw error;
  }
}

export async function getCalculation(userId, taxYear) {
  try {
    const result = await sql`
      SELECT * FROM tax_calculations 
      WHERE user_id = ${userId} AND tax_year = ${taxYear}
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Get calculation error:', error);
    throw error;
  }
}

export async function createUser(email, passwordHash) {
  try {
    await createTables(); // Ensure tables exist
    
    const result = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${passwordHash})
      RETURNING id, email, created_at
    `;
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
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}