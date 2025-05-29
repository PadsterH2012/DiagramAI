# Database LLD 02: Diagram Data Models and Content Storage

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Database Diagram Models  
**Domain:** Database Architecture  
**Coverage Area:** Diagram storage, content models, version management  
**Prerequisites:** db_lld_01.md (Core Schema), project_hld.md, techstack.md  

## Purpose and Scope

This document defines the database schema for storing diagram content, managing different diagram formats (React Flow and Mermaid), and supporting the core functionality of DiagramAI including bidirectional conversion and version management.

**Coverage Areas in This Document:**
- Diagram content storage and metadata
- Format-specific data models (React Flow JSON, Mermaid syntax)
- Version management and history tracking
- Collaboration and sharing models
- Content validation and integrity

**Related LLD Files:**
- db_lld_01.md: Core schema design and user management
- db_lld_03.md: Entity relationships and foreign key constraints
- db_lld_04.md: Data validation rules and business logic
- db_lld_05.md: Indexing strategies and query optimization

## Technology Foundation

### Diagram Storage Strategy
Based on project requirements and validated technology stack:

**Format Support:**
- **React Flow JSON**: Interactive visual diagram format
- **Mermaid Syntax**: Text-based diagram format
- **Bidirectional Conversion**: Seamless format transformation
- **Semantic Preservation**: Maintain meaning across format conversions

**Storage Technology:**
- **PostgreSQL JSONB**: Efficient storage for diagram data structures
- **Full-Text Search**: PostgreSQL text search for diagram content
- **Version Control**: Git-like versioning for diagram evolution
- **Compression**: Automatic compression for large diagram data

## Diagram Data Models

### 1. Diagrams Table
Primary table for diagram metadata and content storage.

```sql
-- Diagrams table: Core diagram storage and metadata
CREATE TABLE diagrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Content storage
    content JSONB NOT NULL,
    format VARCHAR(20) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    template_category VARCHAR(50),
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT diagrams_format_valid CHECK (format IN ('react_flow', 'mermaid')),
    CONSTRAINT diagrams_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
    CONSTRAINT diagrams_content_hash_format CHECK (char_length(content_hash) = 64),
    CONSTRAINT diagrams_view_count_positive CHECK (view_count >= 0),
    CONSTRAINT diagrams_fork_count_positive CHECK (fork_count >= 0),
    CONSTRAINT diagrams_like_count_positive CHECK (like_count >= 0),
    CONSTRAINT diagrams_template_category_when_template CHECK (
        (is_template = FALSE AND template_category IS NULL) OR
        (is_template = TRUE AND template_category IS NOT NULL)
    )
);

-- Indexes for diagrams table
CREATE INDEX idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX idx_diagrams_format ON diagrams(format);
CREATE INDEX idx_diagrams_public ON diagrams(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_diagrams_template ON diagrams(is_template, template_category) WHERE is_template = TRUE;
CREATE INDEX idx_diagrams_created_at ON diagrams(created_at);
CREATE INDEX idx_diagrams_updated_at ON diagrams(updated_at);
CREATE INDEX idx_diagrams_content_hash ON diagrams(content_hash);
CREATE INDEX idx_diagrams_tags ON diagrams USING GIN(tags);

-- Full-text search index for diagram content
CREATE INDEX idx_diagrams_search ON diagrams USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);
```

**Design Rationale:**
- **JSONB Content**: Flexible storage for both React Flow and Mermaid formats
- **Content Hash**: SHA-256 hash for deduplication and integrity verification
- **Format Specification**: Explicit format tracking for conversion operations
- **Public/Private**: Sharing and privacy controls
- **Template System**: Support for diagram templates and categories
- **Statistics**: Usage tracking for popular diagrams
- **Full-Text Search**: PostgreSQL text search for diagram discovery

### 2. Diagram Versions Table
Version history and change tracking for diagrams.

```sql
-- Diagram versions: Version history and change tracking
CREATE TABLE diagram_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    
    -- Version content
    content JSONB NOT NULL,
    format VARCHAR(20) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    
    -- Change metadata
    change_summary VARCHAR(500),
    change_type VARCHAR(20) DEFAULT 'manual',
    parent_version_id UUID REFERENCES diagram_versions(id),
    
    -- Author information
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT diagram_versions_format_valid CHECK (format IN ('react_flow', 'mermaid')),
    CONSTRAINT diagram_versions_change_type_valid CHECK (change_type IN (
        'manual', 'ai_generated', 'conversion', 'merge', 'revert'
    )),
    CONSTRAINT diagram_versions_version_positive CHECK (version_number > 0),
    CONSTRAINT diagram_versions_content_hash_format CHECK (char_length(content_hash) = 64),
    CONSTRAINT diagram_versions_unique_version UNIQUE(diagram_id, version_number)
);

-- Indexes for diagram versions
CREATE INDEX idx_diagram_versions_diagram_id ON diagram_versions(diagram_id);
CREATE INDEX idx_diagram_versions_version_number ON diagram_versions(diagram_id, version_number);
CREATE INDEX idx_diagram_versions_created_by ON diagram_versions(created_by);
CREATE INDEX idx_diagram_versions_created_at ON diagram_versions(created_at);
CREATE INDEX idx_diagram_versions_content_hash ON diagram_versions(content_hash);
CREATE INDEX idx_diagram_versions_parent ON diagram_versions(parent_version_id);
CREATE INDEX idx_diagram_versions_change_type ON diagram_versions(change_type);
```

