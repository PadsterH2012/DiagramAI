#!/bin/bash

# DiagramAI Version Setting Script
# This script sets version environment variables for local development

# Get current git commit hash
GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
GIT_COMMIT_SHORT=$(echo $GIT_COMMIT | cut -c1-8)

# Get current date
BUILD_DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Set default version or use provided version
APP_VERSION=${1:-"1.0.45-dev"}

# Export environment variables
export APP_VERSION="$APP_VERSION"
export BUILD_DATE="$BUILD_DATE"
export GIT_COMMIT="$GIT_COMMIT_SHORT"

echo "🔧 DiagramAI Version Environment Variables Set:"
echo "   APP_VERSION: $APP_VERSION"
echo "   BUILD_DATE: $BUILD_DATE"
echo "   GIT_COMMIT: $GIT_COMMIT_SHORT"
echo ""
echo "💡 Usage:"
echo "   source scripts/set-version.sh [version]"
echo "   Example: source scripts/set-version.sh 1.0.46-dev"
echo ""
echo "🐳 For Docker Compose:"
echo "   docker compose up --build"
echo ""
echo "✅ Environment variables are now set for this shell session"
