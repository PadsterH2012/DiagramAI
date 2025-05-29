# Database LLD 05: Indexing Strategies and Query Optimization

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Database Performance  
**Domain:** Database Architecture  
**Coverage Area:** Indexing strategies, query optimization, performance tuning  
**Prerequisites:** db_lld_01-04.md, project_hld.md, techstack.md  

## Purpose and Scope

This document defines comprehensive indexing strategies and query optimization techniques for the DiagramAI database. It establishes performance optimization patterns, indexing best practices, and query tuning approaches that ensure efficient data access and scalable performance across all application features.

**Coverage Areas in This Document:**
- Strategic indexing for all tables and query patterns
- Query optimization techniques and best practices
- Performance monitoring and tuning procedures
- Caching strategies and implementation
- Database maintenance and optimization schedules

**Related LLD Files:**
- db_lld_01.md: Core schema design and user management
- db_lld_02.md: Diagram data models and content storage
- db_lld_03.md: Entity relationships and foreign key constraints
- db_lld_04.md: Data validation rules and business logic

## Technology Foundation

### Performance Technology Stack
Based on PostgreSQL 15+ capabilities and Prisma ORM optimization:

**Database Engine:**
- **PostgreSQL 15+**: Advanced indexing, query optimization, JSONB performance
- **Connection Pooling**: PgBouncer for production, Prisma connection pooling
- **Query Analysis**: EXPLAIN ANALYZE, pg_stat_statements, query performance insights

**ORM Optimization:**
- **Prisma 5+**: Query optimization, connection pooling, prepared statements
- **Query Caching**: Application-level caching with Redis
- **Batch Operations**: Efficient bulk operations and transactions

## Comprehensive Indexing Strategy

### 1. Primary Table Indexes

#### Users Table Indexing
```sql
-- Core user lookup indexes (already defined in db_lld_01.md)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Additional performance indexes
CREATE INDEX idx_users_email_verified ON users(email_verified, created_at) WHERE email_verified = TRUE;
CREATE INDEX idx_users_display_name_search ON users USING gin(to_tsvector('english', display_name));

-- Composite indexes for common query patterns
CREATE INDEX idx_users_active_login ON users(is_active, last_login_at) WHERE is_active = TRUE;
CREATE INDEX idx_users_created_active ON users(created_at, is_active) WHERE is_active = TRUE;
```

#### Diagrams Table Indexing
```sql
-- Core diagram indexes (already defined in db_lld_02.md)
CREATE INDEX idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX idx_diagrams_format ON diagrams(format);
CREATE INDEX idx_diagrams_public ON diagrams(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_diagrams_template ON diagrams(is_template, template_category) WHERE is_template = TRUE;
CREATE INDEX idx_diagrams_created_at ON diagrams(created_at);
CREATE INDEX idx_diagrams_updated_at ON diagrams(updated_at);
CREATE INDEX idx_diagrams_content_hash ON diagrams(content_hash);
CREATE INDEX idx_diagrams_tags ON diagrams USING GIN(tags);
CREATE INDEX idx_diagrams_search ON diagrams USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Advanced performance indexes
CREATE INDEX idx_diagrams_user_created ON diagrams(user_id, created_at DESC);
CREATE INDEX idx_diagrams_user_updated ON diagrams(user_id, updated_at DESC);
CREATE INDEX idx_diagrams_public_created ON diagrams(created_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_diagrams_template_category ON diagrams(template_category, created_at DESC) WHERE is_template = TRUE;

-- JSONB content indexes for diagram search
CREATE INDEX idx_diagrams_content_nodes ON diagrams USING GIN((content->'nodes'));
CREATE INDEX idx_diagrams_content_edges ON diagrams USING GIN((content->'edges'));
CREATE INDEX idx_diagrams_content_syntax ON diagrams USING GIN(to_tsvector('english', content->>'syntax')) WHERE format = 'mermaid';

-- Statistics and popularity indexes
CREATE INDEX idx_diagrams_view_count ON diagrams(view_count DESC) WHERE view_count > 0;
CREATE INDEX idx_diagrams_like_count ON diagrams(like_count DESC) WHERE like_count > 0;
CREATE INDEX idx_diagrams_fork_count ON diagrams(fork_count DESC) WHERE fork_count > 0;

-- Composite indexes for dashboard queries
CREATE INDEX idx_diagrams_user_stats ON diagrams(user_id, view_count DESC, created_at DESC);
CREATE INDEX idx_diagrams_trending ON diagrams(like_count DESC, view_count DESC, created_at DESC) WHERE is_public = TRUE;
```

