// Database seed script - populates initial data for testing
import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'pg-d599dbf-bknglabs-56cd.i.aivencloud.com',
  port: parseInt(process.env.DB_PORT) || 18303,
  database: process.env.DB_NAME || 'defaultdb',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_-yimCiG__MNX0DyJhIv',
  ssl: { rejectUnauthorized: true, mode: 'require' }
});

// Sample commodity basket items
const basketItems = [
  { type: 'food_staple', name: 'Rice (white, long grain)', quantity: 2.0, unit: 'kg' },
  { type: 'food_staple', name: 'Wheat flour', quantity: 2.0, unit: 'kg' },
  { type: 'food_staple', name: 'Bread (white loaf)', quantity: 2.0, unit: 'kg' },
  { type: 'protein', name: 'Chicken breast', quantity: 1.0, unit: 'kg' },
  { type: 'protein', name: 'Eggs', quantity: 12.0, unit: 'units' },
  { type: 'fuel', name: 'Diesel', quantity: 1.0, unit: 'liter' },
  { type: 'fuel', name: 'Cooking oil', quantity: 1.0, unit: 'liter' },
  { type: 'utilities', name: 'Electricity', quantity: 100.0, unit: 'kWh' },
  { type: 'utilities', name: 'Water', quantity: 10.0, unit: 'cubic_meter' },
  { type: 'transport', name: 'Public transport', quantity: 20.0, unit: 'trips' }
];

// Sample prices by country (USD equivalent)
const samplePrices = {
  USA: [8.50, 4.20, 6.00, 12.50, 5.50, 1.20, 4.50, 15.00, 35.00, 60.00],
  GBR: [7.00, 3.50, 5.00, 11.00, 4.50, 1.55, 4.00, 22.00, 45.00, 75.00],
  EUR: [5.50, 2.80, 4.00, 9.50, 3.80, 1.45, 3.50, 18.00, 38.00, 55.00],
  JPN: [1200, 580, 850, 1800, 350, 150, 650, 2200, 4500, 8000],
  CAN: [11.00, 5.50, 7.50, 15.00, 7.00, 1.40, 5.50, 18.00, 42.00, 70.00],
  AUS: [9.00, 4.50, 6.50, 14.00, 6.50, 1.35, 5.00, 25.00, 55.00, 85.00],
  BRA: [25.00, 12.00, 18.00, 35.00, 15.00, 5.50, 18.00, 80.00, 150.00, 200.00],
  IND: [80, 45, 60, 250, 70, 95, 150, 800, 400, 500],
  MEX: [45, 22, 35, 85, 35, 22, 40, 350, 280, 320],
  CHN: [12, 7, 10, 22, 15, 8, 18, 70, 55, 50],
  ZAF: [45, 25, 30, 65, 28, 1.10, 22, 18, 35, 85],
  NGA: [2500, 1800, 2200, 5500, 2000, 550, 1800, 25000, 15000, 8000],
  ARG: [2500, 1800, 3000, 7500, 3500, 600, 5000, 35000, 50000, 45000],
  TUR: [80, 45, 65, 180, 50, 35, 90, 1200, 800, 600],
  VEN: [350, 250, 400, 800, 300, 5, 350, 4000, 6000, 5000],
};

const currencies = {
  USA: 'USD', GBR: 'GBP', EUR: 'EUR', JPN: 'JPY', CAN: 'CAD',
  AUS: 'AUD', BRA: 'BRL', IND: 'INR', MEX: 'MXN', CHN: 'CNY',
  ZAF: 'ZAR', NGA: 'NGN', ARG: 'ARS', TUR: 'TRY', VEN: 'VES'
};

