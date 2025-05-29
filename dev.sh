#!/bin/bash

# DiagramAI Development Setup Script

echo "🚀 Starting DiagramAI Development Environment"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example"
    cp .env.example .env
    echo "⚠️  Please update .env file with your API keys before running"
fi

# Build and start services in development mode
echo "🏗️  Building and starting services..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

echo "✅ DiagramAI development environment is ready!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️  Database: localhost:5432"
echo "🔄 Redis: localhost:6379"