-- DiagramAI Database Initialization Script
-- This script sets up the initial database structure

-- Create database if it doesn't exist (handled by Docker environment)
-- CREATE DATABASE IF NOT EXISTS diagramai_dev;

-- Set timezone
SET timezone = 'UTC';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial schema placeholder
-- Note: Actual schema will be managed by Prisma migrations

-- Create a simple health check table
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'healthy',
    last_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('initialized') ON CONFLICT DO NOTHING;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'DiagramAI database initialized successfully at %', NOW();
END $$;
