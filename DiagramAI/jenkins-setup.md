# Jenkins CI/CD Setup Guide for DiagramAI

## 🎯 Overview

This guide provides comprehensive instructions for setting up the Jenkins CI/CD pipeline for DiagramAI, which implements a **100% test success requirement** across all 81 tests.

## 📋 Prerequisites

### 1. Jenkins Server Requirements
- **Jenkins Version**: 2.400+ (LTS recommended)
- **Java Version**: 11 or 17
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 50GB+ available space
- **Docker**: Docker Engine 20.10+ installed and accessible to Jenkins

### 2. Required Jenkins Plugins

Install these plugins via Jenkins Plugin Manager:

```bash
# Core plugins
- Pipeline
- Pipeline: Stage View
- Blue Ocean (optional, for better UI)
- Git
- GitHub (if using GitHub)

# Node.js and testing
- NodeJS Plugin
- HTML Publisher
- JUnit
- Coverage (Cobertura/LCOV)

# Docker and infrastructure
- Docker Pipeline
- Docker Commons

# Notifications (optional)
- Email Extension
- Slack Notification
```

### 3. System Tools Configuration

Configure these tools in Jenkins Global Tool Configuration:

#### Node.js Installation
1. Go to `Manage Jenkins` → `Global Tool Configuration`
2. Add NodeJS installation:
   - **Name**: `NodeJS-18`
   - **Version**: `18.x` (latest LTS)
   - **Global npm packages**: `npm@latest`

#### Docker Configuration
1. Ensure Jenkins user has Docker permissions:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## 🚀 Pipeline Setup

### 1. Create New Pipeline Job

1. **New Item** → **Pipeline**
2. **Name**: `DiagramAI-CI-CD`
3. **Description**: `DiagramAI CI/CD Pipeline - Requires 100% test success (81/81 tests)`

### 2. Pipeline Configuration

#### General Settings
- ✅ **Discard old builds**: Keep 10 builds, 30 days
- ✅ **Do not allow concurrent builds**
- ✅ **GitHub project** (if applicable): `https://github.com/your-org/DiagramAI`

#### Build Triggers
Choose one or more:
- ✅ **GitHub hook trigger** (for push events)
- ✅ **Poll SCM**: `H/5 * * * *` (every 5 minutes)
- ✅ **Build periodically**: `H 2 * * *` (nightly builds)

#### Pipeline Definition
- **Definition**: `Pipeline script from SCM`
- **SCM**: `Git`
- **Repository URL**: Your DiagramAI repository
- **Branch**: `*/main` (or your default branch)
- **Script Path**: `DiagramAI/Jenkinsfile`

### 3. Environment Variables

Set these in Jenkins job configuration or global environment:

```bash
# Required for all environments
NODE_ENV=test
CI=true
NEXT_TELEMETRY_DISABLED=1

# Database (will be overridden by Docker containers)
DATABASE_URL=postgresql://postgres:password@localhost:5432/diagramai_test
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=diagramai_test

# Authentication (test values)
NEXTAUTH_SECRET=test-secret-key-for-ci
NEXTAUTH_URL=http://localhost:3000

# Optional: API keys for integration tests (if needed)
# OPENAI_API_KEY=test-key
# ANTHROPIC_API_KEY=test-key
```

## 📊 Pipeline Stages Breakdown

### Stage 1: Environment Setup (2-3 minutes)
- ✅ Clean workspace
- ✅ Checkout source code
- ✅ Setup Node.js 18+
- ✅ Verify environment

### Stage 2: Infrastructure Setup (2-3 minutes)
**Parallel execution:**
- ✅ **Database**: PostgreSQL 15 container
- ✅ **Redis**: Redis 7 container

### Stage 3: Dependencies Installation (3-5 minutes)
- ✅ `npm ci` for reproducible builds
- ✅ Playwright browser installation
- ✅ Dependency verification

### Stage 4: Build Application (2-4 minutes)
- ✅ Prisma client generation
- ✅ Next.js build (`npm run build`)
- ✅ Build artifact verification

### Stage 5: Testing Suite (10-15 minutes)
**Parallel execution:**
- ✅ **Unit Tests**: 33 tests with coverage
- ✅ **Integration Tests**: 10 tests with database

