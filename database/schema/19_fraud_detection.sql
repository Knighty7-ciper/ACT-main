-- REAL Fraud Detection System Tables
-- No mock data - actual fraud detection infrastructure

-- Fraud alerts from real transaction analysis
DROP TABLE IF EXISTS fraud_alerts CASCADE;
CREATE TABLE fraud_alerts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL,
  transaction_id          uuid NULL,
  alert_type              varchar NOT NULL, -- 'high_risk', 'suspicious_pattern', 'velocity_check', 'geographic_anomaly'
  severity                varchar NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  confidence_score        numeric(5,2) NOT NULL, -- 0.00 to 100.00
  risk_score              numeric(5,2) NOT NULL, -- 0.00 to 100.00
  description             text NOT NULL,
  risk_factors            jsonb NOT NULL DEFAULT '[]',
  suggested_actions       jsonb NOT NULL DEFAULT '[]',
  status                  varchar NOT NULL DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'false_positive'
  assigned_to             uuid NULL, -- admin user ID
  resolved_at             timestamptz NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_fraud_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fraud_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  CONSTRAINT fk_fraud_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- User risk profiles based on real transaction patterns
DROP TABLE IF EXISTS user_risk_profiles CASCADE;
CREATE TABLE user_risk_profiles (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL UNIQUE,
  overall_risk_score      numeric(5,2) NOT NULL DEFAULT 0.00,
  transaction_risk        numeric(5,2) NOT NULL DEFAULT 0.00,
  behavioral_risk         numeric(5,2) NOT NULL DEFAULT 0.00,
  geographic_risk         numeric(5,2) NOT NULL DEFAULT 0.00,
  velocity_risk           numeric(5,2) NOT NULL DEFAULT 0.00,
  last_transaction_count  integer NOT NULL DEFAULT 0,
  last_24h_transaction_count integer NOT NULL DEFAULT 0,
  avg_transaction_amount  numeric(18,8) NOT NULL DEFAULT 0,
  risk_level              varchar NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  is_flagged              boolean NOT NULL DEFAULT false,
  flagged_at              timestamptz NULL,
  unflagged_at            timestamptz NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_risk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transaction risk analysis results
DROP TABLE IF EXISTS transaction_risk_analysis CASCADE;
CREATE TABLE transaction_risk_analysis (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id          uuid NOT NULL,
  user_id                 uuid NOT NULL,
  risk_score              numeric(5,2) NOT NULL,
  approved                boolean NOT NULL,
  requires_review         boolean NOT NULL DEFAULT false,
  risk_factors            jsonb NOT NULL DEFAULT '[]',
  velocity_score          numeric(5,2) NOT NULL DEFAULT 0,
  geographic_score        numeric(5,2) NOT NULL DEFAULT 0,
  behavioral_score        numeric(5,2) NOT NULL DEFAULT 0,
  amount_deviation_score  numeric(5,2) NOT NULL DEFAULT 0,
  device_fingerprint      varchar NULL,
  ip_address              varchar NULL,
  user_agent              text NULL,
  location_lat            numeric(10,6) NULL,
  location_lng            numeric(10,6) NULL,
  country_code            varchar(2) NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_analysis_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  CONSTRAINT fk_analysis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Fraud detection patterns and rules
DROP TABLE IF EXISTS fraud_patterns CASCADE;
CREATE TABLE fraud_patterns (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    varchar NOT NULL,
  description             text NOT NULL,
  pattern_type            varchar NOT NULL, -- 'velocity', 'geographic', 'amount', 'behavioral', 'device'
  pattern_conditions      jsonb NOT NULL,
  confidence_threshold    numeric(5,2) NOT NULL DEFAULT 70.00,
  is_active               boolean NOT NULL DEFAULT true,
  detection_count         integer NOT NULL DEFAULT 0,
  false_positive_count    integer NOT NULL DEFAULT 0,
  success_rate            numeric(5,2) NOT NULL DEFAULT 0.00,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Real-time transaction monitoring rules
DROP TABLE IF EXISTS transaction_monitoring_rules CASCADE;
CREATE TABLE transaction_monitoring_rules (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name               varchar NOT NULL,
  rule_type               varchar NOT NULL, -- 'threshold', 'pattern', 'frequency'
  conditions              jsonb NOT NULL,
  actions                 jsonb NOT NULL DEFAULT '[]', -- 'block', 'flag', 'require_review', 'alert_admin'
  severity_threshold      varchar NOT NULL DEFAULT 'medium',
  is_active               boolean NOT NULL DEFAULT true,
  execution_count         integer NOT NULL DEFAULT 0,
  last_executed           timestamptz NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_fraud_user ON fraud_alerts (user_id);
CREATE INDEX idx_fraud_status ON fraud_alerts (status);
CREATE INDEX idx_fraud_severity ON fraud_alerts (severity);
CREATE INDEX idx_fraud_created ON fraud_alerts (created_at DESC);

CREATE INDEX idx_risk_user ON user_risk_profiles (user_id);
CREATE INDEX idx_risk_score ON user_risk_profiles (overall_risk_score DESC);
CREATE INDEX idx_risk_flagged ON user_risk_profiles (is_flagged);
CREATE INDEX idx_risk_level ON user_risk_profiles (risk_level);

CREATE INDEX idx_analysis_transaction ON transaction_risk_analysis (transaction_id);
CREATE INDEX idx_analysis_user ON transaction_risk_analysis (user_id);
CREATE INDEX idx_analysis_risk ON transaction_risk_analysis (risk_score DESC);
CREATE INDEX idx_analysis_approved ON transaction_risk_analysis (approved);
CREATE INDEX idx_analysis_review ON transaction_risk_analysis (requires_review);

CREATE INDEX idx_patterns_active ON fraud_patterns (is_active);
CREATE INDEX idx_patterns_type ON fraud_patterns (pattern_type);

CREATE INDEX idx_monitoring_active ON transaction_monitoring_rules (is_active);
CREATE INDEX idx_monitoring_type ON transaction_monitoring_rules (rule_type);

-- Insert real fraud detection patterns
INSERT INTO fraud_patterns (name, description, pattern_type, pattern_conditions, confidence_threshold) VALUES
('Rapid Transaction Velocity', 'Multiple transactions within short time period', 'velocity', 
 '{"max_transactions_per_hour": 10, "max_transactions_per_day": 50}', 85.00),
('High Amount Deviation', 'Transaction amount significantly higher than user average', 'amount',
 '{"max_deviation_multiplier": 5.0, "min_amount_threshold": 10000}', 75.00),
('Geographic Anomaly', 'Transaction from unusual or high-risk location', 'geographic',
 '{"high_risk_countries": ["NG", "GH"], "unusual_location_radius": 500}', 70.00),
('Device Pattern Change', 'Transaction from unrecognized device', 'behavioral',
 '{"new_device_threshold": 1, "device_trust_days": 30}', 60.00),
('Repeated Failed Attempts', 'Multiple failed transactions followed by success', 'behavioral',
 '{"max_failed_attempts": 3, "time_window_minutes": 15}', 80.00);

-- Insert real monitoring rules
INSERT INTO transaction_monitoring_rules (rule_name, rule_type, conditions, actions, severity_threshold) VALUES
('High Value Transaction Review', 'threshold', 
 '{"min_amount": 50000, "require_review": true}',
 '["require_review", "alert_admin"]', 'high'),
('Velocity Pattern Check', 'frequency',
 '{"max_per_hour": 10, "block_threshold": 20}',
 '["flag", "block"]', 'medium'),
('Geographic Risk Check', 'pattern',
 '{"risky_countries": ["NG"], "action": "review"}',
 '["require_review"]', 'medium'),
('New User High Amount', 'threshold',
 '{"account_age_days_max": 7, "min_amount": 10000}',
 '["flag", "require_review"]', 'high');