#### Diagram Versions Table Indexing
```sql
-- Core version indexes (already defined in db_lld_02.md)
CREATE INDEX idx_diagram_versions_diagram_id ON diagram_versions(diagram_id);
CREATE INDEX idx_diagram_versions_version_number ON diagram_versions(diagram_id, version_number);
CREATE INDEX idx_diagram_versions_created_by ON diagram_versions(created_by);
CREATE INDEX idx_diagram_versions_created_at ON diagram_versions(created_at);
CREATE INDEX idx_diagram_versions_content_hash ON diagram_versions(content_hash);
CREATE INDEX idx_diagram_versions_parent ON diagram_versions(parent_version_id);
CREATE INDEX idx_diagram_versions_change_type ON diagram_versions(change_type);

-- Performance optimization indexes
CREATE INDEX idx_diagram_versions_latest ON diagram_versions(diagram_id, version_number DESC);
CREATE INDEX idx_diagram_versions_user_recent ON diagram_versions(created_by, created_at DESC);
CREATE INDEX idx_diagram_versions_change_summary ON diagram_versions USING GIN(to_tsvector('english', change_summary)) WHERE change_summary IS NOT NULL;

-- Cleanup and maintenance indexes
CREATE INDEX idx_diagram_versions_old ON diagram_versions(created_at) WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
```

### 2. Collaboration and Comments Indexing

#### Diagram Collaborators Table Indexing
```sql
-- Core collaboration indexes (already defined in db_lld_02.md)
CREATE INDEX idx_diagram_collaborators_diagram_id ON diagram_collaborators(diagram_id);
CREATE INDEX idx_diagram_collaborators_user_id ON diagram_collaborators(user_id);
CREATE INDEX idx_diagram_collaborators_permission ON diagram_collaborators(permission_level);
CREATE INDEX idx_diagram_collaborators_status ON diagram_collaborators(status);
CREATE INDEX idx_diagram_collaborators_invited_by ON diagram_collaborators(invited_by);
CREATE INDEX idx_diagram_collaborators_expires ON diagram_collaborators(expires_at) WHERE expires_at IS NOT NULL;

-- Advanced collaboration indexes
CREATE INDEX idx_diagram_collaborators_active ON diagram_collaborators(diagram_id, status, permission_level) WHERE status = 'accepted';
CREATE INDEX idx_diagram_collaborators_user_active ON diagram_collaborators(user_id, status, accepted_at) WHERE status = 'accepted';
CREATE INDEX idx_diagram_collaborators_pending ON diagram_collaborators(invited_at DESC) WHERE status = 'pending';
CREATE INDEX idx_diagram_collaborators_inviter_recent ON diagram_collaborators(invited_by, invited_at DESC);
```

#### Diagram Comments Table Indexing
```sql
-- Core comment indexes (already defined in db_lld_02.md)
CREATE INDEX idx_diagram_comments_diagram_id ON diagram_comments(diagram_id);
CREATE INDEX idx_diagram_comments_user_id ON diagram_comments(user_id);
CREATE INDEX idx_diagram_comments_parent ON diagram_comments(parent_comment_id);
CREATE INDEX idx_diagram_comments_created_at ON diagram_comments(created_at);
CREATE INDEX idx_diagram_comments_resolved ON diagram_comments(is_resolved);
CREATE INDEX idx_diagram_comments_position ON diagram_comments USING GIN(position_data) WHERE position_data IS NOT NULL;

-- Performance optimization indexes
CREATE INDEX idx_diagram_comments_thread ON diagram_comments(diagram_id, parent_comment_id, created_at);
CREATE INDEX idx_diagram_comments_user_recent ON diagram_comments(user_id, created_at DESC);
CREATE INDEX idx_diagram_comments_unresolved ON diagram_comments(diagram_id, created_at DESC) WHERE is_resolved = FALSE;
CREATE INDEX idx_diagram_comments_search ON diagram_comments USING GIN(to_tsvector('english', content));
```

