#!/bin/bash

# Jenkins Setup Validation Script for DiagramAI
# This script validates that all prerequisites are met for the Jenkins CI/CD pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REQUIRED_NODE_VERSION="18"
REQUIRED_DOCKER_VERSION="20"
REQUIRED_MEMORY_GB="4"

echo -e "${BLUE}🔍 DiagramAI Jenkins Setup Validation${NC}"
echo "=================================================="

# Function to check command existence
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "✅ ${GREEN}$1 is installed${NC}"
        return 0
    else
        echo -e "❌ ${RED}$1 is not installed${NC}"
        return 1
    fi
}

# Function to check version
check_version() {
    local cmd="$1"
    local version="$2"
    local required="$3"
    
    if [[ "$version" =~ ^v?([0-9]+) ]]; then
        local major_version="${BASH_REMATCH[1]}"
        if [ "$major_version" -ge "$required" ]; then
            echo -e "✅ ${GREEN}$cmd version $version (>= $required required)${NC}"
            return 0
        else
            echo -e "❌ ${RED}$cmd version $version (>= $required required)${NC}"
            return 1
        fi
    else
        echo -e "⚠️ ${YELLOW}Could not parse $cmd version: $version${NC}"
        return 1
    fi
}

# Function to check memory
check_memory() {
    local available_gb
    if command -v free &> /dev/null; then
        available_gb=$(free -g | awk '/^Mem:/{print $2}')
    elif command -v vm_stat &> /dev/null; then
        # macOS
        local pages=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        available_gb=$((pages * 4096 / 1024 / 1024 / 1024))
    else
        echo -e "⚠️ ${YELLOW}Cannot determine available memory${NC}"
        return 1
    fi
    
    if [ "$available_gb" -ge "$REQUIRED_MEMORY_GB" ]; then
        echo -e "✅ ${GREEN}Available memory: ${available_gb}GB (>= ${REQUIRED_MEMORY_GB}GB required)${NC}"
        return 0
    else
        echo -e "❌ ${RED}Available memory: ${available_gb}GB (>= ${REQUIRED_MEMORY_GB}GB required)${NC}"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local available_gb
    available_gb=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$available_gb" -ge 50 ]; then
        echo -e "✅ ${GREEN}Available disk space: ${available_gb}GB (>= 50GB required)${NC}"
        return 0
    else
        echo -e "❌ ${RED}Available disk space: ${available_gb}GB (>= 50GB required)${NC}"
        return 1
    fi
}

# Function to check Docker permissions
check_docker_permissions() {
    if docker ps &> /dev/null; then
        echo -e "✅ ${GREEN}Docker permissions are correct${NC}"
        return 0
    else
        echo -e "❌ ${RED}Docker permissions issue - user cannot run docker commands${NC}"
        echo -e "   ${YELLOW}Fix with: sudo usermod -aG docker \$USER${NC}"
        return 1
    fi
}

# Function to test Docker containers
test_docker_containers() {
    echo -e "${BLUE}🐳 Testing Docker container setup...${NC}"
    
    # Test PostgreSQL
    echo "Testing PostgreSQL container..."
    if docker run --rm -d --name test-postgres -e POSTGRES_PASSWORD=test postgres:15-alpine &> /dev/null; then
        sleep 5
        if docker exec test-postgres pg_isready -U postgres &> /dev/null; then
            echo -e "✅ ${GREEN}PostgreSQL container works${NC}"
            docker stop test-postgres &> /dev/null
        else
            echo -e "❌ ${RED}PostgreSQL container failed to start properly${NC}"
            docker stop test-postgres &> /dev/null
            return 1
        fi
    else
        echo -e "❌ ${RED}Failed to start PostgreSQL container${NC}"
        return 1
    fi
    
    # Test Redis
    echo "Testing Redis container..."
    if docker run --rm -d --name test-redis redis:7-alpine &> /dev/null; then
        sleep 3
        if docker exec test-redis redis-cli ping | grep -q PONG; then
            echo -e "✅ ${GREEN}Redis container works${NC}"
            docker stop test-redis &> /dev/null
        else
            echo -e "❌ ${RED}Redis container failed to start properly${NC}"
            docker stop test-redis &> /dev/null
            return 1
        fi
    else
        echo -e "❌ ${RED}Failed to start Redis container${NC}"
        return 1
    fi
}