### Stage 6: E2E Tests (15-20 minutes)
- ✅ Application startup
- ✅ **E2E Tests**: 38 Playwright tests
- ✅ Test artifact collection

### Stage 7: Test Results Validation (1-2 minutes)
- ✅ **Critical**: Validates 100% success rate
- ✅ **Requirement**: All 81 tests must pass
- ✅ **Failure**: Pipeline fails if any test fails

## ✅ Success Criteria

The pipeline **MUST** achieve:

| Test Category | Required | Description |
|---------------|----------|-------------|
| **Unit Tests** | 33/33 ✅ | Component and utility testing |
| **Integration Tests** | 10/10 ✅ | API and database testing |
| **E2E Tests** | 38/38 ✅ | Full user journey testing |
| **Total** | **81/81** ✅ | **100% Success Rate** |

### Pipeline Success Conditions
- ✅ All 33 unit tests pass
- ✅ All 10 integration tests pass  
- ✅ All 38 E2E tests pass
- ✅ Build artifacts created successfully
- ✅ No critical errors in any stage

### Pipeline Failure Conditions
- ❌ Any test fails (less than 81/81)
- ❌ Build process fails
- ❌ Infrastructure setup fails
- ❌ Dependency installation fails

## 📈 Monitoring and Reporting

### 1. Test Reports
- **Unit Test Coverage**: HTML report with LCOV data
- **E2E Test Report**: Playwright HTML report with screenshots
- **JUnit XML**: For Jenkins test result tracking

### 2. Build Artifacts
- **Application Build**: `.next/` directory
- **Test Results**: `test-results/` and `coverage/`
- **Screenshots**: E2E test failure screenshots

### 3. Notifications (Optional)

Configure in pipeline post-actions:

```groovy
// Email notifications
emailext (
    subject: "DiagramAI Build ${currentBuild.result} - ${env.BUILD_NUMBER}",
    body: "Build completed with ${currentBuild.result}. Check Jenkins for details.",
    to: "team@diagramai.com"
)

// Slack notifications
slackSend (
    channel: '#ci-cd',
    color: currentBuild.result == 'SUCCESS' ? 'good' : 'danger',
    message: "DiagramAI Build ${env.BUILD_NUMBER}: ${currentBuild.result}"
)
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker Permission Denied
```bash
# Fix Jenkins Docker permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### 2. Node.js Version Issues
- Ensure NodeJS-18 is configured in Global Tool Configuration
- Verify `node --version` shows 18.x in build logs

#### 3. Database Connection Issues
- Check PostgreSQL container logs: `docker logs diagramai-test-db`
- Verify port 5432 is available
- Ensure DATABASE_URL is correctly formatted

#### 4. E2E Test Failures
- Check Playwright report for detailed error information
- Verify application started successfully on port 3000
- Review screenshots in test artifacts

#### 5. Memory Issues
- Increase Jenkins heap size: `-Xmx4g`
- Monitor Docker container memory usage
- Consider reducing parallel test execution

### Debug Commands

```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Verify Docker containers
docker ps -a
docker logs diagramai-test-db
docker logs diagramai-test-redis

# Test database connectivity
docker exec diagramai-test-db pg_isready -U postgres

# Check application health
curl -f http://localhost:3000/api/health
```

## 🚀 Advanced Configuration

### 1. Multi-Branch Pipeline
For feature branch testing:
- Create **Multibranch Pipeline** instead of regular Pipeline
- Configure branch discovery and filtering
- Enable automatic PR testing

### 2. Parallel Agent Execution
For faster builds with multiple agents:
```groovy
pipeline {
    agent none
    stages {
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    agent { label 'nodejs' }
                    // ... unit test steps
                }
                stage('E2E Tests') {
                    agent { label 'e2e' }
                    // ... e2e test steps
                }
            }
        }
    }
}
```

### 3. Build Caching
Optimize build times:
- Use Docker layer caching
- Cache `node_modules` between builds
- Cache Playwright browsers

## 📞 Support

For issues with the CI/CD pipeline:

1. **Check Jenkins Console Output**: Detailed error information
2. **Review Test Reports**: HTML reports for specific test failures
3. **Examine Build Artifacts**: Screenshots and logs
4. **Verify Environment**: Ensure all prerequisites are met

**Remember**: The pipeline enforces a **100% test success rate** - all 81 tests must pass for the build to succeed! 🎯