### 3. Session and Authentication Indexing

#### User Sessions Table Indexing
```sql
-- Core session indexes (already defined in db_lld_01.md)
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_cleanup ON user_sessions(expires_at, is_active) WHERE expires_at < CURRENT_TIMESTAMP OR is_active = FALSE;

-- Session management optimization
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active, last_accessed_at) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_device ON user_sessions USING GIN(device_info) WHERE device_info IS NOT NULL;
CREATE INDEX idx_user_sessions_ip ON user_sessions(ip_address, created_at) WHERE ip_address IS NOT NULL;
```

## Query Optimization Strategies

### 1. Common Query Patterns and Optimizations

#### User Dashboard Queries
```sql
-- Optimized query for user dashboard with diagram statistics
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    d.id,
    d.title,
    d.description,
    d.format,
    d.is_public,
    d.view_count,
    d.like_count,
    d.created_at,
    d.updated_at,
    COUNT(dc.id) as comment_count,
    COUNT(dcol.id) as collaborator_count
FROM diagrams d
LEFT JOIN diagram_comments dc ON d.id = dc.diagram_id
LEFT JOIN diagram_collaborators dcol ON d.id = dcol.diagram_id AND dcol.status = 'accepted'
WHERE d.user_id = $1
GROUP BY d.id
ORDER BY d.updated_at DESC
LIMIT 20;

-- Optimization: Use covering index to avoid table lookups
CREATE INDEX idx_diagrams_user_dashboard ON diagrams(user_id, updated_at DESC) 
INCLUDE (id, title, description, format, is_public, view_count, like_count, created_at);
```

#### Public Diagram Discovery
```sql
-- Optimized query for public diagram discovery with search
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    d.id,
    d.title,
    d.description,
    d.tags,
    d.view_count,
    d.like_count,
    d.created_at,
    u.username,
    u.display_name
FROM diagrams d
JOIN users u ON d.user_id = u.id
WHERE d.is_public = TRUE
    AND ($1 IS NULL OR to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')) @@ plainto_tsquery('english', $1))
    AND ($2 IS NULL OR d.tags && $2::text[])
ORDER BY 
    CASE WHEN $3 = 'popular' THEN d.view_count END DESC,
    CASE WHEN $3 = 'recent' THEN d.created_at END DESC,
    CASE WHEN $3 = 'liked' THEN d.like_count END DESC
LIMIT $4 OFFSET $5;

-- Optimization: Specialized indexes for different sort orders
CREATE INDEX idx_diagrams_public_popular ON diagrams(is_public, view_count DESC, created_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_diagrams_public_recent ON diagrams(is_public, created_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_diagrams_public_liked ON diagrams(is_public, like_count DESC, created_at DESC) WHERE is_public = TRUE;
```

#### Collaboration Queries
```sql
-- Optimized query for user's collaborative diagrams
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    d.id,
    d.title,
    d.updated_at,
    dc.permission_level,
    dc.accepted_at,
    u.username as owner_username
FROM diagram_collaborators dc
JOIN diagrams d ON dc.diagram_id = d.id
JOIN users u ON d.user_id = u.id
WHERE dc.user_id = $1 
    AND dc.status = 'accepted'
ORDER BY d.updated_at DESC
LIMIT 20;

-- Optimization: Covering index for collaboration queries
CREATE INDEX idx_diagram_collaborators_user_details ON diagram_collaborators(user_id, status, accepted_at)
INCLUDE (diagram_id, permission_level) WHERE status = 'accepted';
```

### 2. JSONB Query Optimization

