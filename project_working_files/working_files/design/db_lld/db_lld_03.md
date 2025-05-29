# Database LLD 03: Entity Relationships and Foreign Key Constraints

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Database Relationships  
**Domain:** Database Architecture  
**Coverage Area:** Entity relationships, foreign key constraints, referential integrity  
**Prerequisites:** db_lld_01.md (Core Schema), db_lld_02.md (Diagram Models)  

## Purpose and Scope

This document defines the comprehensive entity relationships and foreign key constraints for the DiagramAI database schema. It establishes referential integrity rules, cascade behaviors, and relationship patterns that ensure data consistency and support the application's collaborative and versioning features.

**Coverage Areas in This Document:**
- Primary entity relationships and cardinalities
- Foreign key constraints and cascade behaviors
- Referential integrity enforcement
- Relationship validation rules
- Cross-table constraint dependencies

**Related LLD Files:**
- db_lld_01.md: Core schema design and user management
- db_lld_02.md: Diagram data models and content storage
- db_lld_04.md: Data validation rules and business logic
- db_lld_05.md: Indexing strategies for relationship queries

## Entity Relationship Overview

### Core Entity Hierarchy
```
Users (Root Entity)
├── UserProfiles (1:1)
├── UserSessions (1:N)
├── PasswordResetTokens (1:N)
├── Diagrams (1:N)
│   ├── DiagramVersions (1:N)
│   ├── DiagramCollaborators (N:M via Users)
│   └── DiagramComments (1:N)
│       └── DiagramComments (Self-referencing for replies)
└── ApplicationSettings (System-wide)
```

### Relationship Cardinalities
- **User → UserProfile**: One-to-One (Required)
- **User → Diagrams**: One-to-Many (Optional)
- **User → Sessions**: One-to-Many (Optional)
- **Diagram → Versions**: One-to-Many (Required)
- **Diagram → Collaborators**: Many-to-Many via Users
- **Diagram → Comments**: One-to-Many (Optional)
- **Comment → Comment**: One-to-Many (Self-referencing)

## Detailed Relationship Definitions

### 1. User-Centric Relationships

#### User → UserProfile (One-to-One)
```sql
-- User profile relationship with cascade delete
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Ensure one profile per user
ALTER TABLE user_profiles 
ADD CONSTRAINT uk_user_profiles_user_id 
UNIQUE (user_id);

-- Trigger to create default profile on user creation
CREATE OR REPLACE FUNCTION create_default_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, timezone, language_preference, theme_preference)
    VALUES (NEW.id, 'UTC', 'en', 'light');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_profile();
```

**Design Rationale:**
- **CASCADE DELETE**: Profile deleted when user is deleted
- **UNIQUE CONSTRAINT**: Ensures one profile per user
- **AUTO-CREATION**: Trigger creates default profile automatically
- **UPDATE CASCADE**: Profile user_id updates if user id changes

#### User → UserSessions (One-to-Many)
```sql
-- User sessions relationship with cascade delete
ALTER TABLE user_sessions 
ADD CONSTRAINT fk_user_sessions_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Index for efficient session lookups by user
CREATE INDEX idx_user_sessions_user_lookup ON user_sessions(user_id, is_active, expires_at);

-- Constraint to limit active sessions per user
ALTER TABLE user_sessions 
ADD CONSTRAINT chk_user_sessions_limit 
CHECK (
    (SELECT COUNT(*) FROM user_sessions s2 
     WHERE s2.user_id = user_sessions.user_id 
     AND s2.is_active = TRUE 
     AND s2.expires_at > CURRENT_TIMESTAMP) <= 10
);
```

**Design Rationale:**
- **CASCADE DELETE**: All sessions deleted when user is deleted
- **SESSION LIMIT**: Maximum 10 active sessions per user
- **PERFORMANCE**: Optimized index for session validation
- **SECURITY**: Automatic cleanup of user sessions

