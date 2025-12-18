export default () => ({
  port: parseInt(process.env.BACKEND_PORT || '3001', 10),
  environment: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'african_currency',
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiration: process.env.JWT_EXPIRATION || '7d',
  },
  stellar: {
    network: process.env.STELLAR_NETWORK || 'testnet',
    horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    signingKey: process.env.STELLAR_SIGNING_KEY,
    publicKey: process.env.STELLAR_PUBLIC_KEY,
  },
  apis: {
    exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY,
    goldPriceApiKey: process.env.GOLD_PRICE_API_KEY,
    newsApiKey: process.env.NEWS_API_KEY,
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    senderEmail: process.env.SENDER_EMAIL,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
});
