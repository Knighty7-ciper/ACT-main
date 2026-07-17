import db from '../config/database.js';

const PPPValue = {
  // Create PPP values table
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ppp_values (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        country_code VARCHAR(3) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        basket_total DECIMAL(15, 4) NOT NULL,
        basket_total_usd DECIMAL(15, 4) NOT NULL,
        token_value DECIMAL(15, 8) NOT NULL,
        token_value_usd DECIMAL(15, 8) NOT NULL,
        inflation_rate DECIMAL(8, 4),
        volatility_index DECIMAL(8, 4),
        stability_score DECIMAL(5, 2),
        calculation_method VARCHAR(50) DEFAULT 'geometric_mean',
        data_points INTEGER DEFAULT 0,
        benchmark_country VARCHAR(3) DEFAULT 'USA',
        confidence_score DECIMAL(3, 2) DEFAULT 1.00,
        calculation_timestamp TIMESTAMP NOT NULL,
        effective_from TIMESTAMP NOT NULL,
        effective_to TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(country_code, calculation_timestamp)
      );
      
      CREATE INDEX IF NOT EXISTS idx_ppp_values_country ON ppp_values(country_code);
      CREATE INDEX IF NOT EXISTS idx_ppp_values_time ON ppp_values(calculation_timestamp);
    `;
    return db.query(query);
  },

  // Store PPP calculation result
  async recordPPPValue(pppData) {
    const {
      countryCode,
      currency,
      basketTotal,
      basketTotalUsd,
      tokenValue,
      tokenValueUsd,
      inflationRate,
      volatilityIndex,
      stabilityScore,
      calculationMethod,
      dataPoints,
      benchmarkCountry,
      confidenceScore,
      effectiveFrom,
      effectiveTo
    } = pppData;

    const query = `
      INSERT INTO ppp_values (
        country_code, currency, basket_total, basket_total_usd,
        token_value, token_value_usd, inflation_rate, volatility_index,
        stability_score, calculation_method, data_points, benchmark_country,
        confidence_score, calculation_timestamp, effective_from, effective_to
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, $14, $15)
      RETURNING *
    `;

    const result = await db.query(query, [
      countryCode,
      currency,
      basketTotal,
      basketTotalUsd,
      tokenValue,
      tokenValueUsd,
      inflationRate,
      volatilityIndex,
      stabilityScore,
      calculationMethod || 'geometric_mean',
      dataPoints || 0,
      benchmarkCountry || 'USA',
      confidenceScore || 1.0,
      effectiveFrom || new Date(),
      effectiveTo
    ]);

    return result.rows[0];
  },

  // Get latest PPP value for a country
  async getLatestByCountry(countryCode) {
    const query = `
      SELECT *
      FROM ppp_values
      WHERE country_code = $1
        AND effective_from <= CURRENT_TIMESTAMP 
        AND (effective_to IS NULL OR effective_to > CURRENT_TIMESTAMP)
      ORDER BY calculation_timestamp DESC
      LIMIT 1
    `;
    const result = await db.query(query, [countryCode]);
    return result.rows[0];
  },

  // Get PPP value at specific timestamp
  async getByTimestamp(countryCode, timestamp) {
    const query = `
      SELECT *
      FROM ppp_values
      WHERE country_code = $1
        AND effective_from <= $2
        AND (effective_to IS NULL OR effective_to > $2)
      ORDER BY calculation_timestamp DESC
      LIMIT 1
    `;
    const result = await db.query(query, [countryCode, timestamp]);
    return result.rows[0];
  },

  // Get PPP history for a country
  async getHistory(countryCode, days = 30) {
    const query = `
      SELECT *
      FROM ppp_values
      WHERE country_code = $1
        AND calculation_timestamp >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY calculation_timestamp ASC
    `;
    const result = await db.query(query, [countryCode]);
    return result.rows;
  },

  // Get all latest PPP values
  async getAllLatest() {
    const query = `
      SELECT DISTINCT ON (country_code) *
      FROM ppp_values
      WHERE effective_from <= CURRENT_TIMESTAMP 
        AND (effective_to IS NULL OR effective_to > CURRENT_TIMESTAMP)
      ORDER BY country_code, calculation_timestamp DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Calculate ACT token amount for basket purchase
  async calculateTokenAmount(countryCode, basketValue) {
    const pppValue = await PPPValue.getLatestByCountry(countryCode);
    if (!pppValue) {
      throw new Error('No PPP value available for this country');
    }

    // Calculate how many ACT tokens needed for the basket
    const tokenAmount = basketValue / pppValue.token_value;
    
    return {
      basketValue,
      tokenAmount,
      tokenValue: pppValue.token_value,
      tokenValueUsd: pppValue.token_value_usd,
      countryCode,
      calculationTimestamp: new Date()
    };
  },

  // Get global comparison
  async getGlobalComparison() {
    const query = `
      SELECT DISTINCT ON (country_code) *
      FROM ppp_values
      WHERE effective_from <= CURRENT_TIMESTAMP 
        AND (effective_to IS NULL OR effective_to > CURRENT_TIMESTAMP)
      ORDER BY country_code, calculation_timestamp DESC
    `;
    const result = await db.query(query);
    
    // Calculate global statistics
    const values = result.rows;
    const stats = {
      totalCountries: values.length,
      highestBasketTotal: null,
      lowestBasketTotal: null,
      averageTokenValue: null,
      volatilityDistribution: { low: 0, medium: 0, high: 0 }
    };

    if (values.length > 0) {
      const sortedByBasket = [...values].sort((a, b) => b.basket_total - a.basket_total);
      stats.highestBasketTotal = sortedByBasket[0];
      stats.lowestBasketTotal = sortedByBasket[sortedByBasket.length - 1];
      
      const avgTokenValue = values.reduce((sum, v) => sum + parseFloat(v.token_value), 0) / values.length;
      stats.averageTokenValue = avgTokenValue;

      // Categorize volatility
      values.forEach(v => {
        const volatility = parseFloat(v.volatility_index || 0);
        if (volatility < 0.05) stats.volatilityDistribution.low++;
        else if (volatility < 0.15) stats.volatilityDistribution.medium++;
        else stats.volatilityDistribution.high++;
      });
    }

    return { countries: values, statistics: stats };
  },

  // Calculate stability index for a country
  async calculateStabilityIndex(countryCode) {
    const history = await PPPValue.getHistory(countryCode, 90);
    
    if (history.length < 2) {
      return { score: null, status: 'insufficient_data' };
    }

    // Calculate volatility (standard deviation of token value)
    const values = history.map(h => parseFloat(h.token_value));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance) / mean;

    // Calculate trend (simple linear regression)
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    values.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const trend = slope / mean; // Normalized trend

    // Calculate stability score (inverse of volatility adjusted for trend)
    const stabilityScore = Math.max(0, Math.min(100, (1 - volatility) * 100 - Math.abs(trend) * 50));

    return {
      score: parseFloat(stabilityScore.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(6)),
      trend: parseFloat(trend.toFixed(6)),
      status: stabilityScore > 70 ? 'stable' : stabilityScore > 40 ? 'moderate' : 'unstable',
      dataPoints: history.length
    };
  },

  // Get countries by stability ranking
  async getStabilityRanking(limit = 20) {
    const query = `
      SELECT DISTINCT ON (country_code) *
      FROM ppp_values
      WHERE effective_from <= CURRENT_TIMESTAMP 
        AND (effective_to IS NULL OR effective_to > CURRENT_TIMESTAMP)
      ORDER BY country_code, calculation_timestamp DESC
    `;
    const result = await db.query(query);
    
    // Sort by stability score
    const sorted = result.rows.sort((a, b) => 
      parseFloat(b.stability_score || 0) - parseFloat(a.stability_score || 0)
    );

    return sorted.slice(0, limit);
  }
};

export default PPPValue;