#### User → PasswordResetTokens (One-to-Many)
```sql
-- Password reset tokens relationship with cascade delete
ALTER TABLE password_reset_tokens 
ADD CONSTRAINT fk_password_reset_tokens_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Constraint to limit active reset tokens per user
ALTER TABLE password_reset_tokens 
ADD CONSTRAINT chk_password_reset_limit 
CHECK (
    (SELECT COUNT(*) FROM password_reset_tokens p2 
     WHERE p2.user_id = password_reset_tokens.user_id 
     AND p2.used_at IS NULL 
     AND p2.expires_at > CURRENT_TIMESTAMP) <= 3
);

-- Trigger to invalidate old tokens when new one is created
CREATE OR REPLACE FUNCTION invalidate_old_reset_tokens()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark old unused tokens as used when creating new one
    UPDATE password_reset_tokens 
    SET used_at = CURRENT_TIMESTAMP 
    WHERE user_id = NEW.user_id 
    AND used_at IS NULL 
    AND expires_at > CURRENT_TIMESTAMP 
    AND id != NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invalidate_old_reset_tokens
    AFTER INSERT ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_old_reset_tokens();
```

**Design Rationale:**
- **CASCADE DELETE**: Tokens deleted when user is deleted
- **TOKEN LIMIT**: Maximum 3 active reset tokens per user
- **AUTO-INVALIDATION**: New tokens invalidate old ones
- **SECURITY**: Prevents token accumulation attacks

### 2. Diagram-Centric Relationships

#### User → Diagrams (One-to-Many)
```sql
-- Diagrams ownership relationship
ALTER TABLE diagrams 
ADD CONSTRAINT fk_diagrams_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Index for efficient diagram lookups by user
CREATE INDEX idx_diagrams_user_lookup ON diagrams(user_id, created_at DESC);

-- Constraint for diagram ownership limits (optional)
-- ALTER TABLE diagrams 
-- ADD CONSTRAINT chk_diagrams_user_limit 
-- CHECK (
--     (SELECT COUNT(*) FROM diagrams d2 
--      WHERE d2.user_id = diagrams.user_id) <= 1000
-- );
```

**Design Rationale:**
- **CASCADE DELETE**: User deletion removes all their diagrams
- **OWNERSHIP**: Clear ownership relationship
- **PERFORMANCE**: Optimized for user diagram listings
- **SCALABILITY**: Optional limits for resource management

#### Diagram → DiagramVersions (One-to-Many)
```sql
-- Diagram versions relationship with cascade delete
ALTER TABLE diagram_versions 
ADD CONSTRAINT fk_diagram_versions_diagram_id 
FOREIGN KEY (diagram_id) REFERENCES diagrams(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Version creator relationship
ALTER TABLE diagram_versions 
ADD CONSTRAINT fk_diagram_versions_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Parent version relationship (self-referencing)
ALTER TABLE diagram_versions 
ADD CONSTRAINT fk_diagram_versions_parent 
FOREIGN KEY (parent_version_id) REFERENCES diagram_versions(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Ensure version numbers are sequential and unique per diagram
CREATE UNIQUE INDEX idx_diagram_versions_unique 
ON diagram_versions(diagram_id, version_number);

-- Trigger to auto-increment version numbers
CREATE OR REPLACE FUNCTION set_diagram_version_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.version_number IS NULL THEN
        SELECT COALESCE(MAX(version_number), 0) + 1 
        INTO NEW.version_number
        FROM diagram_versions 
        WHERE diagram_id = NEW.diagram_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_version_number
    BEFORE INSERT ON diagram_versions
    FOR EACH ROW
    EXECUTE FUNCTION set_diagram_version_number();
```

**Design Rationale:**
- **CASCADE DELETE**: Versions deleted with diagram
- **SET NULL**: Preserve versions if creator user is deleted
- **SELF-REFERENCING**: Support for version branching
- **AUTO-INCREMENT**: Automatic version numbering
- **UNIQUENESS**: Prevent duplicate version numbers