**Design Rationale:**
- **Version Numbering**: Sequential version numbers per diagram
- **Content Preservation**: Full content storage for each version
- **Change Tracking**: change_summary and change_type for audit trail
- **Parent Relationships**: Support for branching and merging
- **Author Attribution**: Track who made each change
- **Format Evolution**: Track format changes over time

### 3. Diagram Collaborators Table
Collaboration and sharing permissions for diagrams.

```sql
-- Diagram collaborators: Sharing and collaboration permissions
CREATE TABLE diagram_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Permission levels
    permission_level VARCHAR(20) NOT NULL,
    can_edit BOOLEAN DEFAULT FALSE,
    can_comment BOOLEAN DEFAULT TRUE,
    can_share BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    
    -- Invitation metadata
    invited_by UUID NOT NULL REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Constraints
    CONSTRAINT diagram_collaborators_permission_valid CHECK (permission_level IN (
        'viewer', 'commenter', 'editor', 'admin'
    )),
    CONSTRAINT diagram_collaborators_status_valid CHECK (status IN (
        'pending', 'accepted', 'declined', 'revoked'
    )),
    CONSTRAINT diagram_collaborators_unique_user UNIQUE(diagram_id, user_id),
    CONSTRAINT diagram_collaborators_expires_future CHECK (
        expires_at IS NULL OR expires_at > invited_at
    ),
    CONSTRAINT diagram_collaborators_accepted_after_invited CHECK (
        accepted_at IS NULL OR accepted_at >= invited_at
    )
);

-- Indexes for diagram collaborators
CREATE INDEX idx_diagram_collaborators_diagram_id ON diagram_collaborators(diagram_id);
CREATE INDEX idx_diagram_collaborators_user_id ON diagram_collaborators(user_id);
CREATE INDEX idx_diagram_collaborators_permission ON diagram_collaborators(permission_level);
CREATE INDEX idx_diagram_collaborators_status ON diagram_collaborators(status);
CREATE INDEX idx_diagram_collaborators_invited_by ON diagram_collaborators(invited_by);
CREATE INDEX idx_diagram_collaborators_expires ON diagram_collaborators(expires_at) 
WHERE expires_at IS NOT NULL;
```

**Design Rationale:**
- **Granular Permissions**: Fine-grained access control for collaboration
- **Invitation System**: Formal invitation and acceptance process
- **Expiration Support**: Time-limited collaboration invitations
- **Status Tracking**: Track invitation lifecycle
- **Audit Trail**: Track who invited whom and when

### 4. Diagram Comments Table
Comments and feedback system for diagrams.

```sql
-- Diagram comments: Comments and feedback on diagrams
CREATE TABLE diagram_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES diagram_comments(id) ON DELETE CASCADE,
    
    -- Comment content
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text',
    
    -- Position context (for visual comments)
    position_data JSONB,
    
    -- Status and metadata
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT diagram_comments_content_type_valid CHECK (content_type IN (
        'text', 'markdown', 'suggestion'
    )),
    CONSTRAINT diagram_comments_content_length CHECK (char_length(content) >= 1),
    CONSTRAINT diagram_comments_resolved_consistency CHECK (
        (is_resolved = FALSE AND resolved_by IS NULL AND resolved_at IS NULL) OR
        (is_resolved = TRUE AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL)
    )
);

-- Indexes for diagram comments
CREATE INDEX idx_diagram_comments_diagram_id ON diagram_comments(diagram_id);
CREATE INDEX idx_diagram_comments_user_id ON diagram_comments(user_id);
CREATE INDEX idx_diagram_comments_parent ON diagram_comments(parent_comment_id);
CREATE INDEX idx_diagram_comments_created_at ON diagram_comments(created_at);
CREATE INDEX idx_diagram_comments_resolved ON diagram_comments(is_resolved);
CREATE INDEX idx_diagram_comments_position ON diagram_comments USING GIN(position_data) 
WHERE position_data IS NOT NULL;
```

