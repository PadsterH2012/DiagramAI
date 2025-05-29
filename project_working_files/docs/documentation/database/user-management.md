# Database User Management Guide

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** User Documentation - Database Management  
**Audience:** Developers, Database Administrators, System Administrators  
**Related LLD:** `/working_files/design/db_lld/db_lld_01.md`  

## Overview

This guide provides comprehensive information about user management in the DiagramAI database system. It covers user account creation, authentication, profile management, and security features from a user and administrator perspective.

## User Account Management

### Account Creation and Registration

#### User Registration Process
1. **Email Validation**: Valid email address required (RFC 5322 compliant)
2. **Username Requirements**: 3-50 characters, alphanumeric with underscores/hyphens
3. **Password Security**: Minimum requirements enforced at application level
4. **Profile Creation**: Default profile automatically created upon registration

#### Account Validation Rules
- **Email Format**: Must be valid email format with proper domain
- **Username Uniqueness**: Case-insensitive uniqueness across all users
- **Reserved Usernames**: System usernames (admin, root, system, api, www, mail, ftp) are blocked
- **Display Name**: Defaults to username if not provided, can be customized

#### Example Registration Data
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe"
}
```

### User Profile Management

#### Profile Information
- **Basic Information**: First name, last name, display name
- **Contact Details**: Email address (verified/unverified status)
- **Avatar**: Profile picture URL (validated image formats)
- **Bio**: Personal description (up to 1000 characters)
- **Location**: Geographic location (optional)
- **Website**: Personal or professional website URL

#### User Preferences
- **Timezone**: User's preferred timezone for date/time display
- **Language**: Interface language preference
- **Theme**: Light, dark, or auto theme selection
- **Notifications**: Email and browser notification preferences
- **Privacy**: Profile visibility and sharing settings

#### Profile Update Process
1. Navigate to profile settings
2. Update desired fields
3. Save changes (automatic validation)
4. Confirmation of successful update

### Authentication and Security

#### Session Management
- **Session Duration**: Configurable session timeout (default: 24 hours)
- **Multiple Sessions**: Support for multiple active sessions (max 10)
- **Device Tracking**: Track sessions by device and location
- **Session Termination**: Manual logout or automatic expiry

#### Password Security
- **Password Hashing**: bcrypt with salt for secure storage
- **Password Reset**: Secure token-based password reset process
- **Token Expiry**: Reset tokens expire after 24 hours
- **Single Use**: Reset tokens can only be used once

#### Security Features
- **Account Deactivation**: Soft delete with is_active flag
- **Login Tracking**: Last login timestamp tracking
- **Email Verification**: Email verification status tracking
- **Audit Trail**: Comprehensive logging of account changes

## Database Schema Reference

### Users Table Structure
```sql
users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE
)
```

### User Profiles Table Structure
```sql
user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    bio TEXT,
    location VARCHAR(100),
    website_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language_preference VARCHAR(10) DEFAULT 'en',
    theme_preference VARCHAR(20) DEFAULT 'light',
    notification_preferences JSONB,
    privacy_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