#### Diagram → DiagramCollaborators (Many-to-Many)
```sql
-- Diagram collaborators relationship
ALTER TABLE diagram_collaborators 
ADD CONSTRAINT fk_diagram_collaborators_diagram_id 
FOREIGN KEY (diagram_id) REFERENCES diagrams(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE diagram_collaborators 
ADD CONSTRAINT fk_diagram_collaborators_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE diagram_collaborators 
ADD CONSTRAINT fk_diagram_collaborators_invited_by 
FOREIGN KEY (invited_by) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Ensure unique collaboration per user per diagram
CREATE UNIQUE INDEX idx_diagram_collaborators_unique 
ON diagram_collaborators(diagram_id, user_id);

-- Constraint to prevent self-collaboration
ALTER TABLE diagram_collaborators 
ADD CONSTRAINT chk_diagram_collaborators_not_self 
CHECK (user_id != invited_by);

-- Constraint to prevent owner collaboration
ALTER TABLE diagram_collaborators 
ADD CONSTRAINT chk_diagram_collaborators_not_owner 
CHECK (
    user_id != (SELECT user_id FROM diagrams WHERE id = diagram_id)
);

-- Trigger to update diagram collaboration count
CREATE OR REPLACE FUNCTION update_diagram_collaboration_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        UPDATE diagrams 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.diagram_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        UPDATE diagrams 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.diagram_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
        UPDATE diagrams 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = OLD.diagram_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collaboration_stats
    AFTER INSERT OR UPDATE OR DELETE ON diagram_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION update_diagram_collaboration_stats();
```

**Design Rationale:**
- **CASCADE DELETE**: Collaborations removed with diagram or user
- **UNIQUE CONSTRAINT**: One collaboration per user per diagram
- **BUSINESS RULES**: Prevent self-collaboration and owner collaboration
- **AUDIT TRAIL**: Track invitation relationships
- **STATISTICS**: Update diagram modification time on collaboration changes

### 3. Comment System Relationships

#### Diagram → DiagramComments (One-to-Many)
```sql
-- Diagram comments relationship
ALTER TABLE diagram_comments 
ADD CONSTRAINT fk_diagram_comments_diagram_id 
FOREIGN KEY (diagram_id) REFERENCES diagrams(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE diagram_comments 
ADD CONSTRAINT fk_diagram_comments_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Self-referencing for comment replies
ALTER TABLE diagram_comments 
ADD CONSTRAINT fk_diagram_comments_parent 
FOREIGN KEY (parent_comment_id) REFERENCES diagram_comments(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Comment resolution relationship
ALTER TABLE diagram_comments 
ADD CONSTRAINT fk_diagram_comments_resolved_by 
FOREIGN KEY (resolved_by) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Constraint to prevent deep nesting (max 3 levels)
ALTER TABLE diagram_comments 
ADD CONSTRAINT chk_diagram_comments_depth 
CHECK (
    parent_comment_id IS NULL OR 
    (SELECT COUNT(*) FROM diagram_comments c2 
     WHERE c2.id = parent_comment_id 
     AND c2.parent_comment_id IS NOT NULL) < 2
);

-- Constraint to ensure parent comment belongs to same diagram
ALTER TABLE diagram_comments 
ADD CONSTRAINT chk_diagram_comments_same_diagram 
CHECK (
    parent_comment_id IS NULL OR 
    (SELECT diagram_id FROM diagram_comments c2 
     WHERE c2.id = parent_comment_id) = diagram_id
);
```

**Design Rationale:**
- **CASCADE DELETE**: Comments deleted with diagram or user
- **THREADED COMMENTS**: Support for comment replies
- **DEPTH LIMIT**: Prevent excessive nesting
- **DIAGRAM CONSISTENCY**: Ensure replies stay within same diagram
- **RESOLUTION TRACKING**: Track comment resolution

## Cross-Table Constraint Dependencies

