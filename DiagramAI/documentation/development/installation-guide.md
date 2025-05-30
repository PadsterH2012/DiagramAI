# 🚀 DiagramAI Installation Guide

*Last Updated: May 30, 2025*

## Overview

This comprehensive guide walks you through installing DiagramAI in various environments, from local development to production deployment.

## 📋 Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Linux, macOS, Windows 10+ | Linux/macOS |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 2GB free space | 5GB+ |
| **CPU** | 2 cores | 4+ cores |

### Required Software

- **Docker** 20.10+ and Docker Compose 2.0+
- **Node.js** 18+ (for local development)
- **Git** 2.30+
- **PostgreSQL** 14+ (if not using Docker)

## 🐳 Docker Installation (Recommended)

### 1. Clone Repository

```bash
git clone https://github.com/PadsterH2012/DiagramAI.git
cd DiagramAI/DiagramAI
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

**Required Environment Variables:**
```env
NODE_ENV=development
DATABASE_URL="postgresql://diagramai:password@postgres:5432/diagramai"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: AI API Keys
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
OPENROUTER_API_KEY="your-openrouter-key"
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 4. Database Setup

```bash
# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# (Optional) Seed test data
docker-compose exec app npx prisma db seed
```

### 5. Verify Installation

- **Application**: http://localhost:3000
- **Database Studio**: `docker-compose exec app npx prisma studio`
- **Health Check**: http://localhost:3000/api/health

## 💻 Local Development Installation

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install global tools
npm install -g prisma
```

### 2. Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL 14+
# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib

# macOS:
brew install postgresql

# Create database
createdb diagramai
```

**Option B: Docker PostgreSQL Only**
```bash
# Start only PostgreSQL
docker-compose up -d postgres
```

### 3. Environment Configuration

```bash
# Copy and edit environment
cp .env.example .env.local

# Update DATABASE_URL for local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/diagramai"
```

### 4. Database Migration

```bash
# Run migrations
npx prisma migrate dev

# Generate client
npx prisma generate
```

### 5. Start Development Server

```bash
# Start Next.js development server
npm run dev

# Application available at http://localhost:3000
```

## 🚀 Production Installation

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/PadsterH2012/DiagramAI.git
cd DiagramAI/DiagramAI

# Create production environment
cp .env.example .env.production
```

**Production Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL="postgresql://diagramai:secure-password@postgres:5432/diagramai"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="secure-random-secret-key"

# SSL Configuration
POSTGRES_SSL=true
FORCE_SSL=true

# AI API Keys
OPENAI_API_KEY="your-production-openai-key"
ANTHROPIC_API_KEY="your-production-anthropic-key"
```

### 3. SSL/TLS Setup

```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot

# Generate SSL certificates
sudo certbot certonly --standalone -d your-domain.com
```

### 4. Production Deployment

```bash
# Build and start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run production migrations
docker-compose exec app npx prisma migrate deploy
```

## 🔧 Configuration Options

### Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | Yes |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `NEXTAUTH_URL` | Application base URL | http://localhost:3000 | Yes |
| `NEXTAUTH_SECRET` | Authentication secret | - | Yes |
| `OPENAI_API_KEY` | OpenAI API key | - | No |
| `ANTHROPIC_API_KEY` | Anthropic API key | - | No |
| `OPENROUTER_API_KEY` | OpenRouter API key | - | No |
| `WEBSOCKET_PORT` | WebSocket server port | 3001 | No |
| `LOG_LEVEL` | Logging level | info | No |

### Docker Compose Profiles

```bash
# Development with hot reload
docker-compose --profile development up

# Production optimized
docker-compose --profile production up

# With monitoring stack
docker-compose --profile monitoring up
```

## 🧪 Testing Installation

### Automated Health Check

```bash
# Run health check script
./scripts/health-check.sh

# Expected output:
# ✅ Application responding
# ✅ Database connected
# ✅ WebSocket server running
# ✅ All services healthy
```

### Manual Verification

1. **Application Access**: Visit http://localhost:3000
2. **Database Connection**: Check logs for successful connection
3. **WebSocket**: Test real-time features
4. **AI Integration**: Test diagram generation (if API keys configured)

## 🔍 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

**Database Connection Failed**
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

**Permission Denied**
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### Log Analysis

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# View all logs
docker-compose logs -f
```

## 📚 Next Steps

After successful installation:

1. **Configure AI APIs**: [Settings Management Guide](../features/settings-management.md)
2. **Set up MCP Integration**: [MCP Setup Guide](../mcp/agent-setup-guide.md)
3. **Development Setup**: [Development Guide](./quick-start.md)
4. **Testing**: [Testing Framework](./testing-framework.md)

## 🆘 Support

- **Documentation**: [Troubleshooting Guide](./troubleshooting.md)
- **Issues**: [GitHub Issues](https://github.com/PadsterH2012/DiagramAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PadsterH2012/DiagramAI/discussions)

---

*For the most current installation instructions, always refer to the main branch documentation.*
