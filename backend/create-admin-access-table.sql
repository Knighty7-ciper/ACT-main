-- Admin Access Table Creation Script
-- Run this SQL script in your PostgreSQL database

-- Create admin_access table
CREATE TABLE IF NOT EXISTS "admin_access" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "question" character varying NOT NULL,
  "answer" character varying NOT NULL,
  "requiredClicks" integer NOT NULL DEFAULT 4,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_admin_access" PRIMARY KEY ("id")
);

-- Insert the default admin access question and answer
INSERT INTO "admin_access" ("question", "answer", "requiredClicks", "isActive") 
VALUES ('WHATS THE NAME?', 'HOME SWEET COFFEE', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Verify the insertion
SELECT * FROM "admin_access" WHERE "isActive" = true;