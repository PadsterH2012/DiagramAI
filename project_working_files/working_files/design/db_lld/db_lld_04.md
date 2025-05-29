# Database LLD 04: Data Validation Rules and Business Logic

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Database Validation  
**Domain:** Database Architecture  
**Coverage Area:** Data validation rules, business logic constraints, data integrity  
**Prerequisites:** db_lld_01.md, db_lld_02.md, db_lld_03.md  

## Purpose and Scope

This document defines comprehensive data validation rules and business logic constraints for the DiagramAI database. It establishes data integrity rules, validation patterns, and business rule enforcement that ensure data quality and application logic consistency at the database level.

**Coverage Areas in This Document:**
- Input validation and data format constraints
- Business rule enforcement through database constraints
- Data integrity validation functions
- Content validation for diagram formats
- Security validation and sanitization rules

**Related LLD Files:**
- db_lld_01.md: Core schema design and user management
- db_lld_02.md: Diagram data models and content storage
- db_lld_03.md: Entity relationships and foreign key constraints
- db_lld_05.md: Indexing strategies and query optimization

## Validation Strategy Overview

### Multi-Layer Validation Approach
1. **Database Level**: Constraints, triggers, and functions
2. **Application Level**: ORM validation and business logic
3. **API Level**: Request validation and sanitization
4. **Frontend Level**: User input validation and feedback

### Validation Principles
- **Fail Fast**: Catch invalid data as early as possible
- **Comprehensive**: Cover all data integrity scenarios
- **Performance**: Efficient validation without significant overhead
- **Security**: Prevent injection attacks and data corruption
- **User Experience**: Provide clear validation error messages

## User Data Validation

### 1. User Account Validation
```sql
-- Enhanced user validation constraints
ALTER TABLE users 
ADD CONSTRAINT chk_users_email_valid 
CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    char_length(email) <= 255 AND
    char_length(email) >= 5
);

ALTER TABLE users 
ADD CONSTRAINT chk_users_username_valid 
CHECK (
    username ~* '^[a-zA-Z0-9_-]{3,50}$' AND
    username NOT IN ('admin', 'root', 'system', 'api', 'www', 'mail', 'ftp')
);

ALTER TABLE users 
ADD CONSTRAINT chk_users_password_hash_valid 
CHECK (
    char_length(password_hash) >= 60 AND  -- bcrypt hash length
    password_hash ~ '^\$2[aby]\$[0-9]{2}\$'  -- bcrypt format
);

ALTER TABLE users 
ADD CONSTRAINT chk_users_name_valid 
CHECK (
    (first_name IS NULL OR (char_length(first_name) >= 1 AND char_length(first_name) <= 100)) AND
    (last_name IS NULL OR (char_length(last_name) >= 1 AND char_length(last_name) <= 100)) AND
    (display_name IS NULL OR (char_length(display_name) >= 1 AND char_length(display_name) <= 150))
);

-- Avatar URL validation
ALTER TABLE users 
ADD CONSTRAINT chk_users_avatar_url_valid 
CHECK (
    avatar_url IS NULL OR 
    (avatar_url ~* '^https?://[^\s/$.?#].[^\s]*\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?$' AND
     char_length(avatar_url) <= 500)
);

-- Function to validate user data before insert/update
CREATE OR REPLACE FUNCTION validate_user_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for email uniqueness (case-insensitive)
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE LOWER(email) = LOWER(NEW.email) 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'Email address already exists: %', NEW.email;
    END IF;
    
    -- Check for username uniqueness (case-insensitive)
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE LOWER(username) = LOWER(NEW.username) 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'Username already exists: %', NEW.username;
    END IF;
    
    -- Validate display name defaults to username if not provided
    IF NEW.display_name IS NULL OR trim(NEW.display_name) = '' THEN
        NEW.display_name := NEW.username;
    END IF;
    
    -- Update timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_user_data
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_data();
```

