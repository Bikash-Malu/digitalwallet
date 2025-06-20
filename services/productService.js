const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const addProduct = async (name, price, description) => {
  if (!name || !price || price <= 0) {
    throw new Error('Valid name and price required');
  }

  const result = await pool.query(
    'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING id',
    [name, price, description]
  );

  return { id: result.rows[0].id, message: 'Product added' };
};

const listProducts = async () => {
  const result = await pool.query('SELECT * FROM products');
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    price: parseFloat(row.price),
    description: row.description
  }));
};

const buyProduct = async (userId, productId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const product = await client.query('SELECT price FROM products WHERE id = $1', [productId]);
    if (!product.rows[0]) {
      throw new Error('Invalid product');
    }

    const user = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
    const price = product.rows[0].price;

    if (user.rows[0].balance < price) {
      throw new Error('Insufficient balance');
    }

    const newBalance = user.rows[0].balance - price;
    await client.query(
      'UPDATE users SET balance = $1 WHERE id = $2',
      [newBalance, userId]
    );

    await client.query(
      'INSERT INTO transactions (id, user_id, kind, amount, updated_balance) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), userId, 'debit', price, newBalance]
    );

    await client.query('COMMIT');
    return { message: 'Product purchased', balance: parseFloat(newBalance) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { addProduct, listProducts, buyProduct };