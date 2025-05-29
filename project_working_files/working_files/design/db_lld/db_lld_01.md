# Database LLD 01: Core Schema Design and User Management

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Database Core Schema  
**Domain:** Database Architecture  
**Coverage Area:** Core schema design, user management, authentication tables  
**Prerequisites:** project_hld.md, techstack.md, validated_tech_stack.md  

## Purpose and Scope

This document defines the core database schema design for DiagramAI, focusing on user management, authentication, and foundational data structures. This LLD establishes the primary tables and relationships that support user accounts, sessions, and basic system functionality.

**Coverage Areas in This Document:**
- User account management tables
- Authentication and session management
- Core system configuration tables
- Primary key strategies and constraints
- Basic indexing for core tables

**Related LLD Files:**
- db_lld_02.md: Diagram data models and content storage
- db_lld_03.md: Entity relationships and foreign key constraints
- db_lld_04.md: Data validation rules and business logic

## Technology Foundation

### Database Technology Stack
Based on validated research findings (techstack.md):

**Production Database:**
- **PostgreSQL 15+**: Primary production database
- **Justification**: ACID compliance, advanced indexing, JSON support, row-level security
- **Connection**: Prisma ORM for type-safe operations
- **Performance**: Connection pooling, query optimization

**Development Database:**
- **SQLite 3.40+**: Development and testing database
- **Justification**: Zero-configuration, file-based, fast for development
- **Migration**: Seamless migration to PostgreSQL for production

**ORM and Type Safety:**
- **Prisma 5.0+**: Primary ORM for database operations
- **TypeScript Integration**: Full type safety for database operations
- **Migration Management**: Schema versioning and automated migrations

## Core Schema Design

### 1. User Management Schema

#### Users Table
Primary table for user account management and authentication.

```sql
-- Users table: Core user account information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_username_format CHECK (username ~* '^[a-zA-Z0-9_-]{3,50}$'),
    CONSTRAINT users_display_name_length CHECK (char_length(display_name) >= 1)
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
```

**Design Rationale:**
- **UUID Primary Keys**: Globally unique, secure, non-sequential
- **Email Validation**: Regex constraint for email format validation
- **Username Constraints**: Alphanumeric with underscores/hyphens, 3-50 characters
- **Soft Delete Support**: is_active flag for user deactivation
- **Audit Trail**: created_at, updated_at, last_login_at for tracking
- **Performance**: Strategic indexing for common query patterns

#### User Profiles Table
Extended user information and preferences.

```sql
-- User profiles: Extended user information and preferences
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    location VARCHAR(100),
    website_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language_preference VARCHAR(10) DEFAULT 'en',
    theme_preference VARCHAR(20) DEFAULT 'light',
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT user_profiles_user_unique UNIQUE(user_id),
    CONSTRAINT user_profiles_timezone_valid CHECK (timezone IN (
        'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
        'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
    )),
    CONSTRAINT user_profiles_language_valid CHECK (language_preference IN (
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'
    )),
    CONSTRAINT user_profiles_theme_valid CHECK (theme_preference IN (
        'light', 'dark', 'auto'
    ))
);

-- Indexes for user profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_timezone ON user_profiles(timezone);
CREATE INDEX idx_user_profiles_language ON user_profiles(language_preference);
```

**Design Rationale:**
- **One-to-One Relationship**: Each user has exactly one profile
- **JSONB for Flexibility**: notification_preferences and privacy_settings as JSONB
- **Enumerated Values**: Constrained choices for timezone, language, theme
- **Extensibility**: JSONB fields allow future preference additions
- **Performance**: Indexed on user_id for fast profile lookups

### 2. Authentication and Session Management

#### User Sessions Table
Active user sessions and authentication tokens.

```sql
-- User sessions: Active authentication sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT user_sessions_expires_future CHECK (expires_at > created_at),
    CONSTRAINT user_sessions_token_length CHECK (char_length(session_token) >= 32)
);

-- Indexes for user sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = TRUE;

-- Cleanup expired sessions (for maintenance)
CREATE INDEX idx_user_sessions_cleanup ON user_sessions(expires_at, is_active) 
WHERE expires_at < CURRENT_TIMESTAMP OR is_active = FALSE;
```

**Design Rationale:**
- **JWT Token Storage**: session_token for JWT tokens, refresh_token for renewal
- **Device Tracking**: device_info JSONB for device fingerprinting
- **Security Monitoring**: IP address and user agent tracking
- **Session Expiry**: expires_at with constraint validation
- **Performance**: Optimized indexes for token lookups and cleanup
- **Maintenance**: Cleanup index for expired session removal

#### Password Reset Tokens Table
Secure password reset token management.

```sql
-- Password reset tokens: Secure password reset functionality
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT password_reset_expires_future CHECK (expires_at > created_at),
    CONSTRAINT password_reset_token_length CHECK (char_length(token_hash) >= 64),
    CONSTRAINT password_reset_used_before_expiry CHECK (
        used_at IS NULL OR used_at <= expires_at
    )
);

-- Indexes for password reset tokens
CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_cleanup ON password_reset_tokens(expires_at) 
WHERE expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL;
```

