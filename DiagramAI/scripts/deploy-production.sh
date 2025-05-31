#!/bin/bash

# DiagramAI Production Deployment Script
# This script downloads the latest production files and updates the deployment
#
# Usage:
#   curl -sSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/refs/heads/main/DiagramAI/scripts/deploy-production.sh | bash
#
# Or download and run:
#   wget https://raw.githubusercontent.com/PadsterH2012/DiagramAI/refs/heads/main/DiagramAI/scripts/deploy-production.sh
#   chmod +x deploy-production.sh
#   ./deploy-production.sh

set -euo pipefail

# Configuration
GITHUB_REPO="PadsterH2012/DiagramAI"
GITHUB_BRANCH="main"
BASE_URL="https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}/DiagramAI"
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to download file with error handling
download_file() {
    local url="$1"
    local output="$2"
    local description="$3"
    
    log_info "Downloading $description..."
    
    if command_exists curl; then
        if curl -sSL -f "$url" -o "$output"; then
            log_success "Downloaded $description"
            return 0
        else
            log_error "Failed to download $description from $url"
            return 1
        fi
    elif command_exists wget; then
        if wget -q "$url" -O "$output"; then
            log_success "Downloaded $description"
            return 0
        else
            log_error "Failed to download $description from $url"
            return 1
        fi
    else
        log_error "Neither curl nor wget is available"
        return 1
    fi
}

# Function to backup existing files
backup_files() {
    log_info "Creating backup in $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup existing files if they exist
    [ -f "docker-compose.prod.yml" ] && cp "docker-compose.prod.yml" "$BACKUP_DIR/"
    [ -f "redis.conf" ] && cp "redis.conf" "$BACKUP_DIR/"
    [ -d "scripts" ] && cp -r "scripts" "$BACKUP_DIR/"
    
    log_success "Backup created in $BACKUP_DIR"
}

# Function to download required files
download_files() {
    log_info "Downloading latest production files..."
    
    # Create scripts directory if it doesn't exist
    mkdir -p scripts
    
    # Download docker-compose.prod.yml
    download_file "$BASE_URL/docker-compose.prod.yml" "docker-compose.prod.yml" "Production Docker Compose file"
    
    # Download redis.conf (optional - Redis will use defaults if not available)
    if ! download_file "$BASE_URL/redis.conf" "redis.conf" "Redis configuration"; then
        log_warning "Redis configuration download failed, using Redis defaults"
    fi
    
    # Download essential scripts
    local scripts=(
        "init-db.sql"
        "init-database.sh"
        "start-prod.sh"
        "verify-database.sh"
    )
    
    for script in "${scripts[@]}"; do
        download_file "$BASE_URL/scripts/$script" "scripts/$script" "Script: $script"
        # Make shell scripts executable
        if [[ "$script" == *.sh ]]; then
            chmod +x "scripts/$script"
        fi
    done
}

# Function to check Docker and Docker Compose
check_docker() {
    log_info "Checking Docker installation..."
    
    if ! command_exists docker; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    log_success "Docker is ready"
}

# Function to stop existing containers
stop_containers() {
    log_info "Stopping existing containers..."
    
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down || {
            log_warning "Failed to stop containers with docker-compose, trying docker compose..."
            docker compose -f docker-compose.prod.yml down || {
                log_warning "Could not stop containers gracefully"
            }
        }
    else
        log_warning "No existing docker-compose.prod.yml found"
    fi
}

# Function to pull latest images
pull_images() {
    log_info "Pulling latest Docker images..."
    
    if command_exists docker-compose; then
        docker-compose -f docker-compose.prod.yml pull
    else
        docker compose -f docker-compose.prod.yml pull
    fi
    
    log_success "Images pulled successfully"
}

# Function to start containers
start_containers() {
    log_info "Starting containers..."

    if command_exists docker-compose; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker compose -f docker-compose.prod.yml up -d
    fi

    log_success "Containers started"
}

