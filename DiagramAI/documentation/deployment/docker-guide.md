# 🚀 DiagramAI Deployment Guide

## Overview

This guide covers deploying DiagramAI with MCP support for agent collaboration. The system consists of three main components:

1. **DiagramAI Frontend** (React/Next.js) - Port 3000
2. **DiagramAI MCP Server** (Node.js) - Port 3001  
3. **PostgreSQL Database** - Port 5432

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for development)
- Git
- 4GB+ RAM recommended
- 10GB+ disk space

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DiagramAI     │    │ DiagramAI MCP   │    │   PostgreSQL    │
│   Frontend      │    │     Server      │    │    Database     │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MCP Agents    │
                    │  (Your Code)    │
                    └─────────────────┘
```

## 🐳 Docker Deployment (Recommended)

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/DiagramAI.git
cd DiagramAI
```

### Step 2: Environment Configuration

Create `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://diagramai:password123@postgres:5432/diagramai"
POSTGRES_USER=diagramai
POSTGRES_PASSWORD=password123
POSTGRES_DB=diagramai

# MCP Server Configuration
DIAGRAMAI_API_KEY="your-secure-api-key-here"
DIAGRAMAI_WS_URL="ws://localhost:3000/ws/diagrams"
MCP_AGENT_ID="default-agent"

# Application Configuration
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: External API Keys (for AI features)
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
OPENROUTER_API_KEY="your-openrouter-key"
```

### Step 3: Docker Compose Setup

The project includes a complete `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # DiagramAI Frontend
  diagramai:
    build:
      context: ./DiagramAI
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./DiagramAI:/app
      - /app/node_modules
      - /app/.next

  # DiagramAI MCP Server
  mcp-server:
    build:
      context: ./DiagramAI-MCP-Server
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      DIAGRAMAI_API_KEY: ${DIAGRAMAI_API_KEY}
      DIAGRAMAI_WS_URL: ${DIAGRAMAI_WS_URL}
      MCP_AGENT_ID: ${MCP_AGENT_ID}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      diagramai:
        condition: service_started
    volumes:
      - ./DiagramAI-MCP-Server:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### Step 4: Build and Deploy

```bash
# Build and start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 5: Database Migration

The database will be automatically migrated on first startup. To manually run migrations:

```bash
# Enter the DiagramAI container
docker-compose exec diagramai bash

# Run Prisma migrations
npx prisma migrate deploy
npx prisma generate
```

### Step 6: Verify Deployment

1. **Frontend**: Visit http://localhost:3000
2. **MCP Server**: Check http://localhost:3001/health
3. **Database**: Connect to postgresql://diagramai:password123@localhost:5432/diagramai

## 🔧 Manual Deployment

### Step 1: Database Setup

Install and configure PostgreSQL:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE diagramai;
CREATE USER diagramai WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE diagramai TO diagramai;
\q
```

### Step 2: DiagramAI Frontend

```bash
cd DiagramAI
npm install
npm run build

# Set environment variables
export DATABASE_URL="postgresql://diagramai:password123@localhost:5432/diagramai"
export NEXTAUTH_SECRET="your-nextauth-secret"
export NEXTAUTH_URL="http://localhost:3000"

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start the application
npm start
```

### Step 3: MCP Server

```bash
cd DiagramAI-MCP-Server
npm install
npm run build

# Set environment variables
export DATABASE_URL="postgresql://diagramai:password123@localhost:5432/diagramai"
export DIAGRAMAI_API_KEY="your-secure-api-key"
export DIAGRAMAI_WS_URL="ws://localhost:3000/ws/diagrams"

# Start the MCP server
npm start
```

## 🔐 Security Configuration

### API Key Setup

1. **Generate Secure API Key:**
```bash
# Generate a secure random key
openssl rand -hex 32
```

2. **Add to Database:**
```sql
INSERT INTO "AgentCredential" (
  id, name, "apiKey", permissions, "isActive", "createdAt", "updatedAt"
) VALUES (
  'default-agent',
  'Default MCP Agent',
  'your-generated-api-key',
  '{"diagrams": ["create", "read", "update", "delete"], "nodes": ["create", "read", "update", "delete"], "edges": ["create", "read", "update", "delete"]}',
  true,
  NOW(),
  NOW()
);
```

### Network Security

For production deployment:

```yaml
# docker-compose.prod.yml
services:
  postgres:
    # Remove port exposure for security
    # ports:
    #   - "5432:5432"
    
  diagramai:
    # Bind to specific interface
    ports:
      - "127.0.0.1:3000:3000"
      
  mcp-server:
    # Internal network only
    ports:
      - "127.0.0.1:3001:3001"
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- **Frontend**: `GET http://localhost:3000/api/health`
- **MCP Server**: `GET http://localhost:3001/health`
- **Database**: Use `pg_isready` command

### Docker Health Checks

```bash
# Check container health
docker-compose ps

# View detailed health status
docker inspect diagramai_diagramai_1 | grep -A 10 Health

# Monitor logs
docker-compose logs -f --tail=100
```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats

# Check database connections
docker-compose exec postgres psql -U diagramai -d diagramai -c "SELECT count(*) FROM pg_stat_activity;"
```

## 🔄 Updates & Maintenance

### Updating DiagramAI

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Run any new migrations
docker-compose exec diagramai npx prisma migrate deploy
```

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U diagramai diagramai > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T postgres psql -U diagramai diagramai < backup_file.sql
```

### Log Management

```bash
# Rotate logs
docker-compose logs --no-color > diagramai_logs_$(date +%Y%m%d).log

# Clear old logs
docker system prune -f
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts:**
```bash
# Check what's using ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :5432
```

2. **Database Connection Issues:**
```bash
# Test database connection
docker-compose exec postgres psql -U diagramai -d diagramai -c "SELECT version();"
```

3. **MCP Server Connection:**
```bash
# Test MCP server
curl http://localhost:3001/health
```

### Debug Mode

Enable debug logging:

```bash
# Add to .env
DEBUG=mcp:*,diagramai:*
LOG_LEVEL=debug

# Restart services
docker-compose restart
```

## 🚀 Production Considerations

### Scaling

- Use a reverse proxy (nginx) for load balancing
- Consider Redis for session storage
- Implement database connection pooling
- Use CDN for static assets

### Security

- Use HTTPS in production
- Implement rate limiting
- Regular security updates
- Database encryption at rest

### Backup Strategy

- Automated daily database backups
- Application data backup
- Configuration backup
- Disaster recovery plan

## 📝 Next Steps

1. **Test MCP Integration**: Follow the [MCP Agent Setup Guide](./MCP_AGENT_SETUP_GUIDE.md)
2. **API Reference**: Review the [API Reference](./API_REFERENCE.md)
3. **Troubleshooting**: Check [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Deployment Complete! 🎉** Your DiagramAI instance is ready for MCP agent collaboration.
