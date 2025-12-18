-- Product prices table for ACT PPP calculation
-- Stores actual market prices for products across African countries

CREATE TABLE IF NOT EXISTS product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    country_code VARCHAR(3) NOT NULL REFERENCES countries(country_code),
    currency_code VARCHAR(3) NOT NULL REFERENCES currencies(code),
    price_local DECIMAL(15,4) NOT NULL,
    usd_rate DECIMAL(10,4) NOT NULL, -- Exchange rate to USD at time of collection
    price_usd_normalized DECIMAL(15,6) GENERATED ALWAYS AS (price_local / usd_rate) STORED,
    data_source VARCHAR(100),
    collection_date DATE NOT NULL,
    market_type VARCHAR(20) DEFAULT 'retail', -- 'retail', 'wholesale', 'official'
    quality_grade VARCHAR(20) DEFAULT 'standard', -- 'premium', 'standard', 'basic'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, country_code, collection_date)
);

-- Create indexes
CREATE INDEX idx_product_prices_product_country ON product_prices(product_id, country_code);
CREATE INDEX idx_product_prices_collection_date ON product_prices(collection_date);
CREATE INDEX idx_product_prices_active ON product_prices(is_active);

-- Country weights table for ACT calculation
-- Composite weights based on GDP and population

CREATE TABLE IF NOT EXISTS country_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(3) NOT NULL REFERENCES countries(country_code),
    country_name VARCHAR(100) NOT NULL,
    region VARCHAR(50), -- 'North Africa', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa'
    gdp_weight DECIMAL(8,6) NOT NULL,
    population_weight DECIMAL(8,6) NOT NULL,
    composite_weight DECIMAL(8,6) NOT NULL, -- (gdp_weight + population_weight) / 2
    economic_tier VARCHAR(20), -- 'developed', 'emerging', 'developing'
    is_active BOOLEAN DEFAULT true,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_code, calculated_at::date)
);

-- Create indexes
CREATE INDEX idx_country_weights_composite ON country_weights(composite_weight);
CREATE INDEX idx_country_weights_region ON country_weights(region);

-- Category weights table for ACT calculation
-- Fixed weights for product categories

CREATE TABLE IF NOT EXISTS category_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(50) UNIQUE NOT NULL,
    weight DECIMAL(5,4) NOT NULL, -- 0.4500, 0.3000, etc.
    description TEXT,
    calculation_method VARCHAR(50) DEFAULT 'household_survey', -- 'household_survey', 'trade_volume', 'strategic_importance'
    is_active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_category_weights_active ON category_weights(is_active);
CREATE INDEX idx_category_weights_effective ON category_weights(effective_from, effective_to);

-- Insert category weights based on ACT methodology
INSERT INTO category_weights (category_name, weight, description, calculation_method, effective_from) VALUES
('Staples', 0.4500, 'Essential food items - largest household expense', 'household_survey', '2025-01-01'),
('Energy', 0.3000, 'Fuel and energy - critical for economic activity', 'household_survey', '2025-01-01'),
('Telecom', 0.1500, 'Communication services - growing importance', 'household_survey', '2025-01-01'),
('Transport', 0.1000, 'Transportation - basic infrastructure', 'household_survey', '2025-01-01')
ON CONFLICT (category_name) DO NOTHING;