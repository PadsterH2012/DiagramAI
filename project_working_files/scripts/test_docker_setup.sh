#!/bin/bash

# DiagramAI - Docker Setup Testing Script
# Purpose: Test Docker container health checks and startup validation

set -e

echo "🐳 DiagramAI Docker Setup Testing"
echo "================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TEST_PASSED=true

# Function to test service health
test_service_health() {
    local service_name=$1
    local health_check=$2
    local max_attempts=30
    local attempt=1

    echo -e "🔍 Testing ${BLUE}$service_name${NC} health..."
    
    while [ $attempt -le $max_attempts ]; do
        if eval "$health_check" &> /dev/null; then
            echo -e "✅ ${GREEN}$service_name is healthy${NC}"
            return 0
        fi
        
        echo -e "⏳ Attempt $attempt/$max_attempts - waiting for $service_name..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "❌ ${RED}$service_name health check failed${NC}"
    TEST_PASSED=false
    return 1
}

# Function to check if Docker Compose is running
check_compose_status() {
    if docker compose ps | grep -q "Up"; then
        echo -e "✅ ${GREEN}Docker Compose services are running${NC}"
        return 0
    else
        echo -e "❌ ${RED}Docker Compose services are not running${NC}"
        TEST_PASSED=false
        return 1
    fi
}

# Navigate to project directory
cd DiagramAI

echo ""
echo "📋 Checking Docker Compose Configuration..."
if [ ! -f "docker-compose.yml" ]; then
    echo -e "❌ ${RED}docker-compose.yml not found${NC}"
    TEST_PASSED=false
    exit 1
fi

echo ""
echo "🚀 Starting Docker Compose services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 10

echo ""
echo "📊 Checking service status..."
check_compose_status

echo ""
echo "🔍 Testing individual service health..."

# Test PostgreSQL
test_service_health "PostgreSQL" "docker compose exec -T db pg_isready -U postgres"

# Test Redis
test_service_health "Redis" "docker compose exec -T redis redis-cli ping"

# Test Application (if running)
echo -e "🔍 Testing ${BLUE}Application${NC} health..."
if curl -f http://localhost:3000/api/health &> /dev/null; then
    echo -e "✅ ${GREEN}Application is responding${NC}"
elif curl -f http://localhost:3000 &> /dev/null; then
    echo -e "⚠️  ${YELLOW}Application is running but health endpoint not available${NC}"
else
    echo -e "ℹ️  Application may still be starting up"
fi

echo ""
echo "🔍 Testing container logs..."
echo -e "📝 ${BLUE}Recent application logs:${NC}"
docker compose logs --tail=5 app

echo ""
echo "🔍 Testing network connectivity..."
if docker compose exec -T app ping -c 1 db &> /dev/null; then
    echo -e "✅ ${GREEN}App can reach database${NC}"
else
    echo -e "❌ ${RED}App cannot reach database${NC}"
    TEST_PASSED=false
fi

if docker compose exec -T app ping -c 1 redis &> /dev/null; then
    echo -e "✅ ${GREEN}App can reach Redis${NC}"
else
    echo -e "❌ ${RED}App cannot reach Redis${NC}"
    TEST_PASSED=false
fi

echo ""
echo "📊 Service Status Summary:"
docker compose ps

echo ""
echo "================================="
if [ "$TEST_PASSED" = true ]; then
    echo -e "🎉 ${GREEN}Docker setup tests PASSED${NC}"
    echo "✅ All services are healthy and communicating"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Application: http://localhost:3000"
    echo "   Database Admin: http://localhost:8080"
    echo ""
    echo "🛑 To stop services: docker compose down"
    exit 0
else
    echo -e "❌ ${RED}Docker setup tests FAILED${NC}"
    echo "⚠️  Please check the issues above"
    echo ""
    echo "🔍 For debugging:"
    echo "   View logs: docker compose logs"
    echo "   Check status: docker compose ps"
    echo "   Restart: docker compose restart"
    exit 1
fi
