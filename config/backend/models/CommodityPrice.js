import db from '../config/database.js';

const CommodityPrice = {
  // Create commodity prices table
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS commodity_prices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        commodity_type VARCHAR(50) NOT NULL,
        commodity_name VARCHAR(100) NOT NULL,
        quantity DECIMAL(10, 4) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        country_code VARCHAR(3) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        price DECIMAL(15, 4) NOT NULL,
        price_usd DECIMAL(15, 4),
        source VARCHAR(100) NOT NULL,
        source_url TEXT,
       采集时间 TIMESTAMP NOT NULL,
        valid_from TIMESTAMP NOT NULL,
        valid_to TIMESTAMP,
        confidence_score DECIMAL(3, 2) DEFAULT 1.00,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(commodity_type, country_code, valid_from)
      );
      
      CREATE INDEX IF NOT EXISTS idx_commodity_prices_type ON commodity_prices(commodity_type);
      CREATE INDEX IF NOT EXISTS idx_commodity_prices_country ON commodity_prices(country_code);
      CREATE INDEX IF NOT EXISTS idx_commodity_prices_time ON commodity_prices(采集时间);
    `;
    return db.query(query);
  },

  // Create standard basket items
  async seedBasketItems() {
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
      { type: 'transport', name: 'Public transport', quantity: 20.0, unit: 'trips' },
      { type: 'housing', name: 'Basic rent', quantity: 1.0, unit: 'month' },
      { type: 'healthcare', name: 'Basic medicine', quantity: 1.0, unit: 'package' }
    ];

    for (const item of basketItems) {
      const query = `
        INSERT INTO commodity_types (commodity_type, commodity_name, quantity, unit)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (commodity_type) DO NOTHING
      `;
      await db.query(query, [item.type, item.name, item.quantity, item.unit]);
    }
  },

  // Record commodity price
  async recordPrice(priceData) {
    const {
      commodityType,
      commodityName,
      quantity,
      unit,
      countryCode,
      currency,
      price,
      priceUsd,
      source,
      sourceUrl,
     采集时间,
      validFrom,
      validTo,
      confidenceScore
    } = priceData;

    const query = `
      INSERT INTO commodity_prices (
        commodity_type, commodity_name, quantity, unit, country_code, currency,
        price, price_usd, source, source_url, 采集时间, valid_from, valid_to, confidence_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await db.query(query, [
      commodityType,
      commodityName,
      quantity,
      unit,
      countryCode,
      currency,
      price,
      priceUsd,
      source,
      sourceUrl,
     采集时间 || new Date(),
      validFrom || new Date(),
      validTo,
      confidenceScore || 1.0
    ]);

    return result.rows[0];
  },

  // Get latest prices for a country
  async getLatestByCountry(countryCode) {
    const query = `
      SELECT DISTINCT ON (commodity_type) *
      FROM commodity_prices
      WHERE country_code = $1 AND valid_from <= CURRENT_TIMESTAMP 
        AND (valid_to IS NULL OR valid_to > CURRENT_TIMESTAMP)
      ORDER BY commodity_type, valid_from DESC
    `;
    const result = await db.query(query, [countryCode]);
    return result.rows;
  },

  // Get price history for a commodity
  async getPriceHistory(commodityType, countryCode, days = 30) {
    const query = `
      SELECT *
      FROM commodity_prices
      WHERE commodity_type = $1 AND country_code = $2
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY valid_from DESC
    `;
    const result = await db.query(query, [commodityType, countryCode]);
    return result.rows;
  },

  // Get basket prices for multiple countries
  async getBasketPrices(countryCodes) {
    const query = `
      SELECT DISTINCT ON (commodity_type, country_code) *
      FROM commodity_prices
      WHERE country_code = ANY($1)
        AND valid_from <= CURRENT_TIMESTAMP 
        AND (valid_to IS NULL OR valid_to > CURRENT_TIMESTAMP)
      ORDER BY commodity_type, country_code, valid_from DESC
    `;
    const result = await db.query(query, [countryCodes]);
    return result.rows;
  },

  // Get all latest prices
  async getAllLatest() {
    const query = `
      SELECT DISTINCT ON (commodity_type, country_code) *
      FROM commodity_prices
      WHERE valid_from <= CURRENT_TIMESTAMP 
        AND (valid_to IS NULL OR valid_to > CURRENT_TIMESTAMP)
      ORDER BY commodity_type, country_code, valid_from DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Get price by commodity type and country
  async getPriceByTypeAndCountry(commodityType, countryCode) {
    const query = `
      SELECT *
      FROM commodity_prices
      WHERE commodity_type = $1 AND country_code = $2
      ORDER BY valid_from DESC
      LIMIT 1
    `;
    const result = await db.query(query, [commodityType, countryCode]);
    return result.rows[0];
  },

  // Get average price across countries for a commodity
  async getAveragePrice(commodityType, countryCodes) {
    const query = `
      SELECT 
        commodity_type,
        commodity_name,
        AVG(price) as avg_price,
        AVG(price_usd) as avg_price_usd,
        MIN(price) as min_price,
        MAX(price) as max_price,
        COUNT(*) as data_points
      FROM commodity_prices
      WHERE commodity_type = $1 AND country_code = ANY($2)
        AND valid_from <= CURRENT_TIMESTAMP 
        AND (valid_to IS NULL OR valid_to > CURRENT_TIMESTAMP)
      GROUP BY commodity_type, commodity_name
    `;
    const result = await db.query(query, [commodityType, countryCodes]);
    return result.rows[0];
  },

  // Calculate basket total for a country
  async calculateBasketTotal(countryCode) {
    const query = `
      WITH latest_prices AS (
        SELECT DISTINCT ON (commodity_type) *
        FROM commodity_prices
        WHERE country_code = $1
          AND valid_from <= CURRENT_TIMESTAMP 
          AND (valid_to IS NULL OR valid_to > CURRENT_TIMESTAMP)
        ORDER BY commodity_type, valid_from DESC
      )
      SELECT 
        SUM(price) as basket_total,
        SUM(price_usd) as basket_total_usd,
        COUNT(*) as item_count,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'commodity_type', commodity_type,
            'commodity_name', commodity_name,
            'quantity', quantity,
            'unit', unit,
            'price', price,
            'price_usd', price_usd
          ) ORDER BY commodity_type
        ) as items
      FROM latest_prices
    `;
    const result = await db.query(query, [countryCode]);
    return result.rows[0];
  },

  // Clean old prices
  async cleanOldPrices(daysToKeep = 90) {
    const query = `
      DELETE FROM commodity_prices
      WHERE created_at < CURRENT_DATE - INTERVAL '${daysToKeep} days'
        AND id NOT IN (
          SELECT DISTINCT ON (commodity_type, country_code) id
          FROM commodity_prices
          ORDER BY commodity_type, country_code, valid_from DESC
        )
    `;
    const result = await db.query(query);
    return { deleted: result.rowCount };
  }
};

export default CommodityPrice;