### 2. User Profile Validation
```sql
-- User profile validation constraints
ALTER TABLE user_profiles 
ADD CONSTRAINT chk_user_profiles_bio_length 
CHECK (bio IS NULL OR char_length(bio) <= 1000);

ALTER TABLE user_profiles 
ADD CONSTRAINT chk_user_profiles_location_valid 
CHECK (
    location IS NULL OR 
    (char_length(location) >= 2 AND char_length(location) <= 100)
);

ALTER TABLE user_profiles 
ADD CONSTRAINT chk_user_profiles_website_valid 
CHECK (
    website_url IS NULL OR 
    (website_url ~* '^https?://[^\s/$.?#].[^\s]*$' AND
     char_length(website_url) <= 300)
);

-- Validate JSONB preferences structure
CREATE OR REPLACE FUNCTION validate_user_preferences(preferences JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validate notification preferences structure
    IF preferences ? 'notifications' THEN
        IF NOT (preferences->'notifications' ? 'email' AND 
                preferences->'notifications' ? 'browser' AND
                jsonb_typeof(preferences->'notifications'->'email') = 'boolean' AND
                jsonb_typeof(preferences->'notifications'->'browser') = 'boolean') THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Validate privacy settings structure
    IF preferences ? 'privacy' THEN
        IF NOT (preferences->'privacy' ? 'profile_visibility' AND 
                preferences->'privacy'->'profile_visibility' IN ('"public"', '"private"', '"friends"')) THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE user_profiles 
ADD CONSTRAINT chk_user_profiles_notification_prefs 
CHECK (validate_user_preferences(notification_preferences));

ALTER TABLE user_profiles 
ADD CONSTRAINT chk_user_profiles_privacy_settings 
CHECK (validate_user_preferences(privacy_settings));
```

## Diagram Content Validation

### 1. Diagram Metadata Validation
```sql
-- Diagram validation constraints
ALTER TABLE diagrams 
ADD CONSTRAINT chk_diagrams_title_valid 
CHECK (
    char_length(trim(title)) >= 1 AND 
    char_length(title) <= 255 AND
    title !~ '[<>"\''&]'  -- Prevent XSS characters
);

ALTER TABLE diagrams 
ADD CONSTRAINT chk_diagrams_description_valid 
CHECK (
    description IS NULL OR 
    (char_length(description) <= 2000 AND
     description !~ '[<>"\''&]')  -- Prevent XSS characters
);

-- Tags validation
ALTER TABLE diagrams 
ADD CONSTRAINT chk_diagrams_tags_valid 
CHECK (
    array_length(tags, 1) IS NULL OR 
    (array_length(tags, 1) <= 20 AND
     NOT EXISTS (
         SELECT 1 FROM unnest(tags) AS tag 
         WHERE char_length(tag) > 50 OR 
               char_length(tag) < 1 OR
               tag ~ '[<>"\''&]'
     ))
);

-- Template category validation
ALTER TABLE diagrams 
ADD CONSTRAINT chk_diagrams_template_category_valid 
CHECK (
    template_category IS NULL OR 
    template_category IN (
        'flowchart', 'sequence', 'class', 'state', 'entity_relationship',
        'network', 'organizational', 'process', 'system_architecture', 'other'
    )
);

-- Content size validation
ALTER TABLE diagrams 
ADD CONSTRAINT chk_diagrams_content_size 
CHECK (
    pg_column_size(content) <= 10485760  -- 10MB limit
);
```

