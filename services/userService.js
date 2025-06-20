const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const registerUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  try {
    await pool.query(
      'INSERT INTO users (id, username, password) VALUES ($1, $2, $3)',
      [userId, username, hashedPassword]
    );
    return { message: 'User registered successfully' };
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Username already exists');
    }
    throw error;
  }
};

module.exports = { registerUser };