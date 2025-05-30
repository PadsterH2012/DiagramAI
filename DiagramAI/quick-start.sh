#!/bin/bash

# DiagramAI Quick Start Script
# This script sets up DiagramAI with all dependencies using Docker

set -e

echo "🚀 DiagramAI Quick Start Setup"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if ports are available
echo "🔍 Checking port availability..."
for port in 3000 5432 6379 8080; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use. Please stop the service using this port."
        echo "   You can check what's using the port with: lsof -i :$port"
        exit 1
    fi
done
echo "✅ All required ports are available"

# Create directory for DiagramAI
INSTALL_DIR="diagramai-production"
if [ -d "$INSTALL_DIR" ]; then
    echo "📁 Directory $INSTALL_DIR already exists"
    read -p "Do you want to continue and potentially overwrite files? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Installation cancelled"
        exit 1
    fi
else
    mkdir -p "$INSTALL_DIR"
    echo "📁 Created directory: $INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# Download production docker-compose file
echo "📥 Downloading production configuration..."
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/docker-compose.prod.yml -o docker-compose.prod.yml

# Download environment template
echo "📥 Downloading environment template..."
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/.env.production.example -o .env.production.example

# Download Redis configuration
echo "📥 Downloading Redis configuration..."
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/redis.conf -o redis.conf

# Download Nginx configuration (optional)
echo "📥 Downloading Nginx configuration..."
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/nginx.conf -o nginx.conf

# Create scripts directory and init-db.sql
mkdir -p scripts
cat > scripts/init-db.sql << 'EOF'
-- DiagramAI Database Initialization
-- This script sets up the initial database structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create application user (if needed)
-- CREATE USER diagramai WITH PASSWORD 'DiagramAI2024!';
-- GRANT ALL PRIVILEGES ON DATABASE diagramai TO diagramai;

-- Set timezone
SET timezone = 'UTC';

-- Create initial schema will be handled by Prisma migrations
EOF

echo "✅ Configuration files downloaded"

# Ask user about environment configuration
echo ""
echo "🔧 Environment Configuration"
echo "=============================="
read -p "Do you want to configure environment variables now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cp .env.production.example .env.production
    echo "📝 Created .env.production file"
    echo "   Please edit this file with your configuration:"
    echo "   - API keys for AI services (OpenAI, Anthropic, etc.)"
    echo "   - Authentication secrets"
    echo "   - Domain configuration"
    echo ""
    read -p "Press Enter to continue after editing .env.production..."
fi

# Pull Docker images
echo "🐳 Pulling Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Start services
echo "🚀 Starting DiagramAI services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo "✅ DiagramAI is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  DiagramAI may still be starting. Check logs with:"
        echo "   docker-compose -f docker-compose.prod.yml logs -f"
        break
    fi
    sleep 2
done

# Display success message
echo ""
echo "🎉 DiagramAI Setup Complete!"
echo "============================"
echo ""
echo "🌐 Access your applications:"
echo "   • DiagramAI:      http://localhost:3000"
echo "   • Database Admin: http://localhost:8080"
echo "   • Health Check:   http://localhost:3000/api/health"
echo ""
echo "📋 Useful commands:"
echo "   • View logs:      docker-compose -f docker-compose.prod.yml logs -f"
echo "   • Stop services:  docker-compose -f docker-compose.prod.yml down"
echo "   • Restart:        docker-compose -f docker-compose.prod.yml restart"
echo "   • Update:         docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "📚 Documentation: https://github.com/PadsterH2012/DiagramAI"
echo ""
echo "🆘 Need help? Check the logs or visit:"
echo "   https://github.com/PadsterH2012/DiagramAI/issues"
echo ""

# Optional: Open browser
if command -v xdg-open &> /dev/null; then
    read -p "Open DiagramAI in your browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open http://localhost:3000
    fi
elif command -v open &> /dev/null; then
    read -p "Open DiagramAI in your browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:3000
    fi
fi

echo "Happy diagramming! 🎨"
