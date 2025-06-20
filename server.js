require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const productRoutes = require('./routes/productRoutes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// ✅ Allow CORS from your deployed frontend or Swagger domain
const allowedOrigin = 'https://digitalwallet-tkg4.onrender.com'; // Replace with your actual Render backend URL

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// ✅ Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Digital Wallet API',
      version: '1.0.0',
      description: 'API for digital wallet operations including user registration, transactions, and product management',
    },
    servers: [
      {
        url: `${allowedOrigin}/api`, // Must match your deployed backend API path
        description: 'Deployed server on Render',
      },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Adjust as needed
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ✅ Connect to DB and start the server
async function startServer() {
  try {
    await initDb();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }

  // ✅ Mount routes
  app.use('/api', authRoutes);
  app.use('/api', walletRoutes);
  app.use('/api', productRoutes);

  // ✅ Swagger UI at root
  app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // ✅ Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📘 Swagger docs at: ${allowedOrigin}/`);
  });
}

startServer();