#### Diagram Content Search
```sql
-- Optimized JSONB queries for diagram content
-- Search for specific node types in React Flow diagrams
EXPLAIN (ANALYZE, BUFFERS)
SELECT d.id, d.title
FROM diagrams d
WHERE d.format = 'react_flow'
    AND d.content->'nodes' @> '[{"type": "decision"}]';

-- Search for Mermaid diagram types
EXPLAIN (ANALYZE, BUFFERS)
SELECT d.id, d.title
FROM diagrams d
WHERE d.format = 'mermaid'
    AND d.content->>'type' = 'flowchart';

-- Specialized JSONB indexes
CREATE INDEX idx_diagrams_react_flow_nodes ON diagrams USING GIN((content->'nodes')) WHERE format = 'react_flow';
CREATE INDEX idx_diagrams_mermaid_type ON diagrams((content->>'type')) WHERE format = 'mermaid';
```

### 3. Aggregation Query Optimization

#### User Statistics
```sql
-- Optimized user statistics query
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    u.id,
    u.username,
    COUNT(d.id) as diagram_count,
    SUM(d.view_count) as total_views,
    SUM(d.like_count) as total_likes,
    COUNT(d.id) FILTER (WHERE d.is_public = TRUE) as public_diagrams
FROM users u
LEFT JOIN diagrams d ON u.id = d.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username
HAVING COUNT(d.id) > 0
ORDER BY total_views DESC
LIMIT 50;

-- Materialized view for expensive aggregations
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(d.id) as diagram_count,
    SUM(d.view_count) as total_views,
    SUM(d.like_count) as total_likes,
    COUNT(d.id) FILTER (WHERE d.is_public = TRUE) as public_diagrams,
    MAX(d.updated_at) as last_diagram_update
FROM users u
LEFT JOIN diagrams d ON u.id = d.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username;

CREATE UNIQUE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_statistics_views ON user_statistics(total_views DESC);

-- Refresh materialized view periodically
-- Schedule: REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
```

## Performance Monitoring and Maintenance

### 1. Query Performance Monitoring
```sql
-- Enable query statistics collection
-- Add to postgresql.conf:
-- shared_preload_libraries = 'pg_stat_statements'
-- pg_stat_statements.track = all

-- Monitor slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100  -- queries taking more than 100ms on average
ORDER BY mean_time DESC
LIMIT 20;

-- Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- unused indexes
ORDER BY schemaname, tablename;

-- Monitor table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### 2. Index Maintenance Procedures
```sql
-- Index maintenance function
CREATE OR REPLACE FUNCTION maintain_indexes()
RETURNS void AS $$
BEGIN
    -- Reindex heavily used indexes
    REINDEX INDEX CONCURRENTLY idx_diagrams_user_created;
    REINDEX INDEX CONCURRENTLY idx_diagrams_search;
    REINDEX INDEX CONCURRENTLY idx_user_sessions_active;
    
    -- Update table statistics
    ANALYZE users;
    ANALYZE diagrams;
    ANALYZE diagram_versions;
    ANALYZE diagram_collaborators;
    ANALYZE diagram_comments;
    ANALYZE user_sessions;
    
    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
    
    RAISE NOTICE 'Index maintenance completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule index maintenance (example cron job)
