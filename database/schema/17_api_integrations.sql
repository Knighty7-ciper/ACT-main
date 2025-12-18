-- ==========================================
-- API INTEGRATIONS DATABASE SCHEMA
-- ==========================================
-- Supporting tables for Exchange Rate API, Resend Email API, 
-- Sentry Error Monitoring, and Stellar Labs Blockchain integration
-- 
-- Author: MiniMax Agent
-- Date: 2025-10-30

-- ==========================================
-- EXCHANGE RATE API TABLES
-- ==========================================

-- Exchange rate updates tracking
CREATE TABLE IF NOT EXISTS exchange_rate_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_used text NOT NULL,
    base_currency varchar(10) NOT NULL,
    target_currency varchar(10) NOT NULL,
    rate numeric(18,8) NOT NULL,
    source text NOT NULL DEFAULT 'exchangerate-api.com',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes')
);

-- Indexes for exchange rate queries
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rate_updates(base_currency, target_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_created ON exchange_rate_updates(created_at);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_expires ON exchange_rate_updates(expires_at);

-- ==========================================
-- RESEND EMAIL API TABLES  
-- ==========================================

-- Email logs tracking
CREATE TABLE IF NOT EXISTS email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email varchar(255) NOT NULL,
    subject varchar(500) NOT NULL,
    template_used varchar(100),
    email_type varchar(50) NOT NULL, -- authorization, notification, welcome, etc.
    status varchar(20) NOT NULL, -- sent, delivered, bounced, failed
    resend_message_id varchar(255),
    error_message text,
    template_data jsonb DEFAULT '{}',
    admin_triggered_by uuid, -- Admin user who triggered this email
    user_id uuid, -- Target user for the email
    sent_at timestamptz NOT NULL DEFAULT now(),
    delivered_at timestamptz,
    bounced_at timestamptz,
    opened_at timestamptz,
    clicked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for email tracking
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_admin ON email_logs(admin_triggered_by);
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);

-- Email template management
CREATE TABLE IF NOT EXISTS email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name varchar(100) NOT NULL UNIQUE,
    template_type varchar(50) NOT NULL,
    subject_template text NOT NULL,
    html_template text NOT NULL,
    variables jsonb DEFAULT '[]', -- Array of expected variables
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid
);

-- Insert default email templates
INSERT INTO email_templates (template_name, template_type, subject_template, html_template, variables) VALUES
('admin_authorization', 'authorization', '🔐 Authorization Required: {{request_title}}', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">{{email_content}}</div>', 
 '["user_name", "request_title", "admin_email", "authorization_link", "reason"]'),
 
('user_notification', 'notification', '🔔 Notification: {{notification_type}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">{{email_content}}</div>',
 '["user_name", "notification_type", "message", "action_link"]'),

('welcome_email', 'welcome', '🎉 Welcome to AfriLink Platform!',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">{{email_content}}</div>',
 '["user_name", "platform_name", "get_started_link"]'),

('payment_confirmation', 'payment', '💰 Payment Confirmed - ACT Tokens Purchased',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">{{email_content}}</div>',
 '["user_name", "amount", "currency", "act_tokens", "transaction_id", "wallet_address"]')
ON CONFLICT (template_name) DO NOTHING;

-- ==========================================
-- SENTRY ERROR MONITORING TABLES
-- ==========================================

-- Error logs for comprehensive tracking
CREATE TABLE IF NOT EXISTS error_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type varchar(100) NOT NULL,
    error_message text NOT NULL,
    stack_trace text,
    error_context jsonb DEFAULT '{}',
    user_id uuid, -- User who experienced the error
    admin_id uuid, -- Admin user if admin-related error
    session_id varchar(255),
    ip_address inet,
    user_agent text,
    url text,
    component varchar(100), -- react, api, edge, etc.
    severity varchar(20) NOT NULL DEFAULT 'error', -- trace, debug, info, warning, error, fatal
    sentry_event_id varchar(255),
    sentry_group_id varchar(255),
    resolved boolean NOT NULL DEFAULT false,
    resolved_at timestamptz,
    resolved_by uuid,
    resolution_notes text,
    tags jsonb DEFAULT '{}',
    breadcrumbs jsonb DEFAULT '[]',
    environment varchar(50) DEFAULT 'development',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for error tracking
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_admin ON error_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_component ON error_logs(component);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_sentry ON error_logs(sentry_event_id);

-- Error frequency tracking to identify recurring issues
CREATE TABLE IF NOT EXISTS error_frequency (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    error_hash varchar(64) NOT NULL, -- Hash of error signature
    error_signature varchar(500) NOT NULL, -- Simplified error description
    component varchar(100),
    first_occurrence timestamptz NOT NULL DEFAULT now(),
    last_occurrence timestamptz NOT NULL DEFAULT now(),
    occurrence_count integer NOT NULL DEFAULT 1,
    affected_users integer NOT NULL DEFAULT 0,
    resolved boolean NOT NULL DEFAULT false,
    priority_level varchar(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for error frequency analysis
CREATE UNIQUE INDEX IF NOT EXISTS idx_error_frequency_hash ON error_frequency(error_hash);
CREATE INDEX IF NOT EXISTS idx_error_frequency_occurrences ON error_frequency(occurrence_count DESC);
CREATE INDEX IF NOT EXISTS idx_error_frequency_priority ON error_frequency(priority_level);
CREATE INDEX IF NOT EXISTS idx_error_frequency_resolved ON error_frequency(resolved);

-- ==========================================
-- STELLAR BLOCKCHAIN TABLES
-- ==========================================

-- Enhanced wallets table with blockchain data
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS stellar_account_id varchar(56);
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS stellar_memo varchar(28);
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS blockchain_network varchar(20) DEFAULT 'testnet';
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS last_sync_at timestamptz;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS sync_status varchar(20) DEFAULT 'pending'; -- synced, pending, failed
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS encrypted_secret_key text;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS encrypted_recovery_phrase text;

-- Blockchain transactions table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id uuid REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    transaction_hash varchar(64) NOT NULL UNIQUE,
    transaction_type varchar(50) NOT NULL, -- ACT_DISTRIBUTION, TRANSFER, RECEIVE, CREATE_ACCOUNT
    operation_type varchar(50), -- payment, create_account, etc.
    amount numeric(18,8) NOT NULL,
    asset_code varchar(12) DEFAULT 'ACT',
    asset_issuer varchar(56),
    fee numeric(18,8) DEFAULT 0.0001,
    status varchar(20) NOT NULL DEFAULT 'pending', -- pending, success, failed, expired
    source_account varchar(56),
    destination_account varchar(56),
    memo varchar(28),
    block_number bigint,
    ledger_sequence integer,
    confirmation_count integer DEFAULT 0,
    max_confirmations integer DEFAULT 1,
    network varchar(20) DEFAULT 'testnet',
    api_response jsonb DEFAULT '{}',
    stellar_metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    confirmed_at timestamptz,
    failed_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for blockchain transactions
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_wallet ON blockchain_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_status ON blockchain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_type ON blockchain_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_created ON blockchain_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_confirmed ON blockchain_transactions(confirmed_at);

-- ACT token balances tracking
CREATE TABLE IF NOT EXISTS act_token_balances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id uuid REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    current_balance numeric(18,8) NOT NULL DEFAULT 0,
    available_balance numeric(18,8) NOT NULL DEFAULT 0,
    pending_balance numeric(18,8) NOT NULL DEFAULT 0,
    reserved_balance numeric(18,8) NOT NULL DEFAULT 0,
    total_distributed numeric(18,8) NOT NULL DEFAULT 0,
    total_received numeric(18,8) NOT NULL DEFAULT 0,
    total_sent numeric(18,8) NOT NULL DEFAULT 0,
    last_updated timestamptz NOT NULL DEFAULT now(),
    blockchain_last_sync timestamptz,
    sync_status varchar(20) DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for ACT token balances
CREATE UNIQUE INDEX IF NOT EXISTS idx_act_balances_wallet ON act_token_balances(wallet_id);
CREATE INDEX IF NOT EXISTS idx_act_balances_updated ON act_token_balances(last_updated);
CREATE INDEX IF NOT EXISTS idx_act_balances_sync ON act_token_balances(sync_status);

-- ==========================================
-- ADMIN AUTHORIZATION SYSTEM TABLES
-- ==========================================

-- Enhanced admin authorization requests
CREATE TABLE IF NOT EXISTS admin_authorization_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid REFERENCES admin_user_requests(id) ON DELETE CASCADE,
    authorization_token varchar(255) NOT NULL UNIQUE,
    authorization_type varchar(100) NOT NULL,
    proposed_changes jsonb NOT NULL DEFAULT '{}',
    reason text NOT NULL,
    admin_user_id uuid, -- Admin who initiated the request
    target_user_id uuid, -- User whose data will be modified
    target_table varchar(100), -- Which table will be modified
    operation_type varchar(50), -- UPDATE, DELETE, INSERT
    requires_confirmation boolean NOT NULL DEFAULT true,
    confirmation_count integer NOT NULL DEFAULT 1,
    confirmations_received integer NOT NULL DEFAULT 0,
    completed boolean NOT NULL DEFAULT false,
    executed_at timestamptz,
    token_expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
    email_sent_at timestamptz,
    email_delivered boolean DEFAULT false,
    email_opened_at timestamptz,
    email_clicked_at timestamptz,
    resend_count integer NOT NULL DEFAULT 0,
    max_resends integer NOT NULL DEFAULT 3,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for admin authorization
CREATE INDEX IF NOT EXISTS idx_admin_auth_request ON admin_authorization_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_admin_auth_token ON admin_authorization_requests(authorization_token);
CREATE INDEX IF NOT EXISTS idx_admin_auth_admin ON admin_authorization_requests(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_auth_user ON admin_authorization_requests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_auth_expires ON admin_authorization_requests(token_expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_auth_completed ON admin_authorization_requests(completed);

-- ==========================================
-- SYSTEM HEALTH MONITORING TABLES
-- ==========================================

-- API health monitoring
CREATE TABLE IF NOT EXISTS api_health_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name varchar(100) NOT NULL, -- exchange_rate, resend, sentry, stellar, pesapal
    endpoint text,
    status_code integer,
    response_time_ms integer,
    success boolean NOT NULL,
    error_message text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for API health
CREATE INDEX IF NOT EXISTS idx_api_health_service ON api_health_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_api_health_success ON api_health_logs(success);
CREATE INDEX IF NOT EXISTS idx_api_health_created ON api_health_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_health_response_time ON api_health_logs(response_time_ms);

-- System metrics aggregation
CREATE TABLE IF NOT EXISTS system_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name varchar(100) NOT NULL,
    metric_value numeric(18,8) NOT NULL,
    metric_unit varchar(50), -- ms, count, percentage, etc.
    service_component varchar(100), -- frontend, backend, database, api
    tags jsonb DEFAULT '{}',
    recorded_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for system metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_component ON system_metrics(service_component);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded ON system_metrics(recorded_at);

-- ==========================================
-- DATA RETENTION AND CLEANUP
-- ==========================================

-- Data retention policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name varchar(100) NOT NULL,
    policy_name varchar(100) NOT NULL,
    retention_days integer NOT NULL,
    archive_after_days integer, -- Optional archive period
    purge_after_days integer, -- Optional purge period
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default retention policies
INSERT INTO data_retention_policies (table_name, policy_name, retention_days, archive_after_days, purge_after_days) VALUES
('exchange_rate_updates', 'exchange_rate_cache', 7, NULL, 30),
('email_logs', 'email_tracking', 365, NULL, 1095),
('error_logs', 'error_monitoring', 90, 365, 1095),
('blockchain_transactions', 'blockchain_history', 2555, NULL, NULL), -- 7 years
('api_health_logs', 'api_monitoring', 30, NULL, 90),
('system_metrics', 'performance_metrics', 90, 365, 1095),
('admin_authorization_requests', 'admin_audit', 2555, NULL, NULL) -- 7 years
ON CONFLICT DO NOTHING;

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to clean up expired exchange rates
CREATE OR REPLACE FUNCTION cleanup_expired_exchange_rates()
RETURNS void AS $$
BEGIN
    DELETE FROM exchange_rate_updates 
    WHERE expires_at < now();
    
    RAISE NOTICE 'Cleaned up expired exchange rates at %', now();
END;
$$ LANGUAGE plpgsql;

-- Function to update error frequency
CREATE OR REPLACE FUNCTION update_error_frequency()
RETURNS trigger AS $$
DECLARE
    error_sig text;
    error_hash text;
    existing_record record;
BEGIN
    -- Create error signature (simplified)
    error_sig = LEFT(COALESCE(NEW.error_message, ''), 200);
    error_hash = encode(digest(error_sig || COALESCE(NEW.component, ''), 'sha256'), 'hex');
    
    -- Check if this error signature already exists
    SELECT * INTO existing_record 
    FROM error_frequency 
    WHERE error_hash = error_hash;
    
    IF FOUND THEN
        -- Update existing record
        UPDATE error_frequency SET
            occurrence_count = occurrence_count + 1,
            last_occurrence = now(),
            affected_users = CASE 
                WHEN user_id NOT IN (
                    SELECT DISTINCT user_id 
                    FROM error_logs 
                    WHERE error_hash = error_hash
                ) THEN affected_users + 1
                ELSE affected_users
            END,
            updated_at = now()
        WHERE error_hash = error_hash;
    ELSE
        -- Create new record
        INSERT INTO error_frequency (
            error_hash, error_signature, component, 
            first_occurrence, last_occurrence, occurrence_count
        ) VALUES (
            error_hash, error_sig, NEW.component,
            now(), now(), 1
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update error frequency
DROP TRIGGER IF EXISTS trigger_update_error_frequency ON error_logs;
CREATE TRIGGER trigger_update_error_frequency
    AFTER INSERT ON error_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_error_frequency();

-- Function to sync ACT token balance
CREATE OR REPLACE FUNCTION sync_act_balance(wallet_uuid uuid)
RETURNS void AS $$
DECLARE
    total_received numeric(18,8) := 0;
    total_sent numeric(18,8) := 0;
    current_balance numeric(18,8) := 0;
BEGIN
    -- Calculate total received
    SELECT COALESCE(SUM(amount), 0) INTO total_received
    FROM blockchain_transactions 
    WHERE wallet_id = wallet_uuid 
    AND transaction_type IN ('ACT_DISTRIBUTION', 'RECEIVE')
    AND status = 'success';
    
    -- Calculate total sent
    SELECT COALESCE(SUM(amount), 0) INTO total_sent
    FROM blockchain_transactions 
    WHERE wallet_id = wallet_uuid 
    AND transaction_type = 'TRANSFER'
    AND status = 'success';
    
    -- Calculate current balance
    current_balance = total_received - total_sent;
    
    -- Update or insert balance record
    INSERT INTO act_token_balances (
        wallet_id, current_balance, total_received, total_sent, 
        last_updated, blockchain_last_sync, sync_status
    ) VALUES (
        wallet_uuid, current_balance, total_received, total_sent,
        now(), now(), 'synced'
    )
    ON CONFLICT (wallet_id) DO UPDATE SET
        current_balance = excluded.current_balance,
        total_received = excluded.total_received,
        total_sent = excluded.total_sent,
        last_updated = excluded.last_updated,
        blockchain_last_sync = excluded.blockchain_last_sync,
        sync_status = excluded.sync_status,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- VIEWS FOR REPORTING
-- ==========================================

-- View for error dashboard
CREATE OR REPLACE VIEW error_dashboard AS
SELECT 
    COUNT(*) as total_errors,
    COUNT(DISTINCT user_id) as affected_users,
    COUNT(DISTINCT CASE WHEN created_at > now() - interval '24 hours' THEN id END) as errors_24h,
    COUNT(DISTINCT CASE WHEN created_at > now() - interval '7 days' THEN id END) as errors_7d,
    component,
    severity,
    COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_count
FROM error_logs 
GROUP BY component, severity
ORDER BY errors_24h DESC;

-- View for API health status
CREATE OR REPLACE VIEW api_health_status AS
SELECT 
    service_name,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN success = true THEN 1 END) as successful_calls,
    COUNT(CASE WHEN success = false THEN 1 END) as failed_calls,
    ROUND(AVG(response_time_ms), 2) as avg_response_time,
    MAX(response_time_ms) as max_response_time,
    COUNT(CASE WHEN created_at > now() - interval '1 hour' THEN 1 END) as calls_1h
FROM api_health_logs 
WHERE created_at > now() - interval '24 hours'
GROUP BY service_name
ORDER BY failed_calls DESC;

-- View for admin authorization overview
CREATE OR REPLACE VIEW admin_authorization_overview AS
SELECT 
    aar.*,
    aur.title as request_title,
    aur.request_type,
    aur.priority,
    up.email as target_user_email,
    admin_up.email as admin_email
FROM admin_authorization_requests aar
LEFT JOIN admin_user_requests aur ON aar.request_id = aur.id
LEFT JOIN user_profiles up ON aar.target_user_id = up.user_id
LEFT JOIN user_profiles admin_up ON aar.admin_user_id = admin_up.user_id
ORDER BY aar.created_at DESC;