**Design Rationale:**
- **Security**: Token hash storage (never store plain tokens)
- **Expiration**: Time-limited tokens with constraint validation
- **Single Use**: used_at timestamp prevents token reuse
- **Cleanup**: Index for expired/used token removal
- **Audit Trail**: Full tracking of reset attempts

### 3. System Configuration Tables

#### Application Settings Table
Global application configuration and feature flags.

```sql
-- Application settings: Global configuration and feature flags
CREATE TABLE application_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(20) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT app_settings_key_format CHECK (setting_key ~* '^[a-z0-9_.-]+$'),
    CONSTRAINT app_settings_type_valid CHECK (setting_type IN (
        'string', 'number', 'boolean', 'object', 'array'
    ))
);

-- Indexes for application settings
CREATE INDEX idx_app_settings_key ON application_settings(setting_key);
CREATE INDEX idx_app_settings_type ON application_settings(setting_type);
CREATE INDEX idx_app_settings_public ON application_settings(is_public) WHERE is_public = TRUE;
```

**Design Rationale:**
- **Flexible Configuration**: JSONB values support any data type
- **Type Safety**: setting_type for validation and parsing
- **Public/Private**: is_public flag for client-side configuration
- **Audit Trail**: created_at and updated_at for change tracking
- **Performance**: Indexed on setting_key for fast lookups

## Primary Key and Constraint Strategy

### UUID Strategy
**Decision**: Use UUID v4 for all primary keys
**Rationale**:
- **Security**: Non-sequential, unpredictable identifiers
- **Scalability**: Globally unique across distributed systems
- **Performance**: PostgreSQL UUID optimization with proper indexing
- **Future-Proofing**: Supports microservices and distributed architecture

### Constraint Philosophy
**Data Integrity**: Comprehensive constraints at database level
**Performance**: Strategic indexing for common query patterns
**Security**: Input validation through database constraints
**Maintainability**: Clear constraint naming and documentation

## Integration with Technology Stack

### Prisma Schema Integration
```typescript
// Prisma schema excerpt for users table
model User {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email             String    @unique @db.VarChar(255)
  username          String    @unique @db.VarChar(50)
  passwordHash      String    @map("password_hash") @db.VarChar(255)
  firstName         String?   @map("first_name") @db.VarChar(100)
  lastName          String?   @map("last_name") @db.VarChar(100)
  displayName       String?   @map("display_name") @db.VarChar(150)
  avatarUrl         String?   @map("avatar_url")
  emailVerified     Boolean   @default(false) @map("email_verified")
  isActive          Boolean   @default(true) @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @default(now()) @updatedAt @map("updated_at") @db.Timestamptz
  lastLoginAt       DateTime? @map("last_login_at") @db.Timestamptz
  
  // Relations
  profile           UserProfile?
  sessions          UserSession[]
  passwordResetTokens PasswordResetToken[]
  
  @@map("users")
}
```

### TypeScript Integration
```typescript
// Type definitions for user management
export interface UserCreateInput {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface SessionCreateInput {
  userId: string;
  sessionToken: string;
  refreshToken?: string;
  deviceInfo?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}
```

## Performance Considerations

### Indexing Strategy
- **Primary Lookups**: email, username, session_token
- **Range Queries**: created_at, expires_at, last_login_at
- **Filtered Queries**: is_active, email_verified
- **Cleanup Operations**: Expired sessions and tokens

### Query Optimization
- **Connection Pooling**: Prisma connection pooling for performance
- **Prepared Statements**: Automatic with Prisma ORM
- **Index Usage**: Strategic indexes for common query patterns
- **Cleanup Jobs**: Regular cleanup of expired data

## Security Implementation

### Data Protection
- **Password Hashing**: bcrypt with salt rounds (handled in application layer)
- **Token Security**: Cryptographically secure token generation
- **Input Validation**: Database-level constraints and application validation
- **Audit Logging**: Comprehensive tracking of user actions

### Access Control
- **Row-Level Security**: PostgreSQL RLS for multi-tenant scenarios
- **Connection Security**: TLS encryption for database connections
- **Privilege Separation**: Minimal database privileges for application user
- **Backup Security**: Encrypted backups with secure key management

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review db_lld_02.md for diagram data models
2. Implement entity relationships in db_lld_03.md
3. Define validation rules in db_lld_04.md

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/database/user-management.md`
- **API Documentation**: `/docs/documentation/backend/authentication-api.md`
- **Security Documentation**: `/docs/documentation/backend/security-implementation.md`

**Integration Points:**
- **Frontend**: User authentication and profile management
- **Backend**: API authentication and session management
- **Testing**: User management test scenarios

This core schema design provides the foundation for user management and authentication in DiagramAI, establishing secure, scalable, and maintainable data structures that support the application's core functionality.
