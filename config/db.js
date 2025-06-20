const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_1CzufHPchOv5@ep-noisy-cloud-a17e5ld0.ap-southeast-1.aws.neon.tech/wallet_db?sslmode=require',
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 0.00
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        kind VARCHAR(20) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        updated_balance DECIMAL(15,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        description TEXT
      )
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = { pool, initDb };