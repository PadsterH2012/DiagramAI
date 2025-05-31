# 🔧 DiagramAI Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues with DiagramAI and MCP agent integration.

## 🚨 Quick Diagnostics

### System Health Check

Run this comprehensive health check:

```bash
#!/bin/bash
echo "🔍 DiagramAI Health Check"
echo "========================"

# Check Docker services
echo "📦 Docker Services:"
docker-compose ps

# Check ports
echo -e "\n🌐 Port Status:"
netstat -tulpn | grep -E ":(3000|3001|5432)"

# Check database connection
echo -e "\n🗄️ Database Connection:"
docker-compose exec postgres pg_isready -U diagramai

# Check MCP server health
echo -e "\n🤖 MCP Server Health:"
curl -s http://localhost:3001/health || echo "MCP Server not responding"

# Check frontend health
echo -e "\n🌐 Frontend Health:"
curl -s http://localhost:3000/api/health || echo "Frontend not responding"

echo -e "\n✅ Health check complete"
```

## 🐳 Docker Issues

### Container Won't Start

**Symptoms:**
- `docker-compose up` fails
- Containers exit immediately
- Port binding errors

**Solutions:**

1. **Check port conflicts:**
```bash
# Find what's using the ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :5432

# Kill conflicting processes
sudo kill -9 <PID>
```

2. **Clear Docker cache:**
```bash
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

3. **Check Docker logs:**
```bash
docker-compose logs diagramai
docker-compose logs mcp-server
docker-compose logs postgres
```

### Database Connection Failed

**Symptoms:**
- "Connection refused" errors
- "Database does not exist" errors
- Migration failures

**Solutions:**

1. **Wait for database startup:**
```bash
# Database needs time to initialize
docker-compose up postgres
# Wait for "database system is ready to accept connections"
```

2. **Check database credentials:**
```bash
# Verify .env file
cat .env | grep -E "(POSTGRES|DATABASE)"

# Test connection manually
docker-compose exec postgres psql -U diagramai -d diagramai -c "SELECT version();"
```

3. **Reset database:**
```bash
docker-compose down -v
docker volume rm diagramai_postgres_data
docker-compose up -d postgres
# Wait for initialization, then start other services
```

## 🌐 Network Issues

### WebSocket Connection Failed

**Symptoms:**
- Real-time updates not working
- "WebSocket connection failed" in browser console
- MCP agents can't connect

**Solutions:**

1. **Check WebSocket endpoint:**
```bash
# Test WebSocket connection
wscat -c ws://localhost:3000/ws/diagrams
```

2. **Verify frontend is running:**
```bash
curl http://localhost:3000
```

3. **Check firewall/proxy settings:**
```bash
# Ensure WebSocket traffic is allowed
# Check if running behind proxy that blocks WebSocket upgrades
```

### MCP Server Unreachable

**Symptoms:**
- MCP tools return connection errors
- `curl http://localhost:3001/health` fails
- Agent authentication fails

**Solutions:**

1. **Check MCP server status:**
```bash
docker-compose logs mcp-server
```

2. **Verify environment variables:**
```bash
docker-compose exec mcp-server env | grep -E "(DATABASE|DIAGRAMAI)"
```

3. **Test direct connection:**
```bash
# Test MCP server health endpoint
curl -v http://localhost:3001/health

# Test with authentication
curl -H "Authorization: Bearer your-api-key" http://localhost:3001/health
```

## 🔐 Authentication Issues

### API Key Authentication Failed

**Symptoms:**
- "Authentication failed" errors
- "Invalid API key" messages
- MCP tools return 401 errors

**Solutions:**

1. **Verify API key in database:**
```sql
-- Connect to database
docker-compose exec postgres psql -U diagramai -d diagramai

-- Check API keys
SELECT id, name, "apiKey", "isActive" FROM "AgentCredential";
```

2. **Check environment variable:**
```bash
echo $DIAGRAMAI_API_KEY
# Should match the key in database
```

