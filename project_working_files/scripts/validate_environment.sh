#!/bin/bash

# DiagramAI - Environment Validation Script
# Purpose: Validate Docker environment and dependencies

set -e

echo "🔍 DiagramAI Environment Validation"
echo "=================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation results
VALIDATION_PASSED=true

# Function to check command availability
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "✅ ${GREEN}$1 is installed${NC}"
        return 0
    else
        echo -e "❌ ${RED}$1 is not installed${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to check Docker Compose (v2 plugin or standalone)
check_docker_compose() {
    if docker compose version &> /dev/null; then
        echo -e "✅ ${GREEN}docker compose (v2 plugin) is available${NC}"
        return 0
    elif command -v docker-compose &> /dev/null; then
        echo -e "✅ ${GREEN}docker-compose (standalone) is installed${NC}"
        return 0
    else
        echo -e "❌ ${RED}docker compose/docker-compose is not available${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to check Docker service
check_docker_service() {
    if docker info &> /dev/null; then
        echo -e "✅ ${GREEN}Docker service is running${NC}"
        return 0
    else
        echo -e "❌ ${RED}Docker service is not running${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "✅ ${GREEN}$1 exists${NC}"
        return 0
    else
        echo -e "❌ ${RED}$1 is missing${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to check directory existence
check_directory() {
    if [ -d "$1" ]; then
        echo -e "✅ ${GREEN}$1 directory exists${NC}"
        return 0
    else
        echo -e "❌ ${RED}$1 directory is missing${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

echo ""
echo "📋 Checking Required Commands..."
check_command "docker"
check_docker_compose
check_command "node"
check_command "npm"
check_command "git"

echo ""
echo "🐳 Checking Docker Service..."
check_docker_service

echo ""
echo "📁 Checking Project Structure..."
check_directory "DiagramAI"
check_file "DiagramAI/package.json"
check_file "DiagramAI/docker-compose.yml"
check_file "DiagramAI/Dockerfile"
check_file "DiagramAI/Dockerfile.dev"
check_directory "DiagramAI/src"
check_directory "DiagramAI/scripts"

echo ""
echo "⚙️  Checking Configuration Files..."
check_file "DiagramAI/.env.example"
check_file "DiagramAI/next.config.js"
check_file "DiagramAI/tsconfig.json"

echo ""
echo "🔧 Checking Node.js Version..."
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE_VERSION" ]; then
    echo -e "✅ ${GREEN}Node.js version $NODE_VERSION meets requirement (>= $REQUIRED_NODE_VERSION)${NC}"
else
    echo -e "❌ ${RED}Node.js version $NODE_VERSION does not meet requirement (>= $REQUIRED_NODE_VERSION)${NC}"
    VALIDATION_PASSED=false
fi

echo ""
echo "🐳 Checking Docker Version..."
DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
echo -e "ℹ️  Docker version: $DOCKER_VERSION"

echo ""
echo "=================================="
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "🎉 ${GREEN}Environment validation PASSED${NC}"
    echo "✅ All requirements are met for DiagramAI development"
    exit 0
else
    echo -e "❌ ${RED}Environment validation FAILED${NC}"
    echo "⚠️  Please fix the issues above before proceeding"
    exit 1
fi