### 1. Diagram Access Control
```sql
-- Function to check diagram access permissions
CREATE OR REPLACE FUNCTION check_diagram_access(
    p_diagram_id UUID, 
    p_user_id UUID, 
    p_permission VARCHAR(20)
) RETURNS BOOLEAN AS $$
DECLARE
    diagram_owner UUID;
    is_public BOOLEAN;
    user_permission VARCHAR(20);
BEGIN
    -- Get diagram owner and public status
    SELECT user_id, is_public INTO diagram_owner, is_public
    FROM diagrams WHERE id = p_diagram_id;
    
    -- Owner has all permissions
    IF diagram_owner = p_user_id THEN
        RETURN TRUE;
    END IF;
    
    -- Public diagrams allow viewing
    IF is_public AND p_permission = 'view' THEN
        RETURN TRUE;
    END IF;
    
    -- Check collaboration permissions
    SELECT permission_level INTO user_permission
    FROM diagram_collaborators 
    WHERE diagram_id = p_diagram_id 
    AND user_id = p_user_id 
    AND status = 'accepted';
    
    -- Check permission hierarchy
    RETURN CASE 
        WHEN p_permission = 'view' THEN user_permission IS NOT NULL
        WHEN p_permission = 'comment' THEN user_permission IN ('commenter', 'editor', 'admin')
        WHEN p_permission = 'edit' THEN user_permission IN ('editor', 'admin')
        WHEN p_permission = 'admin' THEN user_permission = 'admin'
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql;
```

### 2. Version Consistency Constraints
```sql
-- Ensure diagram content matches latest version
CREATE OR REPLACE FUNCTION sync_diagram_with_latest_version()
RETURNS TRIGGER AS $$
DECLARE
    latest_version diagram_versions%ROWTYPE;
BEGIN
    -- Get latest version for the diagram
    SELECT * INTO latest_version
    FROM diagram_versions 
    WHERE diagram_id = NEW.diagram_id 
    ORDER BY version_number DESC 
    LIMIT 1;
    
    -- Update diagram with latest version content
    UPDATE diagrams 
    SET 
        content = latest_version.content,
        format = latest_version.format,
        content_hash = latest_version.content_hash,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.diagram_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_diagram_version
    AFTER INSERT ON diagram_versions
    FOR EACH ROW
    EXECUTE FUNCTION sync_diagram_with_latest_version();
```

## Referential Integrity Enforcement

### 1. Cascade Behavior Summary
| Parent Table | Child Table | Delete Behavior | Update Behavior |
|--------------|-------------|-----------------|-----------------|
| users | user_profiles | CASCADE | CASCADE |
| users | user_sessions | CASCADE | CASCADE |
| users | password_reset_tokens | CASCADE | CASCADE |
| users | diagrams | CASCADE | CASCADE |
| users | diagram_versions (created_by) | SET NULL | CASCADE |
| users | diagram_collaborators | CASCADE | CASCADE |
| users | diagram_comments | CASCADE | CASCADE |
| diagrams | diagram_versions | CASCADE | CASCADE |
| diagrams | diagram_collaborators | CASCADE | CASCADE |
| diagrams | diagram_comments | CASCADE | CASCADE |
| diagram_comments | diagram_comments (parent) | CASCADE | CASCADE |

### 2. Constraint Validation Rules
- **User Uniqueness**: Email and username must be unique across all users
- **Session Limits**: Maximum active sessions per user
- **Version Sequencing**: Version numbers must be sequential per diagram
- **Comment Depth**: Maximum comment nesting depth of 3 levels
- **Collaboration Rules**: Users cannot collaborate on their own diagrams
- **Permission Hierarchy**: Proper permission level validation

## Performance Implications

### 1. Foreign Key Index Strategy
All foreign key columns are automatically indexed for:
- **Join Performance**: Efficient relationship queries
- **Cascade Operations**: Fast cascade delete/update operations
- **Constraint Validation**: Quick referential integrity checks

### 2. Relationship Query Optimization
- **Composite Indexes**: Multi-column indexes for common relationship queries
- **Partial Indexes**: Conditional indexes for filtered relationship queries
- **Covering Indexes**: Include additional columns to avoid table lookups

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review db_lld_04.md for data validation rules and business logic
2. Implement indexing strategies in db_lld_05.md
3. Design query optimization in db_lld_06.md

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/database/relationships.md`
- **API Documentation**: `/docs/documentation/backend/data-access.md`
- **Security Documentation**: `/docs/documentation/backend/access-control.md`

**Integration Points:**
- **Frontend**: Relationship-aware data fetching and caching
- **Backend**: ORM configuration and relationship management
- **Testing**: Relationship integrity and cascade behavior testing

This comprehensive relationship design ensures data integrity, supports complex collaborative features, and provides the foundation for efficient querying and data management in DiagramAI.
