# DiagramAI Production Deployment

## Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 5432, 6379, and 8080 available

### Option 1: Use Published Docker Image (Recommended)

```bash
# 1. Clone the repository (for docker-compose files)
git clone https://github.com/PadsterH2012/DiagramAI.git
cd DiagramAI/DiagramAI

# 2. Start all services using the production compose file
docker-compose -f docker-compose.prod.yml up -d

# 3. Check status
docker-compose -f docker-compose.prod.yml ps

# 4. View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Option 2: Pull Image Manually

```bash
# 1. Pull the latest image
docker pull padster2012/diagramai:latest

# 2. Start dependencies manually
docker run -d --name diagramai-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=diagramai \
  -p 5432:5432 \
  postgres:15-alpine

docker run -d --name diagramai-redis \
  -p 6379:6379 \
  redis:7-alpine

# 3. Start DiagramAI
docker run -d --name diagramai-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@localhost:5432/diagramai" \
  -e REDIS_URL="redis://localhost:6379" \
  -e NEXTAUTH_SECRET="your-production-secret-key" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  --link diagramai-db:db \
  --link diagramai-redis:redis \
  padster2012/diagramai:latest
```

## Available Services

After starting with docker-compose:

- **DiagramAI Application**: http://localhost:3000
- **Database Admin (Adminer)**: http://localhost:8080
- **PostgreSQL**: localhost:5432
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
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d diagramai
```

## Security Notes

- Change the default `NEXTAUTH_SECRET` in production
- Consider using environment files (.env) for sensitive data
- Use proper firewall rules for exposed ports
- Consider using a reverse proxy (nginx) for SSL termination