const exchangeRates = {
  USD: 1, GBP: 0.79, EUR: 0.92, JPY: 150, CAD: 1.35,
  AUD: 1.52, BRL: 4.95, INR: 83, MXN: 17, CNY: 7.2,
  ZAR: 18.5, NGN: 780, ARS: 870, TRY: 29, VES: 35
};

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Seed commodity prices
    console.log('📦 Seeding commodity prices...');
    const countries = Object.keys(samplePrices);
    
    for (const country of countries) {
      const prices = samplePrices[country];
      const currency = currencies[country];
      const now = new Date();
      
      for (let i = 0; i < basketItems.length; i++) {
        const item = basketItems[i];
        const price = prices[i];
        const priceUsd = price / exchangeRates[currency];
        
        await client.query(`
          INSERT INTO commodity_prices (
            commodity_type, commodity_name, quantity, unit, country_code, currency,
            price, price_usd, source, collected_at, valid_from, confidence_score
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (commodity_type, country_code, valid_from) DO NOTHING
        `, [
          item.type,
          item.name,
          item.quantity,
          item.unit,
          country,
          currency,
          price,
          priceUsd,
          'Official Statistics',
          now,
          now,
          0.95
        ]);
      }
      console.log(`  ✅ ${country} - ${prices.length} items seeded`);
    }
    
    // Calculate and seed PPP values
    console.log('\n📊 Calculating and seeding PPP values...');
    const baselineBasketUsd = 142.50; // USA basket total
    
    for (const country of countries) {
      const prices = samplePrices[country];
      const currency = currencies[country];
      const basketTotal = prices.reduce((sum, p) => sum + p, 0);
      const basketTotalUsd = basketTotal / exchangeRates[currency];
      
      // Calculate stability metrics based on economic indicators
      let inflationRate, volatilityIndex, stabilityScore;
      
      switch (country) {
        case 'USA':
        case 'CHE':
        case 'SGP':
          inflationRate = 1.2 + Math.random() * 1.5;
          volatilityIndex = 0.01 + Math.random() * 0.02;
          stabilityScore = 90 + Math.floor(Math.random() * 8);
          break;
        case 'GBR':
        case 'DEU':
        case 'FRA':
        case 'CAN':
        case 'AUS':
        case 'JPN':
          inflationRate = 2 + Math.random() * 2;
          volatilityIndex = 0.02 + Math.random() * 0.03;
          stabilityScore = 80 + Math.floor(Math.random() * 10);
          break;
        case 'BRA':
        case 'IND':
        case 'MEX':
        case 'CHN':
        case 'ZAF':
        case 'TUR':
          inflationRate = 4 + Math.random() * 4;
          volatilityIndex = 0.05 + Math.random() * 0.08;
          stabilityScore = 60 + Math.floor(Math.random() * 20);
          break;
        case 'NGA':
        case 'ARG':
        case 'VEN':
          inflationRate = 50 + Math.random() * 100;
          volatilityIndex = 0.15 + Math.random() * 0.25;
          stabilityScore = 20 + Math.floor(Math.random() * 30);
          break;
        default:
          inflationRate = 3 + Math.random() * 3;
          volatilityIndex = 0.03 + Math.random() * 0.05;
          stabilityScore = 70 + Math.floor(Math.random() * 15);
      }
      
      const tokenValueUsd = baselineBasketUsd;
      const tokenValue = basketTotalUsd;
      
      await client.query(`
        INSERT INTO ppp_values (
          country_code, currency, basket_total, basket_total_usd,
          token_value, token_value_usd, inflation_rate, volatility_index,
          stability_score, calculation_method, data_points, benchmark_country,
          confidence_score, calculation_timestamp, effective_from
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (country_code, calculation_timestamp) DO NOTHING
      `, [
        country,
        currency,
        basketTotal,
        basketTotalUsd,
        tokenValue,
        tokenValueUsd,
        inflationRate,
        volatilityIndex,
        stabilityScore,
        'geometric_mean',
        basketItems.length,
        'USA',
        0.95,
        new Date(),
        new Date()
      ]);
    }
    
    console.log(`  ✅ PPP values seeded for ${countries.length} countries`);
    
    // Create sample test user
    console.log('\n👤 Creating sample test user...');
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('testpassword123', 12);
    
    await client.query(`
      INSERT INTO users (email, password_hash, wallet_address, country_code, email_verified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [
      'test@actcoin.io',
      passwordHash,
      '0x' + uuidv4().replace(/-/g, '').slice(0, 40),
      'USA',
      true
    ]);
    console.log('  ✅ Test user created (test@actcoin.io / testpassword123)');
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('  Email: test@actcoin.io');
    console.log('  Password: testpassword123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding if executed directly
seedDatabase().catch(console.error);

export { seedDatabase };
