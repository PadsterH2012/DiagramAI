# DiagramAI Production Deployment

## Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 5433, 6379, and 8080 available (Note: PostgreSQL uses 5433 to avoid conflicts)

### Option 1: Use Published Docker Image (Recommended)

```bash
# 1. Download the production docker-compose file
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/docker-compose.prod.yml -o docker-compose.prod.yml

# 2. Download required configuration files
mkdir -p scripts
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/scripts/init-db.sql -o scripts/init-db.sql
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/redis.conf -o redis.conf

# 3. Start all services using the production compose file
docker compose -f docker-compose.prod.yml up -d

# 4. Check status
docker compose -f docker-compose.prod.yml ps

# 5. View logs
docker compose -f docker-compose.prod.yml logs -f app
```

### Option 2: Clone Repository (Alternative)

```bash
# 1. Clone the repository (for docker-compose files)
git clone https://github.com/PadsterH2012/DiagramAI.git
cd DiagramAI/DiagramAI

# 2. Start all services using the production compose file
docker compose -f docker-compose.prod.yml up -d
```

## Available Services

After starting with docker-compose:

- **DiagramAI Application**: http://localhost:3000
- **Database Admin (Adminer)**: http://localhost:8080
- **PostgreSQL**: localhost:5433 (external), 5432 (internal)
- **Redis**: localhost:6379

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string  
- `NEXTAUTH_SECRET`: Secret key for authentication
- `NEXTAUTH_URL`: Base URL for the application

### Optional
- `NODE_ENV`: Set to "production"
- API keys for AI services (OpenAI, Anthropic, etc.)

## Health Checks

The application includes health checks:

```bash
# Check application health
curl http://localhost:3000/api/health

# Check with docker-compose
docker-compose -f docker-compose.prod.yml exec app curl -f http://localhost:3000/api/health
```

## Stopping Services

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: This deletes data)
docker-compose -f docker-compose.prod.yml down -v
```

## Available Docker Images

- **Latest**: `padster2012/diagramai:latest`
- **Versioned**: `padster2012/diagramai:1.0.40`

## Troubleshooting

### Check logs
```bash
docker-compose -f docker-compose.prod.yml logs app
docker-compose -f docker-compose.prod.yml logs db
docker-compose -f docker-compose.prod.yml logs redis
```

### Restart services
```bash
docker-compose -f docker-compose.prod.yml restart app
```

### Database issues
```bash
# Connect to database
docker compose -f docker-compose.prod.yml exec db psql -U postgres -d diagramai_dev

# Or connect from host
psql -h localhost -p 5433 -U postgres -d diagramai_dev
```

## Common Issues and Solutions

### Database Connection Errors
If you see "database error" in health checks:

1. **Database name mismatch**: Ensure `POSTGRES_DB=diagramai_dev` matches the DATABASE_URL
2. **Port conflicts**: If port 5432 is in use, the compose file uses 5433 externally
3. **Init script issues**: Ensure `scripts/init-db.sql` exists and is a file (not directory)

```bash
# Fix init script issue
rm -rf scripts
mkdir -p scripts
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/scripts/init-db.sql -o scripts/init-db.sql
```

### Image Pull Errors
If you see "pull access denied for diagramai-fixed":

The docker-compose.prod.yml should use `padster2012/diagramai:latest`, not `diagramai-fixed`.

### Port Conflicts
If you get "port already in use" errors:

```bash
# Check what's using the ports
ss -tlnp | grep 5432
ss -tlnp | grep 5433

# The compose file uses 5433 externally to avoid conflicts
```

## Security Notes

- Change the default `NEXTAUTH_SECRET` in production
- Consider using environment files (.env) for sensitive data
- Use proper firewall rules for exposed ports
- Consider using a reverse proxy (nginx) for SSL termination
