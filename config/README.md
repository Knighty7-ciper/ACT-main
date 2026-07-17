# ACT COIN Platform

<div align="center">

![ACT COIN Logo](frontend/public/favicon.svg)

**A decentralized cryptocurrency anchored to real-world purchasing power**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Table of Contents

- [About ACT COIN](#about-act-coin)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## About ACT COIN

ACT COIN is a next-generation cryptocurrency platform that solves the fundamental problem of modern money: value divorced from economic reality. Unlike traditional cryptocurrencies that derive value from speculation or traditional currencies that lose purchasing power through inflation, ACT COIN is anchored to a standardized basket of real-world essential goods.

### The Problem

Every day, billions of people wake up to money that buys a little less than it did yesterday. Through inflation, currency manipulation, and banking barriers, traditional money fails its most basic purpose: storing and transferring value reliably.

### Our Solution

ACT COIN uses a **Purchasing Power Parity (PPP) algorithm** to maintain consistent value across different economies. By tracking the price of essential goods (food staples, fuel, utilities, transport) across multiple countries, ACT COIN automatically adjusts to preserve real purchasing power regardless of local currency fluctuations.

---

## Features

### Core Features
- **PPP-Based Valuation**: Token value derived from real-world commodity prices, not speculation
- **Global Price Tracking**: Live data from multiple countries and sources
- **Automatic Adjustments**: Token value adapts to maintain consistent purchasing power
- **Borderless Transfers**: Send value anywhere with minimal fees
- **Bankless Freedom**: Full control with non-custodial wallets

### Technical Features
- **JWT Authentication**: Secure, token-based user authentication
- **PostgreSQL Database**: Robust data persistence with Aiven cloud database
- **React Frontend**: Modern, responsive UI with Tailwind CSS
- **RESTful API**: Clean, documented backend API
- **Real-time Updates**: Live PPP calculations and price feeds

---

## Architecture

```
ACT COIN Platform
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/           # Database models (User, Wallet, Transaction, etc.)
│   ├── routes/           # API routes
│   ├── services/         # Business logic (PPP calculations)
│   └── server.js         # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client services
│   │   └── styles/       # Global styles
│   └── index.html        # HTML entry point
└── package.json          # Root workspace configuration
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **PostgreSQL**: Version 14.0 or higher (or use Aiven cloud database)
- **Git**: For version control

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/actcoin/platform.git
cd act-coin-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

Or use the workspace command:

```bash
npm run install:all
```

### 3. Configure Environment Variables

Copy the example environment file and update with your settings:

```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env with your database credentials and API settings
```

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)

### 4. Set Up the Database

If using the provided Aiven database, the connection is pre-configured. Otherwise, create a new PostgreSQL database:

```sql
CREATE DATABASE act_coin;
```

Run migrations to create tables:

```bash
cd backend
npm run migrate
```

Seed with initial data:

```bash
npm run seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:5173
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

---

## Project Structure

### Backend Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection pool
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── pppController.js     # PPP calculation endpoints
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User model and operations
│   ├── Wallet.js            # Wallet model and operations
│   ├── Transaction.js       # Transaction model and operations
│   ├── CommodityPrice.js    # Commodity price data
│   └── PPPValue.js          # PPP calculated values
├── routes/
│   ├── authRoutes.js        # Authentication API routes
│   └── pppRoutes.js         # PPP API routes
├── services/
│   └── pppService.js        # PPP calculation logic
├── server.js                # Express server entry point
├── package.json
└── .env.example
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx       # Navigation header
│   │   └── Footer.jsx       # Site footer
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── pages/
│   │   ├── HomePage.jsx     # Landing page
│   │   ├── LoginPage.jsx    # User login
│   │   ├── RegisterPage.jsx # User registration
│   │   ├── DashboardPage.jsx# User dashboard
│   │   ├── SwapPage.jsx     # Token swap interface
│   │   ├── BasketPage.jsx   # Commodity basket comparison
│   │   ├── StabilityPage.jsx# Global stability rankings
│   │   └── AboutPage.jsx    # About and documentation
│   ├── services/            # API client services
│   ├── styles/
│   │   └── index.css        # Global styles with Tailwind
│   ├── App.jsx              # Main application component
│   └── main.jsx             # Application entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Configuration

### Environment Variables

#### Backend (.env)

```env
# Database Configuration (Aiven PostgreSQL)
DB_HOST=pg-d599dbf-bknglabs-56cd.i.aivencloud.com
DB_PORT=18303
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_-yimCiG__MNX0DyJhIv
DB_SSLMODE=require

# Application Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=100

# Oracle Configuration
ORACLE_UPDATE_INTERVAL=60000
PPP_BASELINE_CURRENCY=USD

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Database Schema

The platform uses the following main tables:

- **users**: User accounts and authentication
- **wallets**: User wallets and balances
- **transactions**: Transaction history
- **commodity_prices**: Real-world commodity prices
- **ppp_values**: Calculated PPP values by country

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| POST | /api/auth/refresh-token | Refresh access token |
| GET | /api/auth/profile | Get user profile (auth required) |
| PUT | /api/auth/profile | Update profile (auth required) |
| POST | /api/auth/link-wallet | Link wallet to account (auth required) |
| PUT | /api/auth/change-password | Change password (auth required) |

### PPP Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ppp/value/:countryCode | Get PPP value for a country |
| GET | /api/ppp/global | Get global PPP comparison |
| GET | /api/ppp/basket | Get basket prices for comparison |
| GET | /api/ppp/stability | Get stability ranking |
| POST | /api/ppp/calculate | Calculate token amount |
| GET | /api/ppp/history/:countryCode | Get PPP history |
| GET | /api/ppp/commodities/:countryCode | Get commodity prices |
| GET | /api/ppp/countries | Get all available countries |

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

---

## Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# The build output will be in frontend/dist/
```

### Docker Deployment

Create a Dockerfile for the backend:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Considerations

For production deployment:
1. Set `NODE_ENV=production`
2. Use a secure JWT secret
3. Enable SSL/TLS
4. Configure proper CORS origins
5. Set up monitoring and logging

---

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Security

ACT COIN takes security seriously. If you discover a security vulnerability, please report it responsibly:

- Email: security@actcoin.io
- Do not disclose publicly until fixed

### Security Measures
- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection protection via parameterized queries
- CORS configuration
- Helmet.js security headers

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: [docs.actcoin.io](https://docs.actcoin.io)
- **Discord**: [discord.actcoin.io](https://discord.actcoin.io)
- **Twitter**: [@actcoin](https://twitter.com/actcoin)
- **Email**: hello@actcoin.io

---

<div align="center">

**Built with ❤️ for financial sovereignty**

*Money that works everywhere, for everyone.*

</div>