# Function to check database state and handle migrations
run_migrations() {
    log_info "Checking database state and running migrations..."

    # Wait a moment for containers to be fully ready
    sleep 10

    # Check if database has tables (baseline schema applied)
    local has_tables=false
    if command_exists docker-compose; then
        if docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d diagramai_dev -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';" | grep -q "1"; then
            has_tables=true
        fi
    else
        if docker compose -f docker-compose.prod.yml exec -T db psql -U postgres -d diagramai_dev -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';" | grep -q "1"; then
            has_tables=true
        fi
    fi

    if [ "$has_tables" = true ]; then
        log_info "Database has existing schema, running incremental migrations only..."

        # Run Prisma migrations for existing database
        if command_exists docker-compose; then
            if docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy; then
                log_success "Incremental migrations completed successfully"
            else
                log_warning "Migrations failed - database may be up to date"
            fi
        else
            if docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy; then
                log_success "Incremental migrations completed successfully"
            else
                log_warning "Migrations failed - database may be up to date"
            fi
        fi
    else
        log_info "Fresh database detected, baseline schema should be applied by init-db.sql"
        log_info "Generating Prisma client..."

        # Generate Prisma client for fresh database
        if command_exists docker-compose; then
            docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate
        else
            docker compose -f docker-compose.prod.yml exec -T app npx prisma generate
        fi

        log_success "Database initialization completed - baseline schema ready"
    fi
}

# Function to wait for services to be healthy
wait_for_health() {
    log_info "Waiting for services to become healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        # Check if health endpoint responds
        if curl -sSf http://localhost:3000/api/health >/dev/null 2>&1; then
            log_success "Services are healthy!"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_warning "Services may not be fully healthy yet. Check manually with: curl http://localhost:3000/api/health"
    return 1
}

# Function to show deployment status
show_status() {
    log_info "Deployment Status:"
    echo
    
    # Show container status
    log_info "Container Status:"
    if command_exists docker-compose; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker compose -f docker-compose.prod.yml ps
    fi
    
    echo
    
    # Show health check
    log_info "Health Check:"
    if curl -sSf http://localhost:3000/api/health 2>/dev/null; then
        echo
        log_success "✅ Application is healthy"
    else
        log_warning "⚠️  Application health check failed"
    fi
    
    echo
    log_info "Access URLs:"
    echo "  🌐 DiagramAI:     http://localhost:3000"
    echo "  🗄️  Database Admin: http://localhost:8080"
    echo "  ❤️  Health Check:  http://localhost:3000/api/health"
}

# Function to cleanup on failure
cleanup_on_failure() {
    log_error "Deployment failed. Restoring from backup..."
    
    if [ -d "$BACKUP_DIR" ]; then
        # Restore backup files
        [ -f "$BACKUP_DIR/docker-compose.prod.yml" ] && cp "$BACKUP_DIR/docker-compose.prod.yml" .
        [ -f "$BACKUP_DIR/redis.conf" ] && cp "$BACKUP_DIR/redis.conf" .
        [ -d "$BACKUP_DIR/scripts" ] && cp -r "$BACKUP_DIR/scripts" .
        
        # Try to restart with old configuration
        if [ -f "docker-compose.prod.yml" ]; then
            log_info "Attempting to restart with previous configuration..."
            if command_exists docker-compose; then
                docker-compose -f docker-compose.prod.yml up -d
            else
                docker compose -f docker-compose.prod.yml up -d
            fi
        fi
        
        log_info "Backup restored. Check the logs and try again."
    fi
}

# Main deployment function
main() {
    echo
    log_info "🚀 DiagramAI Production Deployment Script"
    log_info "=========================================="
    echo
    
    # Set trap for cleanup on failure
    trap cleanup_on_failure ERR
    
    # Pre-flight checks
    check_docker
    
    # Create backup
    backup_files
    
    # Stop existing containers
    stop_containers
    
    # Download latest files
    download_files
    
    # Pull latest images
    pull_images
    
    # Start containers
    start_containers

    # Run database migrations
    run_migrations

    # Wait for health
    wait_for_health
    
    # Show status
    show_status
    
    echo
    log_success "🎉 Deployment completed successfully!"
    log_info "Backup saved in: $BACKUP_DIR"
    echo
}

# Run main function
main "$@"
