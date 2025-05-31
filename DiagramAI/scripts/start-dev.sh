#!/bin/bash

# DiagramAI Development Startup Script
# This script initializes the database and starts the development server

set -e

echo "🚀 DiagramAI Development Server Starting"
echo "========================================"

# Change to app directory
cd /app

# Run simple database verification
echo "🔧 Verifying database..."
./scripts/verify-database.sh

# Start the development server
echo ""
echo "🌟 Starting DiagramAI development server..."
exec npm run dev