# Function to validate project structure
validate_project_structure() {
    echo -e "${BLUE}📁 Validating project structure...${NC}"
    
    local required_files=(
        "package.json"
        "Jenkinsfile"
        "jest.config.js"
        "playwright.config.ts"
        "next.config.js"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "✅ ${GREEN}Found: $file${NC}"
        else
            echo -e "❌ ${RED}Missing: $file${NC}"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo -e "✅ ${GREEN}All required files present${NC}"
        return 0
    else
        echo -e "❌ ${RED}Missing required files: ${missing_files[*]}${NC}"
        return 1
    fi
}

# Function to validate package.json scripts
validate_npm_scripts() {
    echo -e "${BLUE}📦 Validating npm scripts...${NC}"
    
    if [ ! -f "package.json" ]; then
        echo -e "❌ ${RED}package.json not found${NC}"
        return 1
    fi
    
    local required_scripts=(
        "build"
        "test"
        "test:unit"
        "test:integration"
        "test:e2e"
    )
    
    local missing_scripts=()
    
    for script in "${required_scripts[@]}"; do
        if jq -e ".scripts.\"$script\"" package.json &> /dev/null; then
            echo -e "✅ ${GREEN}Script found: $script${NC}"
        else
            echo -e "❌ ${RED}Script missing: $script${NC}"
            missing_scripts+=("$script")
        fi
    done
    
    if [ ${#missing_scripts[@]} -eq 0 ]; then
        echo -e "✅ ${GREEN}All required npm scripts present${NC}"
        return 0
    else
        echo -e "❌ ${RED}Missing npm scripts: ${missing_scripts[*]}${NC}"
        return 1
    fi
}

# Function to test npm commands
test_npm_commands() {
    echo -e "${BLUE}🧪 Testing npm commands...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies first...${NC}"
        npm ci
    fi
    
    # Test build
    echo "Testing build command..."
    if npm run build &> /dev/null; then
        echo -e "✅ ${GREEN}Build command works${NC}"
    else
        echo -e "❌ ${RED}Build command failed${NC}"
        return 1
    fi
    
    # Test unit tests (dry run)
    echo "Testing unit test command..."
    if npm run test:unit -- --passWithNoTests --silent &> /dev/null; then
        echo -e "✅ ${GREEN}Unit test command works${NC}"
    else
        echo -e "❌ ${RED}Unit test command failed${NC}"
        return 1
    fi
    
    # Test integration tests (dry run)
    echo "Testing integration test command..."
    if npm run test:integration -- --passWithNoTests --silent &> /dev/null; then
        echo -e "✅ ${GREEN}Integration test command works${NC}"
    else
        echo -e "❌ ${RED}Integration test command failed${NC}"
        return 1
    fi
}

# Main validation function
main() {
    local validation_passed=true
    
    echo -e "${BLUE}🔧 System Requirements Check${NC}"
    echo "----------------------------------------"
    
    # Check basic commands
    check_command "node" || validation_passed=false
    check_command "npm" || validation_passed=false
    check_command "docker" || validation_passed=false
    check_command "git" || validation_passed=false
    check_command "jq" || validation_passed=false
    
    echo ""
    echo -e "${BLUE}📊 Version Checks${NC}"
    echo "----------------------------------------"
    
    # Check versions
    if command -v node &> /dev/null; then
        node_version=$(node --version)
        check_version "Node.js" "$node_version" "$REQUIRED_NODE_VERSION" || validation_passed=false
    fi
    
    if command -v docker &> /dev/null; then
        docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
        check_version "Docker" "$docker_version" "$REQUIRED_DOCKER_VERSION" || validation_passed=false
    fi
    
    echo ""
    echo -e "${BLUE}💾 Resource Checks${NC}"
    echo "----------------------------------------"
    
    # Check system resources
    check_memory || validation_passed=false
    check_disk_space || validation_passed=false
    
    echo ""
    echo -e "${BLUE}🐳 Docker Checks${NC}"
    echo "----------------------------------------"
    
    # Check Docker
    if command -v docker &> /dev/null; then
        check_docker_permissions || validation_passed=false
        test_docker_containers || validation_passed=false
    fi
    
    echo ""
    echo -e "${BLUE}📁 Project Validation${NC}"
    echo "----------------------------------------"
    
    # Validate project
    validate_project_structure || validation_passed=false
    validate_npm_scripts || validation_passed=false
    
    # Test npm commands if dependencies exist
    if [ -d "node_modules" ] || [ "$1" = "--test-npm" ]; then
        echo ""
        echo -e "${BLUE}🧪 NPM Command Tests${NC}"
        echo "----------------------------------------"
        test_npm_commands || validation_passed=false
    else
        echo ""
        echo -e "${YELLOW}⚠️ Skipping npm command tests (run with --test-npm to include)${NC}"
    fi
    
    echo ""
    echo "=================================================="
    
    if [ "$validation_passed" = true ]; then
        echo -e "🎉 ${GREEN}VALIDATION PASSED${NC}"
        echo -e "✅ ${GREEN}Jenkins CI/CD pipeline is ready to be configured!${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Configure Jenkins with the provided Jenkinsfile"
        echo "2. Set up the required environment variables"
        echo "3. Install the necessary Jenkins plugins"
        echo "4. Run a test build to verify everything works"
        exit 0
    else
        echo -e "❌ ${RED}VALIDATION FAILED${NC}"
        echo -e "⚠️ ${YELLOW}Please fix the issues above before setting up Jenkins CI/CD${NC}"
        echo ""
        echo -e "${BLUE}Common fixes:${NC}"
        echo "- Install missing dependencies"
        echo "- Upgrade to required versions"
        echo "- Fix Docker permissions: sudo usermod -aG docker \$USER"
        echo "- Ensure sufficient system resources"
        exit 1
    fi
}

# Run validation
main "$@"
