# DevOps LLD 02: Container Orchestration and Environment Management

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - DevOps Container Strategy  
**Domain:** DevOps and Infrastructure  
**Coverage Area:** Container orchestration, Docker strategies, environment management  
**Prerequisites:** devops_lld_01.md, project_hld.md, techstack.md  

## Purpose and Scope

This document defines the container orchestration strategy and environment management for DiagramAI. It establishes Docker containerization approaches, environment configuration management, and deployment strategies that ensure consistent, scalable, and maintainable application delivery across all environments.

**Coverage Areas in This Document:**
- Docker containerization strategy and implementation
- Environment configuration and management
- Container orchestration for different deployment scenarios
- Development environment consistency
- Production deployment optimization

**Related LLD Files:**
- devops_lld_01.md: Deployment pipeline and CI/CD workflow
- devops_lld_03.md: Infrastructure as code and monitoring
- coding_lld_01.md: Backend architecture and API design

## Technology Foundation

### Container Technology Stack
Based on validated research findings and Next.js 15+ optimization:

**Primary Strategy:**
- **Vercel Platform**: Primary deployment with native Next.js optimization
- **Docker**: Containerization for development consistency and alternative deployments
- **Node.js 18+ Alpine**: Lightweight base images for production

**Alternative Deployment:**
- **Docker Compose**: Local development environment
- **Kubernetes**: Enterprise deployment scenarios
- **AWS ECS/Fargate**: Cloud container orchestration

## Container Strategy Overview

### 1. Deployment Strategy Matrix
```
┌─────────────────────────────────────────────────────────────┐
│                DiagramAI Deployment Strategies             │
├─────────────────────────────────────────────────────────────┤
│  Primary: Vercel Platform                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Native Next.js optimization, Edge functions        │   │
│  │ Automatic scaling, Global CDN, Zero config         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Alternative: Docker Containers                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Self-hosted, Enterprise, Development consistency    │   │
│  │ Kubernetes, Docker Compose, Cloud providers        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Container Architecture
```dockerfile
# Multi-stage Docker build for optimization
FROM node:18-alpine AS base
FROM base AS deps
FROM base AS builder  
FROM base AS runner
```

## Docker Implementation

### 1. Production Dockerfile
```dockerfile
# Dockerfile
# Multi-stage build for optimal production image

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build application
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
```

### 2. Development Docker Setup
```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Install dependencies for development
RUN apk add --no-cache \
    git \
    curl \
    bash

# Copy package files
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port and start development server
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### 3. Docker Compose for Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/diagramai_dev
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=dev-secret-key
    depends_on:
      - db
      - redis
    networks:
      - diagramai-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=diagramai_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - diagramai-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - diagramai-network

  adminer:
    image: adminer:latest
    ports:
      - "8080:8080"
    environment:
      - ADMINER_DEFAULT_SERVER=db
    depends_on:
      - db
    networks:
      - diagramai-network

volumes:
  postgres_data:
  redis_data:

networks:
  diagramai-network:
    driver: bridge
```

## Environment Management

### 1. Environment Configuration Strategy
```yaml
# Environment Configuration Matrix
environments:
  development:
    platform: "Docker Compose"
    database: "PostgreSQL (local container)"
    cache: "Redis (local container)"
    ai_providers: "Mock/Development keys"
    monitoring: "Basic logging"
    
  staging:
    platform: "Vercel"
    database: "PostgreSQL (cloud)"
    cache: "Redis (cloud)"
    ai_providers: "Development keys"
    monitoring: "Full monitoring"
    
  production:
    platform: "Vercel"
    database: "PostgreSQL (production)"
    cache: "Redis (production)"
    ai_providers: "Production keys"
    monitoring: "Full monitoring + alerting"
```

### 2. Environment Variables Management
```bash
# .env.local (development)
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/diagramai_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key"
REDIS_URL="redis://localhost:6379"

# AI Provider Keys (development)
OPENAI_API_KEY="sk-dev-key"
ANTHROPIC_API_KEY="dev-key"
AZURE_OPENAI_KEY="dev-key"

# .env.production (production)
NODE_ENV=production
DATABASE_URL="${DATABASE_URL}"
NEXTAUTH_URL="${NEXTAUTH_URL}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
REDIS_URL="${REDIS_URL}"

