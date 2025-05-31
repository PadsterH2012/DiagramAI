#!/bin/bash

# DiagramAI Production Startup Script
# This script ensures database migrations run before starting the production server

set -e

echo "🚀 DiagramAI Production Server Starting"
echo "======================================="

# Wait for database to be ready (if using external database)
if [ -n "$DATABASE_URL" ]; then
    echo "⏳ Waiting for database to be ready..."
    
    # Parse DATABASE_URL to get connection details
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    # Default values if parsing fails
    DB_HOST=${DB_HOST:-"localhost"}
    DB_PORT=${DB_PORT:-"5432"}
    
    # Wait for database connection
    for i in {1..30}; do
        if timeout 5 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
            echo "✅ Database is ready at $DB_HOST:$DB_PORT"
            break
        fi
        echo "   Attempt $i/30: Waiting for database..."
        sleep 2
    done
fi

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "🌟 Starting DiagramAI production server..."
exec node server.js