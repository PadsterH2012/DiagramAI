-- DiagramAI Database Baseline Schema
-- This script creates the complete working database structure
-- Based on Prisma schema.prisma - provides a solid foundation

-- Set timezone and enable extensions
SET timezone = 'UTC';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    location VARCHAR(100),
    website_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language_preference VARCHAR(10) DEFAULT 'en',
    theme_preference VARCHAR(20) DEFAULT 'light',
    notification_preferences JSON DEFAULT '{}',
    privacy_settings JSON DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    device_info JSON,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM CONFIGURATION TABLES
-- ============================================================================

-- Application settings table
CREATE TABLE IF NOT EXISTS application_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    setting_type VARCHAR(20) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DIAGRAM TABLES
-- ============================================================================

-- Diagrams table
CREATE TABLE IF NOT EXISTS diagrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSON NOT NULL,
    format VARCHAR(20) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    template_category VARCHAR(50),
    agent_accessible BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diagram versions table
CREATE TABLE IF NOT EXISTS diagram_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSON NOT NULL,
    format VARCHAR(20) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    change_summary VARCHAR(500),
    change_type VARCHAR(20) DEFAULT 'manual',
    parent_version_id UUID REFERENCES diagram_versions(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(diagram_id, version_number)
);

-- Diagram collaborators table
CREATE TABLE IF NOT EXISTS diagram_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) NOT NULL,
    can_edit BOOLEAN DEFAULT false,
    can_comment BOOLEAN DEFAULT true,
    can_share BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    invited_by UUID NOT NULL REFERENCES users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    UNIQUE(diagram_id, user_id)
);

-- Diagram comments table
CREATE TABLE IF NOT EXISTS diagram_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES diagram_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text',
    position_data JSON,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MCP INTEGRATION TABLES
-- ============================================================================

-- Agent credentials table
CREATE TABLE IF NOT EXISTS agent_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) UNIQUE NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSON DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent operations table
CREATE TABLE IF NOT EXISTS agent_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) NOT NULL REFERENCES agent_credentials(agent_id) ON DELETE CASCADE,
    diagram_uuid UUID NOT NULL REFERENCES diagrams(uuid) ON DELETE CASCADE,
    operation VARCHAR(50) NOT NULL,
    operation_data JSON NOT NULL,
    result JSON,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    duration INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Diagram indexes
CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_uuid ON diagrams(uuid);
CREATE INDEX IF NOT EXISTS idx_diagrams_public ON diagrams(is_public);
CREATE INDEX IF NOT EXISTS idx_diagrams_template ON diagrams(is_template);
CREATE INDEX IF NOT EXISTS idx_diagrams_agent_accessible ON diagrams(agent_accessible);
CREATE INDEX IF NOT EXISTS idx_diagrams_created_at ON diagrams(created_at);

-- Agent operation indexes
CREATE INDEX IF NOT EXISTS idx_agent_operations_diagram_uuid ON agent_operations(diagram_uuid);
CREATE INDEX IF NOT EXISTS idx_agent_operations_agent_id ON agent_operations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_operations_timestamp ON agent_operations(timestamp);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default application settings
INSERT INTO application_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
    ('app_name', '"DiagramAI"', 'string', 'Application name', true),
    ('app_version', '"1.0.0"', 'string', 'Application version', true),
    ('max_diagrams_per_user', '100', 'number', 'Maximum diagrams per user', false),
    ('default_diagram_format', '"reactflow"', 'string', 'Default diagram format', false),
    ('enable_public_diagrams', 'true', 'boolean', 'Allow public diagrams', false),
    ('enable_collaboration', 'true', 'boolean', 'Enable collaboration features', false)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- COMPLETION LOG
-- ============================================================================

-- Create health check table for monitoring
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'healthy',
    last_check TIMESTAMPTZ DEFAULT NOW()
);

-- Insert baseline completion record
INSERT INTO health_check (status) VALUES ('baseline_complete') ON CONFLICT DO NOTHING;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'DiagramAI baseline schema created successfully at %', NOW();
    RAISE NOTICE 'Tables created: users, diagrams, application_settings, and all related tables';
    RAISE NOTICE 'Ready for production use - no migrations required for basic functionality';
END $$;