# AI Provider Keys (production)
OPENAI_API_KEY="${OPENAI_API_KEY}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"
AZURE_OPENAI_KEY="${AZURE_OPENAI_KEY}"
```

### 3. Configuration Management
```typescript
// config/environment.ts
interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  database: {
    url: string;
    ssl: boolean;
  };
  auth: {
    secret: string;
    url: string;
  };
  ai: {
    openai: string;
    anthropic: string;
    azure: string;
  };
  redis: {
    url: string;
  };
}

export const config: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    url: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === 'production',
  },
  
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!,
  },
  
  ai: {
    openai: process.env.OPENAI_API_KEY!,
    anthropic: process.env.ANTHROPIC_API_KEY!,
    azure: process.env.AZURE_OPENAI_KEY!,
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};

// Validation
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'OPENAI_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## Container Orchestration Strategies

### 1. Kubernetes Deployment (Enterprise)
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: diagramai-app
  labels:
    app: diagramai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: diagramai
  template:
    metadata:
      labels:
        app: diagramai
    spec:
      containers:
      - name: diagramai
        image: diagramai:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: diagramai-secrets
              key: database-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: diagramai-secrets
              key: nextauth-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: diagramai-service
spec:
  selector:
    app: diagramai
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 2. AWS ECS Task Definition
```json
{
  "family": "diagramai-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "diagramai",
      "image": "your-account.dkr.ecr.region.amazonaws.com/diagramai:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:diagramai/database-url"
        },
        {
          "name": "NEXTAUTH_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:diagramai/nextauth-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/diagramai",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

## Development Environment Setup

### 1. Quick Start with Docker Compose
```bash
# Clone repository
git clone https://github.com/your-org/diagramai.git
cd diagramai

# Copy environment file
cp .env.example .env.local

# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop environment
docker-compose down
```

### 2. Development Scripts
```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "dev:docker": "docker-compose up",
    "dev:build": "docker-compose build",
    "dev:clean": "docker-compose down -v",
    "dev:logs": "docker-compose logs -f",
    "dev:shell": "docker-compose exec app sh"
  }
}
```

### 3. Database Management in Containers
```bash
# Database operations with Docker
docker-compose exec db psql -U postgres -d diagramai_dev

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npx prisma db seed

# Reset database
docker-compose exec app npx prisma migrate reset --force
```

## Production Optimization

### 1. Image Optimization
```dockerfile
# Optimized production build
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

# Build with standalone output
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Security Hardening
```dockerfile
# Security-hardened Dockerfile
FROM node:18-alpine AS base

# Security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set security headers
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV NODE_ENV=production

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Run as non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

## Monitoring and Logging

### 1. Container Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  app:
    # ... existing app configuration
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`localhost`)"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - diagramai-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - diagramai-network

volumes:
  grafana_data:
```

### 2. Application Logging
```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'diagramai' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

## Deployment Automation

### 1. Container Build Pipeline
```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        push: ${{ github.event_name != 'pull_request' }}
        tags: ghcr.io/${{ github.repository }}:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

### 2. Deployment Scripts
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "Building Docker image..."
docker build -t diagramai:latest .

echo "Tagging image..."
docker tag diagramai:latest your-registry/diagramai:latest

echo "Pushing to registry..."
docker push your-registry/diagramai:latest

echo "Deploying to production..."
kubectl set image deployment/diagramai-app diagramai=your-registry/diagramai:latest

echo "Waiting for rollout..."
kubectl rollout status deployment/diagramai-app

echo "Deployment complete!"
```

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review devops_lld_03.md for infrastructure as code and monitoring
2. Implement container security scanning and vulnerability management
3. Set up automated deployment pipelines with container orchestration

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/deployment/container-guide.md`
- **Operations Documentation**: `/docs/documentation/deployment/environment-management.md`
- **Security Documentation**: `/docs/documentation/deployment/container-security.md`

**Integration Points:**
- **CI/CD Pipeline**: Automated container builds and deployments
- **Infrastructure**: Container orchestration and scaling
- **Monitoring**: Container health and performance monitoring
- **Security**: Container scanning and runtime security

This comprehensive container orchestration design ensures consistent, scalable, and secure deployment strategies for DiagramAI across all environments while maintaining development productivity and operational excellence.
