const express = require('express');
const { authenticate } = require('../middleware/auth');
const { fundAccount, payUser, getBalance, getTransactionHistory } = require('../services/transactionService');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Digital wallet operations
 */

/**
 * @swagger
 * /fund:
 *   post:
 *     summary: Add funds to wallet
 *     tags: [Wallet]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amt
 *             properties:
 *               amt:
 *                 type: number
 *                 format: float
 *                 minimum: 0.01
 *                 example: 100.00
 *     responses:
 *       200:
 *         description: Wallet funded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 150.00
 *       400:
 *         description: Invalid amount
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /pay:
 *   post:
 *     summary: Transfer money to another user
 *     tags: [Wallet]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - amt
 *             properties:
 *               to:
 *                 type: string
 *                 example: "jane_doe"
 *               amt:
 *                 type: number
 *                 format: float
 *                 minimum: 0.01
 *                 example: 50.00
 *     responses:
 *       200:
 *         description: Payment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 100.00
 *       400:
 *         description: Invalid recipient or amount, or insufficient funds
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipient not found
 */

/**
 * @swagger
 * /bal:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           example: "USD"
 *         description: Optional currency for conversion
 *     responses:
 *       200:
 *         description: Current wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 100.00
 *                 currency:
 *                   type: string
 *                   example: "USD"
 *       400:
 *         description: Invalid currency
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /stmt:
 *   get:
 *     summary: Get transaction history
 *     tags: [Wallet]
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   amount:
 *                     type: number
 *                   type:
 *                     type: string
 *                     enum: [credit, debit]
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   description:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.post('/fund', authenticate, async (req, res) => {
  try {
    const { amt } = req.body;
    const result = await fundAccount(req.user.id, amt);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/pay', authenticate, async (req, res) => {
  try {
    const { to, amt } = req.body;
    const result = await payUser(req.user.id, to, amt);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/bal', authenticate, async (req, res) => {
  try {
    const { currency } = req.query;
    const result = await getBalance(req.user.id, currency);
    res.json(result);
  } catch (error) {
    res.status(error.message === 'Invalid currency' ? 400 : 500).json({ error: error.message });
  }
});

router.get('/stmt', authenticate, async (req, res) => {
  try {
    const transactions = await getTransactionHistory(req.user.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;