3. **Create new API key:**
```bash
# Generate secure key
openssl rand -hex 32

# Add to database
docker-compose exec postgres psql -U diagramai -d diagramai -c "
INSERT INTO \"AgentCredential\" (id, name, \"apiKey\", permissions, \"isActive\", \"createdAt\", \"updatedAt\") 
VALUES ('new-agent', 'New Agent', 'your-new-key', '{\"diagrams\": [\"create\", \"read\", \"update\", \"delete\"]}', true, NOW(), NOW());
"
```

## 🤖 MCP Agent Issues

### Agent Can't Connect to MCP Server

**Symptoms:**
- MCP client connection timeouts
- "Transport error" messages
- Agent tools not working

**Solutions:**

1. **Check MCP server logs:**
```bash
docker-compose logs -f mcp-server
```

2. **Verify agent configuration:**
```typescript
// Check your agent configuration
const transport = new StdioClientTransport({
  command: 'node',
  args: ['path/to/diagramai-mcp-server/dist/index.js'],
  env: {
    DIAGRAMAI_API_KEY: process.env.DIAGRAMAI_API_KEY,
    DIAGRAMAI_WS_URL: 'ws://localhost:3000/ws/diagrams',
    DATABASE_URL: process.env.DATABASE_URL
  }
});
```

3. **Test MCP server directly:**
```bash
# Run MCP server in debug mode
cd DiagramAI-MCP-Server
DEBUG=mcp:* npm start
```

### Tool Execution Failures

**Symptoms:**
- MCP tools return errors
- "Tool not found" messages
- Validation errors

**Solutions:**

1. **Check tool availability:**
```bash
# List available tools
curl -H "Authorization: Bearer your-api-key" http://localhost:3001/tools
```

2. **Validate tool arguments:**
```typescript
// Ensure all required arguments are provided
const result = await client.callTool({
  name: 'create_diagram',
  arguments: {
    name: 'Test Diagram',        // Required
    description: 'Test desc'     // Optional
  }
});
```

3. **Check database state:**
```sql
-- Verify diagram exists
SELECT uuid, name FROM "Diagram" WHERE uuid = 'your-diagram-uuid';

-- Check nodes and edges
SELECT id, type, data FROM "Node" WHERE "diagramUuid" = 'your-diagram-uuid';
```

## 🗄️ Database Issues

### Database Tables Missing (diagrams table not found)

**Symptoms:**
- Error: "The table `public.diagrams` does not exist in the current database"
- "Recent Diagrams" section shows database error
- API endpoint `/api/diagrams` returns 500 error

**Root Cause:**
Database migrations haven't been applied to create the required tables.

**Solutions:**

1. **Automatic fix (Docker):**
```bash
# Restart containers to trigger migration
docker-compose down
docker-compose up -d

# Check startup logs
docker-compose logs -f app
```

2. **Manual migration:**
```bash
# Enter application container
docker-compose exec app bash

# Run migrations manually
npx prisma migrate deploy
npx prisma generate
```

3. **Reset database completely:**
```bash
# Enter application container
docker-compose exec app bash

# Reset and apply all migrations
npx prisma migrate reset --force
npx prisma migrate deploy
```

4. **Verify table creation:**
```bash
# Check database tables
docker-compose exec db psql -U postgres -d diagramai_dev -c "\\dt"

# Test API endpoint
curl http://localhost:3000/api/diagrams
```

**Prevention:**
- Ensure `scripts/verify-database.sh` runs during container startup
- Check health endpoint: `http://localhost:3000/api/health`
- Monitor container logs during startup

### Migration Failures

**Symptoms:**
- "Migration failed" errors
- Database schema out of sync
- Missing tables/columns

**Solutions:**

1. **Reset and re-run migrations:**
```bash
docker-compose exec diagramai npx prisma migrate reset --force
docker-compose exec diagramai npx prisma migrate deploy
docker-compose exec diagramai npx prisma generate
```

2. **Check migration status:**
```bash
docker-compose exec diagramai npx prisma migrate status
```

3. **Manual schema inspection:**
```sql
-- Check if tables exist
\dt

-- Check specific table structure
\d "Diagram"
\d "Node"
\d "Edge"
\d "AgentCredential"
```

