#!/bin/bash

# DiagramAI Database Initialization Script
# This script ensures the database is properly set up before starting the application

set -e

echo "🔧 DiagramAI Database Initialization"
echo "==================================="

# Function to wait for database to be ready
wait_for_database() {
    echo "⏳ Waiting for database to be ready..."
    
    # Extract database connection details from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    # Use default values if extraction fails
    DB_HOST=${DB_HOST:-"db"}
    DB_PORT=${DB_PORT:-"5432"}
    DB_USER=${DB_USER:-"postgres"}
    DB_NAME=${DB_NAME:-"diagramai_dev"}
    
    echo "📍 Database connection details:"
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT"
    echo "   User: $DB_USER"
    echo "   Database: $DB_NAME"
    
    # Wait for PostgreSQL to be ready
    for i in {1..30}; do
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
            echo "✅ Database is ready!"
            return 0
        fi
        echo "   Attempt $i/30: Database not ready, waiting..."
        sleep 2
    done
    
    echo "❌ Database failed to become ready within 60 seconds"
    exit 1
}

# Function to check if migrations are needed
check_migration_status() {
    echo "🔍 Checking migration status..."
    
    # Check if the _prisma_migrations table exists
    if npx prisma db pull --preview-feature > /dev/null 2>&1; then
        echo "✅ Database schema detected"
        
        # Check migration status
        if npx prisma migrate status > /dev/null 2>&1; then
            echo "✅ Migration status check successful"
            return 0
        else
            echo "⚠️  Migration status check failed, will attempt to migrate"
            return 1
        fi
    else
        echo "⚠️  Database schema not detected, will create from scratch"
        return 1
    fi
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    # Generate Prisma client first
    echo "   📦 Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    echo "   🚀 Deploying migrations..."
    npx prisma migrate deploy
    
    echo "✅ Database migrations completed successfully"
}

# Function to verify database tables
verify_database() {
    echo "🔍 Verifying database setup..."
    
    # Check if critical tables exist using Prisma
    node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function checkTables() {
            try {
                // Try to query the users table
                await prisma.user.findMany({ take: 1 });
                console.log('   ✅ Users table exists and accessible');
                
                // Try to query the diagrams table
                await prisma.diagram.findMany({ take: 1 });
                console.log('   ✅ Diagrams table exists and accessible');
                
                console.log('✅ Database verification successful');
                process.exit(0);
            } catch (error) {
                console.error('❌ Database verification failed:', error.message);
                process.exit(1);
            } finally {
                await prisma.\$disconnect();
            }
        }
        
        checkTables();
    "
}

# Function to create default user if needed
create_default_user() {
    echo "👤 Ensuring default user exists..."
    
    node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function ensureDefaultUser() {
            try {
                // Check if default user exists
                let defaultUser = await prisma.user.findFirst({
                    where: { email: 'default@diagramai.dev' }
                });
                
                if (!defaultUser) {
                    console.log('   📝 Creating default user...');
                    defaultUser = await prisma.user.create({
                        data: {
                            email: 'default@diagramai.dev',
                            username: 'default_user',
                            passwordHash: 'dev_only_hash',
                            displayName: 'Default User',
                            emailVerified: true,
                        }
                    });
                    console.log('   ✅ Default user created successfully');
                } else {
                    console.log('   ✅ Default user already exists');
                }
                
                process.exit(0);
            } catch (error) {
                console.error('❌ Failed to create default user:', error.message);
                process.exit(1);
            } finally {
                await prisma.\$disconnect();
            }
        }
        
        ensureDefaultUser();
    "
}

# Main execution
main() {
    echo "🚀 Starting database initialization process..."
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    echo "📍 Using database: $DATABASE_URL"
    
    # Wait for database to be ready
    wait_for_database
    
    # Check if migrations are needed and run them
    if ! check_migration_status; then
        run_migrations
    else
        echo "✅ Database migrations are up to date"
    fi
    
    # Verify database setup
    verify_database
    
    # Create default user
    create_default_user
    
    echo ""
    echo "🎉 Database initialization completed successfully!"
    echo "   The DiagramAI database is ready for use."
    echo ""
}

# Run main function
main