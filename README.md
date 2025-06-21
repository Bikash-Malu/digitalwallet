# Digital Wallet API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)

A secure REST API for digital wallet operations including fund transfers, transactions, and product purchases.

![Project Screenshot](/static/digitalwallet.jpeg)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Features

- 🔐 User authentication with password hashing
- 💰 Wallet funding and balance management
- ↔️ Peer-to-peer payments
- 📜 Transaction history
- 🛍️ Product catalog and purchases
- 💱 Currency conversion via external API

---

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL via [Neon](https://neon.tech)
- **Authentication**: Basic Auth + bcrypt
- **API Docs**: Swagger UI

---

## Setup Instructions

Follow these steps to set up the project on your local system:

1. Clone the repository:
   ```bash
   git clone https://github.com/Bikash-Malu/digitalwallet.git
2. Go to directory
   ```bash
    cd digitalwallet
3. Install dependencies:
   ```bash
   npm install
3. Copy the example .env file and update it with your configuration:
   ```bash
   cp .env.example .env
3. Start the server with nodemon:
   ```bash
   nodemon server.js
3. Open the app in your browser:
   ```bash
   http://localhost:3000 
