#!/bin/bash

# Simple database verification for Docker startup
# This script checks if the database is ready and runs migrations if needed

echo "🔍 Verifying database setup..."

# Wait for database to be ready
for i in {1..30}; do
    if pg_isready -h db -p 5432 -U postgres -d diagramai_dev > /dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    fi
    echo "⏳ Waiting for database... ($i/30)"
    sleep 2
done

# Check if we can connect with Prisma
echo "🔧 Checking Prisma connection..."

# Generate Prisma client if needed
if [ ! -d "node_modules/.prisma" ]; then
    echo "📦 Generating Prisma client..."
    npx prisma generate || exit 1
fi

# Run migrations
echo "🚀 Running database migrations..."
npx prisma migrate deploy || {
    echo "❌ Migration failed, attempting reset..."
    npx prisma migrate reset --force || exit 1
    npx prisma migrate deploy || exit 1
}

echo "✅ Database verification complete"