### 2. Diagram Content Format Validation
```sql
-- React Flow content validation function
CREATE OR REPLACE FUNCTION validate_react_flow_content(content JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check required top-level properties
    IF NOT (content ? 'nodes' AND content ? 'edges') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate nodes array
    IF jsonb_typeof(content->'nodes') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Validate edges array
    IF jsonb_typeof(content->'edges') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check node structure (sample validation)
    IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(content->'nodes') AS node
        WHERE NOT (node ? 'id' AND node ? 'position' AND node ? 'data')
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check edge structure (sample validation)
    IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(content->'edges') AS edge
        WHERE NOT (edge ? 'id' AND edge ? 'source' AND edge ? 'target')
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Mermaid content validation function
CREATE OR REPLACE FUNCTION validate_mermaid_content(content JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check required properties
    IF NOT (content ? 'syntax' AND content ? 'type') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate syntax is string
    IF jsonb_typeof(content->'syntax') != 'string' THEN
        RETURN FALSE;
    END IF;
    
    -- Validate type is valid Mermaid diagram type
    IF NOT (content->>'type' IN (
        'flowchart', 'sequence', 'class', 'state', 'entity_relationship',
        'user_journey', 'gantt', 'pie', 'requirement', 'gitgraph'
    )) THEN
        RETURN FALSE;
    END IF;
    
    -- Check syntax length
    IF char_length(content->>'syntax') > 100000 THEN  -- 100KB limit
        RETURN FALSE;
    END IF;
    
    -- Basic syntax validation (prevent script injection)
    IF content->>'syntax' ~* '<script|javascript:|data:|vbscript:' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Content validation trigger
CREATE OR REPLACE FUNCTION validate_diagram_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate content based on format
    IF NEW.format = 'react_flow' THEN
        IF NOT validate_react_flow_content(NEW.content) THEN
            RAISE EXCEPTION 'Invalid React Flow content structure';
        END IF;
    ELSIF NEW.format = 'mermaid' THEN
        IF NOT validate_mermaid_content(NEW.content) THEN
            RAISE EXCEPTION 'Invalid Mermaid content structure';
        END IF;
    ELSE
        RAISE EXCEPTION 'Unsupported diagram format: %', NEW.format;
    END IF;
    
    -- Generate content hash
    NEW.content_hash := encode(sha256(NEW.content::text::bytea), 'hex');
    
    -- Update timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_diagram_content
    BEFORE INSERT OR UPDATE ON diagrams
    FOR EACH ROW
    EXECUTE FUNCTION validate_diagram_content();
```

## Session and Security Validation

### 1. Session Validation
```sql
-- Session token validation
ALTER TABLE user_sessions 
ADD CONSTRAINT chk_user_sessions_token_format 
CHECK (
    char_length(session_token) >= 32 AND
    char_length(session_token) <= 255 AND
    session_token ~ '^[A-Za-z0-9+/=._-]+$'  -- Base64-like characters
);

-- Refresh token validation
ALTER TABLE user_sessions 
ADD CONSTRAINT chk_user_sessions_refresh_token_format 
CHECK (
    refresh_token IS NULL OR 
    (char_length(refresh_token) >= 32 AND
     char_length(refresh_token) <= 255 AND
     refresh_token ~ '^[A-Za-z0-9+/=._-]+$')
);

-- IP address validation
ALTER TABLE user_sessions 
ADD CONSTRAINT chk_user_sessions_ip_valid 
CHECK (
    ip_address IS NULL OR 
    (ip_address <<= '0.0.0.0/0'::inet)  -- Valid IPv4/IPv6
);

-- Device info validation
CREATE OR REPLACE FUNCTION validate_device_info(device_info JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check device info structure
    IF device_info IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Validate device info size
    IF pg_column_size(device_info) > 4096 THEN  -- 4KB limit
        RETURN FALSE;
    END IF;
    
    -- Check for required fields if present
    IF device_info ? 'browser' THEN
        IF NOT (jsonb_typeof(device_info->'browser') = 'string' AND
                char_length(device_info->>'browser') <= 100) THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE user_sessions 
ADD CONSTRAINT chk_user_sessions_device_info_valid 
CHECK (validate_device_info(device_info));

-- Session cleanup and validation function
CREATE OR REPLACE FUNCTION validate_user_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Check session expiry
    IF NEW.expires_at <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Session expiry time must be in the future';
    END IF;
    
    -- Limit session duration (max 30 days)
    IF NEW.expires_at > CURRENT_TIMESTAMP + INTERVAL '30 days' THEN
        RAISE EXCEPTION 'Session duration cannot exceed 30 days';
    END IF;
    
    -- Update last accessed time
    NEW.last_accessed_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_user_session
    BEFORE INSERT OR UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_session();
```