**Design Rationale:**
- **Threaded Comments**: Support for comment replies via parent_comment_id
- **Position Context**: JSONB for storing visual position information
- **Resolution Tracking**: Mark comments as resolved with attribution
- **Content Types**: Support for different comment formats
- **Audit Trail**: Full tracking of comment lifecycle

## Format-Specific Data Structures

### React Flow JSON Schema
```json
{
  "nodes": [
    {
      "id": "string",
      "type": "string",
      "position": { "x": "number", "y": "number" },
      "data": {
        "label": "string",
        "description": "string",
        "properties": "object"
      },
      "style": "object",
      "className": "string"
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string",
      "target": "string",
      "type": "string",
      "data": "object",
      "style": "object",
      "label": "string"
    }
  ],
  "viewport": {
    "x": "number",
    "y": "number",
    "zoom": "number"
  },
  "metadata": {
    "version": "string",
    "created": "timestamp",
    "modified": "timestamp",
    "author": "string"
  }
}
```

### Mermaid Syntax Storage
```json
{
  "syntax": "string",
  "type": "string",
  "config": "object",
  "metadata": {
    "version": "string",
    "created": "timestamp",
    "modified": "timestamp",
    "author": "string"
  },
  "validation": {
    "isValid": "boolean",
    "errors": "array",
    "warnings": "array"
  }
}
```

## Integration with Technology Stack

### Prisma Schema Integration
```typescript
// Prisma schema for diagrams
model Diagram {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String    @map("user_id") @db.Uuid
  title             String    @db.VarChar(255)
  description       String?
  content           Json
  format            String    @db.VarChar(20)
  contentHash       String    @map("content_hash") @db.VarChar(64)
  tags              String[]  @default([])
  isPublic          Boolean   @default(false) @map("is_public")
  isTemplate        Boolean   @default(false) @map("is_template")
  templateCategory  String?   @map("template_category") @db.VarChar(50)
  viewCount         Int       @default(0) @map("view_count")
  forkCount         Int       @default(0) @map("fork_count")
  likeCount         Int       @default(0) @map("like_count")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @default(now()) @updatedAt @map("updated_at") @db.Timestamptz
  lastAccessedAt    DateTime  @default(now()) @map("last_accessed_at") @db.Timestamptz
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  versions          DiagramVersion[]
  collaborators     DiagramCollaborator[]
  comments          DiagramComment[]
  
  @@map("diagrams")
}
```

### TypeScript Type Definitions
```typescript
// Core diagram types
export interface DiagramContent {
  format: 'react_flow' | 'mermaid';
  data: ReactFlowData | MermaidData;
  metadata: DiagramMetadata;
}

export interface ReactFlowData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  viewport: ReactFlowViewport;
}

export interface MermaidData {
  syntax: string;
  type: string;
  config?: Record<string, any>;
  validation?: ValidationResult;
}

export interface DiagramMetadata {
  version: string;
  created: Date;
  modified: Date;
  author: string;
  checksum: string;
}
```

## Performance and Storage Optimization

### Content Compression
- **JSONB Compression**: Automatic PostgreSQL JSONB compression
- **Large Diagram Handling**: Streaming for diagrams > 1MB
- **Deduplication**: Content hash-based deduplication
- **Archival Strategy**: Move old versions to cold storage

### Query Optimization
- **Index Strategy**: Optimized for common access patterns
- **Partial Indexes**: Conditional indexes for filtered queries
- **GIN Indexes**: Full-text search and JSONB queries
- **Connection Pooling**: Efficient database connection management

## Security and Data Integrity

### Content Validation
- **Schema Validation**: JSON schema validation for diagram content
- **Content Sanitization**: XSS protection for user content
- **Size Limits**: Maximum content size enforcement
- **Format Validation**: Ensure content matches declared format

### Access Control
- **Row-Level Security**: PostgreSQL RLS for multi-tenant access
- **Permission Inheritance**: Hierarchical permission model
- **Audit Logging**: Comprehensive access and change logging
- **Data Encryption**: Encryption at rest for sensitive content

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review db_lld_03.md for entity relationships and constraints
2. Implement data validation rules in db_lld_04.md
3. Design indexing strategies in db_lld_05.md

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/database/diagram-storage.md`
- **API Documentation**: `/docs/documentation/backend/diagram-api.md`
- **Frontend Documentation**: `/docs/documentation/frontend/diagram-editor.md`

**Integration Points:**
- **Frontend**: Diagram editor components and data synchronization
- **Backend**: API endpoints for diagram CRUD operations
- **AI Integration**: Content analysis and conversion services

This diagram data model provides comprehensive support for DiagramAI's core functionality, enabling efficient storage, versioning, and collaboration while maintaining data integrity and performance.
