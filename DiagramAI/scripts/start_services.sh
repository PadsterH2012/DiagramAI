#!/bin/bash

# DiagramAI - Application Startup Script
# Purpose: Start all required services for the application

set -e

echo "🚀 Starting DiagramAI Services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "📋 Copying .env.example to .env.local..."
        cp .env.example .env.local
        echo "⚠️  Please update .env.local with your actual configuration values."
    else
        echo "❌ No .env.example file found. Please create environment configuration."
        exit 1
    fi
fi

# Start services
echo "🐳 Starting Docker services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Redis
if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

# Check application
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is ready"
else
    echo "⚠️  Application is starting up..."
fi

echo ""
echo "🎉 DiagramAI services started successfully!"
echo ""
echo "📊 Service URLs:"
echo "   Application: http://localhost:3000"
echo "   Database Admin: http://localhost:8080"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "📝 To view logs: docker compose logs -f"
echo "🛑 To stop services: docker compose down"
