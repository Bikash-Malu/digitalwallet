const bcrypt = require('bcrypt');
const base64 = require('base-64');
const { pool } = require('../config/db');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const credentials = base64.decode(authHeader.split(' ')[1]);
  const [username, password] = credentials.split(':');

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticate };