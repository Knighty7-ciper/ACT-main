-- Create audit_logs table for comprehensive admin action tracking
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE IF NOT EXISTS audit_logs (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id                uuid NULL,
  admin_email             varchar NULL,
  action_type             varchar NOT NULL,
  category                varchar NOT NULL,
  details                 jsonb NOT NULL DEFAULT '{}',
  timestamp               timestamptz NOT NULL DEFAULT now(),
  success                 boolean NOT NULL DEFAULT true,
  ip_address              varchar NULL,
  user_agent              text NULL,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs (category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_email ON audit_logs (admin_email);

-- Create system_config table for system configuration management
DROP TABLE IF EXISTS system_config CASCADE;

CREATE TABLE IF NOT EXISTS system_config (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key   varchar NOT NULL UNIQUE,
  config_value text NOT NULL,
  description  text NULL,
  category     varchar NOT NULL DEFAULT 'general',
  is_encrypted boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for system_config
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config (category);

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description, category) VALUES 
('maintenance_mode', 'null', 'System maintenance mode status', 'system'),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'system'),
('session_timeout', '86400', 'Session timeout in seconds (24 hours)', 'security'),
('enable_email_notifications', 'true', 'Enable email notifications', 'notifications'),
('default_currency', 'USD', 'Default currency for the platform', 'general'),
('kyc_required', 'true', 'KYC verification required for transactions', 'kyc'),
('backup_frequency', '24', 'Database backup frequency in hours', 'system'),
('max_retry_attempts', '3', 'Maximum retry attempts for failed operations', 'system');

-- Create KYC documents table (for future enhancement)
DROP TABLE IF EXISTS kyc_documents CASCADE;

CREATE TABLE IF NOT EXISTS kyc_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  document_type   varchar NOT NULL,
  file_name       varchar NOT NULL,
  file_path       varchar NOT NULL,
  file_size       integer NOT NULL,
  mime_type       varchar NOT NULL,
  status          varchar NOT NULL DEFAULT 'pending',
  review_notes    text NULL,
  reviewed_by     uuid NULL,
  reviewed_at     timestamptz NULL,
  rejection_reason text NULL,
  uploaded_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_kyc_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_kyc_documents_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for kyc_documents
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents (status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_type ON kyc_documents (document_type);

-- Add RLS (Row Level Security) policies for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow admin users to read all audit logs
CREATE POLICY "Admin users can read all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'bknglabs.dev@gmail.com'
    )
  );

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Allow admin users to read system config
CREATE POLICY "Admin users can read system config" ON system_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'bknglabs.dev@gmail.com'
    )
  );

-- Allow admin users to update system config
CREATE POLICY "Admin users can update system config" ON system_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'bknglabs.dev@gmail.com'
    )
  );

-- Allow admin users to manage KYC documents
CREATE POLICY "Admin users can read all KYC documents" ON kyc_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'bknglabs.dev@gmail.com'
    )
  );

CREATE POLICY "Admin users can update KYC documents" ON kyc_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'bknglabs.dev@gmail.com'
    )
  );

-- Create functions for admin operations
CREATE OR REPLACE FUNCTION is_auto_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = user_uuid 
    AND users.email = 'bknglabs.dev@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to automatically log user updates
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log significant user changes for audit trail
  IF TG_OP = 'UPDATE' THEN
    -- Check if important fields changed
    IF OLD.is_active IS DISTINCT FROM NEW.is_active OR 
       OLD.is_email_verified IS DISTINCT FROM NEW.is_email_verified OR
       OLD.role IS DISTINCT FROM NEW.role THEN
      
      INSERT INTO audit_logs (
        admin_id,
        action_type,
        category,
        details,
        timestamp,
        success
      ) VALUES (
        NULL, -- system-initiated
        'user_status_change',
        'user_management',
        json_build_object(
          'user_id', NEW.id,
          'email', NEW.email,
          'field_changed', TG_ARGV[0],
          'old_value', CASE WHEN TG_ARGV[0] = 'is_active' THEN OLD.is_active::text
                           WHEN TG_ARGV[0] = 'is_email_verified' THEN OLD.is_email_verified::text
                           WHEN TG_ARGV[0] = 'role' THEN OLD.role
                           END,
          'new_value', CASE WHEN TG_ARGV[0] = 'is_active' THEN NEW.is_active::text
                           WHEN TG_ARGV[0] = 'is_email_verified' THEN NEW.is_email_verified::text
                           WHEN TG_ARGV[0] = 'role' THEN NEW.role
                           END
        ),
        now(),
        true
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for user changes
CREATE TRIGGER user_status_change_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_changes('status_change');