const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

const fundAccount = async (userId, amount) => {
  if (!amount || amount <= 0) {
    throw new Error('Valid amount required');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, userId]
    );

    await client.query(
      'INSERT INTO transactions (id, user_id, kind, amount, updated_balance) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), userId, 'credit', amount, result.rows[0].balance]
    );

    await client.query('COMMIT');
    return { balance: parseFloat(result.rows[0].balance) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const payUser = async (senderId, recipientUsername, amount) => {
  if (!recipientUsername || !amount || amount <= 0) {
    throw new Error('Valid recipient and amount required');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const senderResult = await client.query(
      'SELECT balance FROM users WHERE id = $1',
      [senderId]
    );

    if (senderResult.rows[0].balance < amount) {
      throw new Error('Insufficient funds');
    }

    const recipient = await client.query(
      'SELECT id, balance FROM users WHERE username = $1',
      [recipientUsername]
    );

    if (!recipient.rows[0]) {
      throw new Error('Recipient not found');
    }

    const newSenderBalance = senderResult.rows[0].balance - amount;
    await client.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [amount, senderId]
    );

    const newRecipientBalance = parseFloat(recipient.rows[0].balance) + parseFloat(amount);
    await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [amount, recipient.rows[0].id]
    );

    await client.query(
      'INSERT INTO transactions (id, user_id, kind, amount, updated_balance) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), senderId, 'debit', amount, newSenderBalance]
    );

    await client.query(
      'INSERT INTO transactions (id, user_id, kind, amount, updated_balance) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), recipient.rows[0].id, 'credit', amount, newRecipientBalance]
    );

    await client.query('COMMIT');
    return { balance: newSenderBalance };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getBalance = async (userId, currency = 'INR') => {
  const result = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
  let balance = parseFloat(result.rows[0].balance);

  if (currency !== 'INR') {
    try {
      const response = await axios.get('https://api.currencyapi.com/v3/latest', {
        params: {
          apikey: process.env.CURRENCY_API_KEY,
          base_currency: 'INR',
          currencies: currency
        }
      });

      const rate = response.data.data[currency]?.value;
      if (!rate) {
        throw new Error('Invalid currency');
      }
      balance = balance * rate;
    } catch (error) {
      throw new Error('Failed to fetch exchange rate');
    }
  }

  return { balance: parseFloat(balance.toFixed(2)), currency };
};

const getTransactionHistory = async (userId) => {
  const result = await pool.query(
    'SELECT kind, amount, updated_balance, timestamp FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC',
    [userId]
  );

  return result.rows.map(row => ({
    kind: row.kind,
    amt: parseFloat(row.amount),
    updated_bal: parseFloat(row.updated_balance),
    timestamp: row.timestamp.toISOString()
  }));
};

module.exports = { fundAccount, payUser, getBalance, getTransactionHistory };