### Performance Issues

**Symptoms:**
- Slow query responses
- High CPU/memory usage
- Timeout errors

**Solutions:**

1. **Check database performance:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

2. **Monitor resource usage:**
```bash
docker stats
```

3. **Optimize database:**
```sql
-- Analyze tables
ANALYZE;

-- Vacuum tables
VACUUM ANALYZE;
```

## 🔄 Real-time Sync Issues

### Changes Not Syncing

**Symptoms:**
- Agent changes don't appear in UI
- UI changes don't reach agents
- Conflict resolution not working

**Solutions:**

1. **Check WebSocket connection:**
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3000/ws/diagrams');
ws.onopen = () => console.log('Connected');
ws.onmessage = (msg) => console.log('Message:', msg.data);
ws.onerror = (err) => console.error('Error:', err);
```

2. **Verify event queue:**
```bash
# Check MCP server logs for event queue activity
docker-compose logs mcp-server | grep -E "(queue|event)"
```

3. **Test conflict resolution:**
```typescript
// Create simultaneous operations to test conflict resolution
const agent1 = new DiagramAIAgent();
const agent2 = new DiagramAIAgent();

// Both agents update same node simultaneously
await Promise.all([
  agent1.updateNode(diagramUuid, nodeId, { data: { label: 'Agent 1' } }),
  agent2.updateNode(diagramUuid, nodeId, { data: { label: 'Agent 2' } })
]);
```

## 📊 Performance Debugging

### Enable Debug Logging

1. **MCP Server debug:**
```bash
# Add to .env
DEBUG=mcp:*,diagramai:*
LOG_LEVEL=debug

# Restart services
docker-compose restart mcp-server
```

2. **Database query logging:**
```bash
# Add to .env
DATABASE_LOGGING=true

# Or enable in Prisma
# Add to schema.prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

3. **WebSocket debugging:**
```javascript
// In browser console
localStorage.setItem('debug', 'socket.io-client:*');
```

### Performance Monitoring

```bash
# Monitor system resources
htop

# Monitor Docker containers
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Monitor database
docker-compose exec postgres psql -U diagramai -d diagramai -c "
SELECT 
  datname,
  numbackends,
  xact_commit,
  xact_rollback,
  blks_read,
  blks_hit
FROM pg_stat_database 
WHERE datname = 'diagramai';
"
```

## 🆘 Emergency Recovery

### Complete System Reset

If all else fails, perform a complete reset:

```bash
#!/bin/bash
echo "🚨 Emergency Reset - This will delete all data!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
  # Stop all services
  docker-compose down -v
  
  # Remove all containers and volumes
  docker system prune -af
  docker volume prune -f
  
  # Remove node_modules and rebuild
  rm -rf DiagramAI/node_modules DiagramAI/.next
  rm -rf DiagramAI-MCP-Server/node_modules DiagramAI-MCP-Server/dist
  
  # Fresh start
  docker-compose up -d --build
  
  echo "✅ System reset complete"
else
  echo "❌ Reset cancelled"
fi
```

## 📞 Getting Help

### Collect Debug Information

Before seeking help, collect this information:

```bash
#!/bin/bash
echo "📋 DiagramAI Debug Information" > debug_info.txt
echo "==============================" >> debug_info.txt
echo "" >> debug_info.txt

echo "System Information:" >> debug_info.txt
uname -a >> debug_info.txt
docker --version >> debug_info.txt
docker-compose --version >> debug_info.txt
echo "" >> debug_info.txt

echo "Service Status:" >> debug_info.txt
docker-compose ps >> debug_info.txt
echo "" >> debug_info.txt

echo "Recent Logs:" >> debug_info.txt
docker-compose logs --tail=50 >> debug_info.txt

echo "Debug information saved to debug_info.txt"
```

### Support Channels

1. **GitHub Issues**: Report bugs and feature requests
2. **Documentation**: Check all documentation files
3. **Community**: Join discussions and get help

---

**Still having issues?** Create a GitHub issue with your debug information and detailed problem description.