### 2. Password Reset Token Validation
```sql
-- Password reset token validation
ALTER TABLE password_reset_tokens 
ADD CONSTRAINT chk_password_reset_token_hash_format 
CHECK (
    char_length(token_hash) = 64 AND  -- SHA-256 hash length
    token_hash ~ '^[a-f0-9]{64}$'    -- Hexadecimal format
);

-- Token expiry validation (max 24 hours)
ALTER TABLE password_reset_tokens 
ADD CONSTRAINT chk_password_reset_expiry_limit 
CHECK (
    expires_at <= created_at + INTERVAL '24 hours'
);

-- Token validation function
CREATE OR REPLACE FUNCTION validate_password_reset_token()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure token expires in the future
    IF NEW.expires_at <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Password reset token must expire in the future';
    END IF;
    
    -- Check if user exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.user_id AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'Cannot create reset token for inactive user';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_password_reset_token
    BEFORE INSERT ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION validate_password_reset_token();
```

## Collaboration and Comment Validation

### 1. Collaboration Validation
```sql
-- Collaboration permission validation
ALTER TABLE diagram_collaborators 
ADD CONSTRAINT chk_diagram_collaborators_permission_hierarchy 
CHECK (
    (permission_level = 'viewer' AND can_edit = FALSE AND can_delete = FALSE) OR
    (permission_level = 'commenter' AND can_delete = FALSE) OR
    (permission_level = 'editor' AND can_delete = FALSE) OR
    (permission_level = 'admin')
);

-- Invitation expiry validation (max 30 days)
ALTER TABLE diagram_collaborators 
ADD CONSTRAINT chk_diagram_collaborators_expiry_limit 
CHECK (
    expires_at IS NULL OR 
    expires_at <= invited_at + INTERVAL '30 days'
);

-- Collaboration validation function
CREATE OR REPLACE FUNCTION validate_diagram_collaboration()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent self-collaboration
    IF NEW.user_id = NEW.invited_by THEN
        RAISE EXCEPTION 'Users cannot collaborate with themselves';
    END IF;
    
    -- Prevent owner collaboration
    IF EXISTS (
        SELECT 1 FROM diagrams 
        WHERE id = NEW.diagram_id AND user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'Diagram owners cannot be added as collaborators';
    END IF;
    
    -- Check if diagram is public for viewer permissions
    IF NEW.permission_level = 'viewer' THEN
        IF EXISTS (
            SELECT 1 FROM diagrams 
            WHERE id = NEW.diagram_id AND is_public = TRUE
        ) THEN
            RAISE NOTICE 'Adding viewer permission to public diagram is redundant';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_diagram_collaboration
    BEFORE INSERT OR UPDATE ON diagram_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION validate_diagram_collaboration();
```

### 2. Comment Validation
```sql
-- Comment content validation
ALTER TABLE diagram_comments 
ADD CONSTRAINT chk_diagram_comments_content_valid 
CHECK (
    char_length(trim(content)) >= 1 AND 
    char_length(content) <= 5000 AND
    content !~ '[<>"\''&]'  -- Prevent XSS characters
);

-- Position data validation
CREATE OR REPLACE FUNCTION validate_comment_position(position_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    IF position_data IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check position data structure
    IF NOT (position_data ? 'x' AND position_data ? 'y') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate coordinate types and ranges
    IF NOT (jsonb_typeof(position_data->'x') = 'number' AND
            jsonb_typeof(position_data->'y') = 'number' AND
            (position_data->>'x')::numeric BETWEEN -10000 AND 10000 AND
            (position_data->>'y')::numeric BETWEEN -10000 AND 10000) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE diagram_comments 
ADD CONSTRAINT chk_diagram_comments_position_valid 
CHECK (validate_comment_position(position_data));

-- Comment validation function
CREATE OR REPLACE FUNCTION validate_diagram_comment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check comment depth (max 3 levels)
    IF NEW.parent_comment_id IS NOT NULL THEN
        IF (
            WITH RECURSIVE comment_depth AS (
                SELECT id, parent_comment_id, 1 as depth
                FROM diagram_comments 
                WHERE id = NEW.parent_comment_id
                
                UNION ALL
                
                SELECT c.id, c.parent_comment_id, cd.depth + 1
                FROM diagram_comments c
                JOIN comment_depth cd ON c.id = cd.parent_comment_id
            )
            SELECT MAX(depth) FROM comment_depth
        ) >= 3 THEN
            RAISE EXCEPTION 'Comment nesting depth cannot exceed 3 levels';
        END IF;
    END IF;
    
    -- Update timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_diagram_comment
    BEFORE INSERT OR UPDATE ON diagram_comments
    FOR EACH ROW
    EXECUTE FUNCTION validate_diagram_comment();
```

