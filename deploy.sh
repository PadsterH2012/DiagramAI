#!/bin/bash

# DiagramAI Production Deployment Script

echo "🚀 Starting DiagramAI Production Deployment"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

# Validate required environment variables
source .env

if [ -z "$CLAUDE_API_KEY" ] || [ "$CLAUDE_API_KEY" = "your-claude-api-key-here" ]; then
    echo "⚠️  Warning: CLAUDE_API_KEY not set in .env file"
fi

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your-gemini-api-key-here" ]; then
    echo "⚠️  Warning: GEMINI_API_KEY not set in .env file"
fi

# Build and start services in production mode
echo "🏗️  Building and starting production services..."
docker compose up --build -d

echo "✅ DiagramAI production environment is running!"
echo "🌐 Application: http://localhost"
echo "📊 Health check: http://localhost/health"
echo ""
echo "📝 To view logs: docker compose logs -f"
echo "🛑 To stop: docker compose down"