-- 0 2 * * 0  # Weekly on Sunday at 2 AM
-- psql -d diagramai -c "SELECT maintain_indexes();"
```

### 3. Automated Cleanup Procedures
```sql
-- Cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
       OR (is_active = FALSE AND last_accessed_at < CURRENT_TIMESTAMP - INTERVAL '30 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % expired sessions', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old password reset tokens
CREATE OR REPLACE FUNCTION cleanup_old_reset_tokens()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
       OR used_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % old reset tokens', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Archive old diagram versions
CREATE OR REPLACE FUNCTION archive_old_versions()
RETURNS integer AS $$
DECLARE
    archived_count integer;
BEGIN
    -- Keep only last 50 versions per diagram, archive older ones
    WITH versions_to_archive AS (
        SELECT id
        FROM (
            SELECT id, 
                   ROW_NUMBER() OVER (PARTITION BY diagram_id ORDER BY version_number DESC) as rn
            FROM diagram_versions
        ) ranked
        WHERE rn > 50
    )
    UPDATE diagram_versions 
    SET archived = TRUE, archived_at = CURRENT_TIMESTAMP
    WHERE id IN (SELECT id FROM versions_to_archive)
      AND archived = FALSE;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    RAISE NOTICE 'Archived % old diagram versions', archived_count;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

## Caching Strategies

### 1. Application-Level Caching
```typescript
// Query result caching with Redis
interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
  tags?: string[]; // For cache invalidation
}

class QueryCache {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in service layer
export class DiagramService {
  private cache = new QueryCache();
  
  async getUserDiagrams(userId: string): Promise<Diagram[]> {
    const cacheKey = `user:${userId}:diagrams`;
    
    // Check cache first
    const cached = await this.cache.get<Diagram[]>(cacheKey);
    if (cached) return cached;
    
    // Query database
    const diagrams = await prisma.diagram.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    
    // Cache result for 5 minutes
    await this.cache.set(cacheKey, diagrams, 300);
    
    return diagrams;
  }
  
  async updateDiagram(id: string, data: any): Promise<Diagram> {
    const diagram = await prisma.diagram.update({
      where: { id },
      data,
    });
    
    // Invalidate related caches
    await this.cache.invalidate(`user:${diagram.userId}:*`);
    await this.cache.invalidate(`diagram:${id}:*`);
    
    return diagram;
  }
}
```

### 2. Database Connection Optimization
```typescript
// Prisma connection optimization
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Connection pooling configuration
// DATABASE_URL="postgresql://user:password@localhost:5432/db?connection_limit=20&pool_timeout=20"

// Query optimization with Prisma
export const optimizedQueries = {
  // Use select to limit fields
  getUserDashboard: (userId: string) =>
    prisma.diagram.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        format: true,
        isPublic: true,
        viewCount: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: true,
            collaborators: {
              where: { status: 'accepted' }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
  
  // Use include strategically
  getDiagramWithDetails: (id: string) =>
    prisma.diagram.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, displayName: true }
        },
        collaborators: {
          where: { status: 'accepted' },
          include: {
            user: {
              select: { id: true, username: true, displayName: true }
            }
          }
        },
        _count: {
          select: {
            versions: true,
            comments: true
          }
        }
      }
    }),
};
```

## Performance Benchmarks and Targets

### 1. Query Performance Targets
```sql
-- Performance targets for common queries
-- User dashboard: < 50ms
-- Diagram search: < 100ms
-- Collaboration queries: < 30ms
-- Version history: < 75ms
-- Comment threads: < 25ms

-- Benchmark queries
\timing on

-- Benchmark: User dashboard query
SELECT COUNT(*) FROM (
    SELECT d.id
    FROM diagrams d
    WHERE d.user_id = 'sample-user-id'
    ORDER BY d.updated_at DESC
    LIMIT 20
) AS benchmark;

-- Benchmark: Public diagram search
SELECT COUNT(*) FROM (
    SELECT d.id
    FROM diagrams d
    WHERE d.is_public = TRUE
        AND to_tsvector('english', d.title) @@ plainto_tsquery('english', 'flowchart')
    ORDER BY d.view_count DESC
    LIMIT 50
) AS benchmark;
```

### 2. Monitoring Alerts
```sql
-- Create monitoring views for alerting
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    (total_time / calls) as avg_time_ms
FROM pg_stat_statements
WHERE mean_time > 100  -- Alert threshold: 100ms
ORDER BY mean_time DESC;

CREATE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    CASE WHEN idx_scan = 0 THEN 'UNUSED' ELSE 'USED' END as status
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Implement performance monitoring dashboard
2. Set up automated maintenance procedures
3. Establish performance benchmarking and alerting

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/database/performance-guide.md`
- **Operations Documentation**: `/docs/documentation/database/maintenance-procedures.md`
- **Monitoring Documentation**: `/docs/documentation/database/monitoring-setup.md`

**Integration Points:**
- **Application Layer**: Query optimization and caching integration
- **Monitoring**: Performance metrics and alerting systems
- **DevOps**: Automated maintenance and backup procedures
- **Development**: Query analysis and optimization workflows

This comprehensive indexing and optimization strategy ensures DiagramAI maintains excellent performance as it scales, with proactive monitoring and maintenance procedures to sustain optimal database performance over time.