```

## API Integration

### User Management Endpoints

#### Create User Account
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Get User Profile
```http
GET /api/users/{userId}
Authorization: Bearer {jwt_token}
```

#### Update User Profile
```http
PUT /api/users/{userId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "bio": "Software developer and diagram enthusiast"
}
```

#### Update User Preferences
```http
PUT /api/users/{userId}/preferences
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "timezone": "America/New_York",
  "language": "en",
  "theme": "dark",
  "notifications": {
    "email": true,
    "browser": false
  }
}
```

### Authentication Endpoints

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Password Reset Request
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Password Reset Confirmation
```http
POST /api/auth/reset-password/confirm
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "NewSecurePassword123!"
}
```

## Data Validation and Constraints

### Input Validation Rules

#### Email Validation
- **Format**: RFC 5322 compliant email format
- **Length**: 5-255 characters
- **Uniqueness**: Case-insensitive unique across all users
- **Domain Validation**: Basic domain format validation

#### Username Validation
- **Format**: Alphanumeric characters, underscores, and hyphens only
- **Length**: 3-50 characters
- **Uniqueness**: Case-insensitive unique across all users
- **Reserved Names**: System usernames are blocked

#### Password Requirements
- **Minimum Length**: 8 characters (enforced at application level)
- **Complexity**: Mix of uppercase, lowercase, numbers, and symbols
- **Storage**: bcrypt hashed with salt (never stored in plain text)
- **History**: Previous passwords tracked to prevent reuse

#### Profile Data Validation
- **Name Fields**: 1-100 characters, no special characters
- **Bio**: Maximum 1000 characters, XSS protection
- **Website URL**: Valid HTTP/HTTPS URL format
- **Avatar URL**: Valid image URL with supported formats (JPG, PNG, GIF, WebP)

### Business Rules

#### Account Management Rules
- **One Profile Per User**: Each user has exactly one profile
- **Email Verification**: Email verification required for full account access
- **Account Deactivation**: Soft delete preserves data integrity
- **Session Limits**: Maximum 10 active sessions per user

#### Security Rules
- **Password Reset Limits**: Maximum 3 active reset tokens per user
- **Session Expiry**: Automatic session cleanup after expiry
- **Token Security**: Cryptographically secure token generation
- **Audit Logging**: All security events logged for monitoring

## Troubleshooting and Common Issues

### Account Creation Issues

#### Email Already Exists
**Problem**: User tries to register with existing email
**Solution**: 
1. Check if email is already registered
2. Use password reset if user forgot account
3. Contact support if email was used without permission

#### Username Already Taken
**Problem**: Desired username is already in use
**Solution**:
1. Try variations with numbers or underscores
2. Check username availability before submission
3. Consider using display name for personalization

#### Invalid Email Format
**Problem**: Email format validation fails
**Solution**:
1. Verify email format follows standard conventions
2. Check for typos in domain name
3. Ensure no spaces or special characters

### Authentication Issues

#### Login Failures
**Problem**: User cannot log in with correct credentials
**Possible Causes**:
1. Account deactivated (is_active = false)
2. Email not verified (if verification required)
3. Password changed recently
4. Session limit reached

**Solutions**:
1. Check account status in database
2. Verify email verification status
3. Use password reset if needed
4. Clear old sessions if limit reached

#### Session Expiry
**Problem**: User session expires unexpectedly
**Solutions**:
1. Check session timeout configuration
2. Implement session refresh mechanism
3. Provide clear expiry warnings to users
4. Allow session extension for active users

### Profile Management Issues

#### Profile Update Failures
**Problem**: Profile updates fail validation
**Common Issues**:
1. Bio text too long (>1000 characters)
2. Invalid website URL format
3. Invalid avatar image URL
4. Special characters in name fields

**Solutions**:
1. Implement client-side validation
2. Provide clear error messages
3. Show character limits and format requirements
4. Validate URLs before submission

## Security Best Practices

### For Developers

#### Password Security
- Never store passwords in plain text
- Use bcrypt with appropriate salt rounds
- Implement password strength requirements
- Prevent password reuse
- Secure password reset process

#### Session Management
- Use secure, random session tokens
- Implement proper session expiry
- Track session metadata for security
- Provide session management tools for users
- Clear sessions on password change

#### Data Protection
- Validate all user inputs
- Sanitize data to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement proper access controls
- Log security events for monitoring

### For Administrators

#### Account Monitoring
- Monitor failed login attempts
- Track unusual session patterns
- Review account creation patterns
- Monitor password reset frequency
- Check for suspicious user behavior

#### Database Security
- Regular security updates
- Proper backup procedures
- Access control and permissions
- Encryption at rest and in transit
- Regular security audits

## Related Documentation

### Technical Documentation
- **Database LLD**: `/working_files/design/db_lld/db_lld_01.md` - Core schema design
- **API Documentation**: `/docs/documentation/backend/authentication-api.md`
- **Security Guide**: `/docs/documentation/backend/security-implementation.md`

### User Guides
- **Account Setup**: User registration and profile setup guide
- **Security Settings**: User security and privacy configuration
- **Troubleshooting**: Common user issues and solutions

### Administrative Guides
- **User Administration**: Admin tools for user management
- **Security Monitoring**: Security event monitoring and response
- **Database Maintenance**: User data maintenance procedures

This comprehensive user management guide provides all necessary information for effectively managing user accounts, authentication, and security in the DiagramAI system.