## Application Settings Validation

### 1. Settings Validation
```sql
-- Application settings validation
ALTER TABLE application_settings 
ADD CONSTRAINT chk_app_settings_key_valid 
CHECK (
    char_length(setting_key) >= 3 AND
    char_length(setting_key) <= 100 AND
    setting_key ~ '^[a-z0-9_.-]+$'
);

-- Settings value validation function
CREATE OR REPLACE FUNCTION validate_setting_value(
    setting_type VARCHAR(20), 
    setting_value JSONB
) RETURNS BOOLEAN AS $$
BEGIN
    CASE setting_type
        WHEN 'string' THEN
            RETURN jsonb_typeof(setting_value) = 'string';
        WHEN 'number' THEN
            RETURN jsonb_typeof(setting_value) = 'number';
        WHEN 'boolean' THEN
            RETURN jsonb_typeof(setting_value) = 'boolean';
        WHEN 'object' THEN
            RETURN jsonb_typeof(setting_value) = 'object';
        WHEN 'array' THEN
            RETURN jsonb_typeof(setting_value) = 'array';
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE application_settings 
ADD CONSTRAINT chk_app_settings_value_type_match 
CHECK (validate_setting_value(setting_type, setting_value));

-- Settings update validation
CREATE OR REPLACE FUNCTION validate_application_setting()
RETURNS TRIGGER AS $$
BEGIN
    -- Update timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- Validate critical settings
    IF NEW.setting_key = 'max_diagram_size' THEN
        IF NOT (jsonb_typeof(NEW.setting_value) = 'number' AND
                (NEW.setting_value)::numeric BETWEEN 1048576 AND 104857600) THEN
            RAISE EXCEPTION 'max_diagram_size must be between 1MB and 100MB';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_application_setting
    BEFORE INSERT OR UPDATE ON application_settings
    FOR EACH ROW
    EXECUTE FUNCTION validate_application_setting();
```

## Performance and Security Considerations

### 1. Validation Performance
- **Efficient Constraints**: Use database constraints for simple validations
- **Function Caching**: Cache validation function results where possible
- **Selective Validation**: Only validate changed fields on updates
- **Batch Validation**: Optimize validation for bulk operations

### 2. Security Validation
- **Input Sanitization**: Prevent XSS and injection attacks
- **Content Filtering**: Block malicious content patterns
- **Size Limits**: Prevent resource exhaustion attacks
- **Rate Limiting**: Implement validation rate limiting

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review db_lld_05.md for indexing strategies and query optimization
2. Implement query performance optimization in db_lld_06.md
3. Design security implementation in db_lld_07.md

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/database/validation.md`
- **API Documentation**: `/docs/documentation/backend/input-validation.md`
- **Security Documentation**: `/docs/documentation/backend/data-security.md`

**Integration Points:**
- **Frontend**: Client-side validation matching database rules
- **Backend**: API validation layer coordinating with database constraints
- **Testing**: Comprehensive validation testing scenarios

This comprehensive validation system ensures data integrity, security, and business rule enforcement while maintaining performance and providing clear error feedback to users.
