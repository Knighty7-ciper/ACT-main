-- ACT price history table for PPP-based calculations
-- Stores ACT values calculated using PPP methodology

CREATE TABLE IF NOT EXISTS act_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    act_value DECIMAL(15,6) NOT NULL, -- Final ACT value in USD equivalent
    calculation_date DATE NOT NULL,
    calculation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Component breakdown
    staples_component DECIMAL(15,6) DEFAULT 0,
    energy_component DECIMAL(15,6) DEFAULT 0,
    telecom_component DECIMAL(15,6) DEFAULT 0,
    transport_component DECIMAL(15,6) DEFAULT 0,
    
    -- Metadata
    total_products_processed INTEGER DEFAULT 0,
    total_countries_included INTEGER DEFAULT 0,
    total_price_data_points INTEGER DEFAULT 0,
    average_price_variance DECIMAL(15,8) DEFAULT 0,
    
    -- Quality metrics
    data_completeness_score DECIMAL(5,4) DEFAULT 0, -- 0.0000 to 1.0000
    calculation_method VARCHAR(50) DEFAULT 'PPP_WEIGHTED_AVERAGE',
    
    -- External factors
    inflation_adjustment_factor DECIMAL(8,6) DEFAULT 1.0,
    volatility_index DECIMAL(8,6) DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100), -- 'system', 'admin_user_id', 'api_call'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(calculation_date)
);

-- Create indexes
CREATE INDEX idx_act_price_history_date ON act_price_history(calculation_date DESC);
CREATE INDEX idx_act_price_history_active ON act_price_history(is_active);
CREATE INDEX idx_act_price_history_value ON act_price_history(act_value);

-- Product parity results table
-- Stores calculated parity values for each product across countries

CREATE TABLE IF NOT EXISTS product_parity_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL,
    
    -- Parity metrics
    weighted_avg_usd DECIMAL(15,6) NOT NULL,
    simple_avg_usd DECIMAL(15,6) NOT NULL,
    standard_deviation DECIMAL(15,8) DEFAULT 0,
    min_price_usd DECIMAL(15,6) DEFAULT 0,
    max_price_usd DECIMAL(15,6) DEFAULT 0,
    price_variance DECIMAL(15,8) DEFAULT 0,
    
    -- Country coverage
    countries_included INTEGER DEFAULT 0,
    data_points_count INTEGER DEFAULT 0,
    
    -- Quality indicators
    data_quality_score DECIMAL(5,4) DEFAULT 0,
    outlier_flag BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, calculation_date)
);

-- Create indexes
CREATE INDEX idx_product_parity_product ON product_parity_results(product_id);
CREATE INDEX idx_product_parity_date ON product_parity_results(calculation_date);
CREATE INDEX idx_product_parity_quality ON product_parity_results(data_quality_score);

-- Product price validation table
-- Tracks data quality and validation results

CREATE TABLE IF NOT EXISTS product_price_validation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_price_id UUID NOT NULL REFERENCES product_prices(id) ON DELETE CASCADE,
    validation_date DATE NOT NULL,
    
    -- Validation checks
    range_check_passed BOOLEAN DEFAULT true,
    consistency_check_passed BOOLEAN DEFAULT true,
    temporal_check_passed BOOLEAN DEFAULT true,
    source_verification_passed BOOLEAN DEFAULT true,
    
    -- Issue tracking
    issue_type VARCHAR(50), -- 'outlier', 'missing_data', 'source_conflict', 'temporal_anomaly'
    issue_description TEXT,
    severity_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    action_taken VARCHAR(100), -- 'flagged', 'corrected', 'excluded', 'reviewed'
    
    -- Validation metadata
    validator_type VARCHAR(50) DEFAULT 'automated', -- 'automated', 'manual'
    validator_version VARCHAR(20) DEFAULT '1.0',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_price_id, validation_date)
);

-- Create indexes
CREATE INDEX idx_price_validation_product ON product_price_validation(product_price_id);
CREATE INDEX idx_price_validation_date ON product_price_validation(validation_date);
CREATE INDEX idx_price_validation_issues ON product_price_validation(issue_type);

-- External price feed configurations
CREATE TABLE IF NOT EXISTS external_price_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_name VARCHAR(100) NOT NULL UNIQUE,
    feed_type VARCHAR(50) NOT NULL, -- 'official_statistics', 'market_survey', 'vendor_api', 'regulatory'
    base_url VARCHAR(500),
    api_key_required BOOLEAN DEFAULT false,
    
    -- Product mapping
    supported_products JSONB, -- Array of product codes this feed supports
    supported_countries JSONB, -- Array of country codes this feed covers
    
    -- Update frequency
    update_frequency_hours INTEGER DEFAULT 24,
    last_update_attempt TIMESTAMP WITH TIME ZONE,
    last_successful_update TIMESTAMP WITH TIME ZONE,
    
    -- Quality metrics
    success_rate DECIMAL(5,4) DEFAULT 1.0,
    average_response_time_ms INTEGER DEFAULT 0,
    data_quality_score DECIMAL(5,4) DEFAULT 1.0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_external_feeds_active ON external_price_feeds(is_active);
CREATE INDEX idx_external_feeds_frequency ON external_price_feeds(update_frequency_hours);