const express = require('express');
const { authenticate } = require('../middleware/auth');
const { addProduct, listProducts, buyProduct } = require('../services/productService');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Headphones"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 199.99
 *               description:
 *                 type: string
 *                 example: "Noise-cancelling wireless headphones"
 *     responses:
 *       201:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: "Product added successfully"
 *       400:
 *         description: Invalid product data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   description:
 *                     type: string
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /buy:
 *   post:
 *     summary: Purchase a product
 *     tags: [Products]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product purchased successfully"
 *                 balance:
 *                   type: number
 *                   example: 500.00
 *       400:
 *         description: Invalid product ID or insufficient funds
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */

router.post('/product', authenticate, async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const result = await addProduct(name, price, description);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/product', async (req, res) => {
  try {
    const products = await listProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/buy', authenticate, async (req, res) => {
  try {
    const { product_id } = req.body;
    const result = await buyProduct(req.user.id, product_id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;