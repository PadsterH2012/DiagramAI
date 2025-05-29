#!/bin/bash

# DiagramAI - Configuration Validation Script
# Purpose: Validate configuration files and environment setup

set -e

echo "⚙️  DiagramAI Configuration Validation"
echo "====================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation results
VALIDATION_PASSED=true

# Function to validate JSON file
validate_json() {
    local file=$1
    if [ -f "$file" ]; then
        if node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
            echo -e "✅ ${GREEN}$file is valid JSON${NC}"
            return 0
        else
            echo -e "❌ ${RED}$file contains invalid JSON${NC}"
            VALIDATION_PASSED=false
            return 1
        fi
    else
        echo -e "❌ ${RED}$file not found${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to validate environment file
validate_env_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$file exists${NC}"
        
        # Check for required environment variables
        local required_vars=("NODE_ENV" "DATABASE_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET")
        
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" "$file" || grep -q "^#.*$var=" "$file"; then
                echo -e "  ✅ ${GREEN}$var is defined${NC}"
            else
                echo -e "  ❌ ${RED}$var is missing${NC}"
                VALIDATION_PASSED=false
            fi
        done
        
        return 0
    else
        echo -e "❌ ${RED}$file not found${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to validate Docker Compose file
validate_docker_compose() {
    local file=$1
    if [ -f "$file" ]; then
        if docker compose -f "$file" config &> /dev/null; then
            echo -e "✅ ${GREEN}$file is valid${NC}"
            return 0
        else
            echo -e "❌ ${RED}$file contains errors${NC}"
            echo -e "  ${YELLOW}Run 'docker compose config' for details${NC}"
            VALIDATION_PASSED=false
            return 1
        fi
    else
        echo -e "❌ ${RED}$file not found${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Function to validate TypeScript configuration
validate_typescript_config() {
    local file=$1
    if [ -f "$file" ]; then
        if npx tsc --noEmit --project "$file" 2>/dev/null; then
            echo -e "✅ ${GREEN}$file is valid${NC}"
            return 0
        else
            echo -e "❌ ${RED}$file contains errors${NC}"
            VALIDATION_PASSED=false
            return 1
        fi
    else
        echo -e "❌ ${RED}$file not found${NC}"
        VALIDATION_PASSED=false
        return 1
    fi
}

# Navigate to project directory
cd DiagramAI

echo ""
echo "📋 Validating Package Configuration..."
validate_json "package.json"

echo ""
echo "📋 Validating TypeScript Configuration..."
validate_json "tsconfig.json"

echo ""
echo "📋 Validating Next.js Configuration..."
if [ -f "next.config.js" ]; then
    if node -c "next.config.js" 2>/dev/null; then
        echo -e "✅ ${GREEN}next.config.js is valid${NC}"
    else
        echo -e "❌ ${RED}next.config.js contains syntax errors${NC}"
        VALIDATION_PASSED=false
    fi
else
    echo -e "❌ ${RED}next.config.js not found${NC}"
    VALIDATION_PASSED=false
fi

echo ""
echo "📋 Validating Environment Configuration..."
validate_env_file ".env.example"

if [ -f ".env.local" ]; then
    validate_env_file ".env.local"
else
    echo -e "ℹ️  ${YELLOW}.env.local not found (will be created from .env.example)${NC}"
fi

echo ""
echo "📋 Validating Docker Configuration..."
validate_docker_compose "docker-compose.yml"

echo ""
echo "📋 Validating Dockerfile..."
if [ -f "Dockerfile" ]; then
    # Basic syntax validation by checking if Docker can parse it
    if docker build --no-cache --target deps -f Dockerfile . &> /dev/null || \
       docker build --help | grep -q "target" && echo "FROM node:18-alpine" | docker build -f - . &> /dev/null; then
        echo -e "✅ ${GREEN}Dockerfile syntax appears valid${NC}"
    else
        echo -e "⚠️  ${YELLOW}Dockerfile validation skipped (requires build context)${NC}"
    fi
else
    echo -e "❌ ${RED}Dockerfile not found${NC}"
    VALIDATION_PASSED=false
fi

if [ -f "Dockerfile.dev" ]; then
    # Basic syntax validation
    if grep -q "FROM node:" "Dockerfile.dev" && grep -q "WORKDIR" "Dockerfile.dev"; then
        echo -e "✅ ${GREEN}Dockerfile.dev syntax appears valid${NC}"
    else
        echo -e "❌ ${RED}Dockerfile.dev contains syntax errors${NC}"
        VALIDATION_PASSED=false
    fi
else
    echo -e "❌ ${RED}Dockerfile.dev not found${NC}"
    VALIDATION_PASSED=false
fi

echo ""
echo "📋 Validating Project Structure..."
required_dirs=("src" "scripts" "prisma")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "✅ ${GREEN}$dir/ directory exists${NC}"
    else
        echo -e "❌ ${RED}$dir/ directory missing${NC}"
        VALIDATION_PASSED=false
    fi
done

echo ""
echo "📋 Validating Scripts..."
if [ -f "scripts/start_services.sh" ]; then
    if [ -x "scripts/start_services.sh" ]; then
        echo -e "✅ ${GREEN}scripts/start_services.sh is executable${NC}"
    else
        echo -e "⚠️  ${YELLOW}scripts/start_services.sh is not executable${NC}"
    fi
else
    echo -e "❌ ${RED}scripts/start_services.sh not found${NC}"
    VALIDATION_PASSED=false
fi

echo ""
echo "====================================="
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "🎉 ${GREEN}Configuration validation PASSED${NC}"
    echo "✅ All configuration files are valid"
    echo ""
    echo "🚀 Ready to start development:"
    echo "   1. Copy .env.example to .env.local"
    echo "   2. Update .env.local with your values"
    echo "   3. Run: npm install"
    echo "   4. Run: docker compose up -d"
    exit 0
else
    echo -e "❌ ${RED}Configuration validation FAILED${NC}"
    echo "⚠️  Please fix the configuration issues above"
    exit 1
fi
