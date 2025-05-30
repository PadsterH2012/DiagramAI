# DiagramAI Version Tracking System

## Overview

DiagramAI implements comprehensive version tracking for Docker containers and application UI. This system provides visibility into which version of DiagramAI is running in any environment.

## Version Display

### UI Location
The version information is displayed in the application header, under the "DiagramAI" title:
- **Version number**: e.g., "v1.0.45"
- **Build date**: e.g., "Jan 27, 2025" (hidden on small screens)
- **Git commit**: e.g., "a1b2c3d4" (hidden on medium screens)
- **Environment indicator**: "DEV" badge for development builds

### API Endpoint
Version information is available via REST API:
```bash
curl http://localhost:3000/api/version
```

Response:
```json
{
  "version": "1.0.45",
  "buildDate": "2025-01-27 12:00:00",
  "gitCommit": "a1b2c3d4",
  "nodeEnv": "production",
  "timestamp": "2025-01-27T12:00:00.000Z"
}
```

## Version Management

### Default Version
- **Production**: `1.0.45`
- **Development**: `1.0.45-dev`

### Environment Variables
- `APP_VERSION`: Application version string
- `BUILD_DATE`: Build timestamp
- `GIT_COMMIT`: Git commit hash (short form)

## Development Usage

### Local Development
1. **Set version variables**:
   ```bash
   source scripts/set-version.sh [version]
   ```

2. **Check current version**:
   ```bash
   npm run version:info
   ```

3. **Using environment file**:
   ```bash
   cp .env.version.example .env.local
   # Edit .env.local with your values
   npm run dev
   ```

### Docker Development
```bash
# Set environment variables
source scripts/set-version.sh 1.0.46-dev

# Build and run with version
docker compose up --build
```

## Production Deployment

### CI/CD Pipeline (Jenkins)
The Jenkins pipeline automatically:
1. Generates version: `1.0.${BUILD_NUMBER}`
2. Sets build date: Current timestamp
3. Captures git commit: Short hash
4. Builds Docker image with version args
5. Tags image with version and 'latest'

### Docker Compose Production
```bash
# Using pre-built image (recommended)
docker compose -f docker-compose.prod.yml up

# Building locally with version
export APP_VERSION=1.0.45
export BUILD_DATE="$(date '+%Y-%m-%d %H:%M:%S')"
export GIT_COMMIT="$(git rev-parse --short HEAD)"
docker compose -f docker-compose.prod.yml up --build
```

### Manual Docker Build
```bash
docker build \
  --build-arg VERSION_STRING=1.0.45 \
  --build-arg BUILD_DATE="$(date '+%Y-%m-%d %H:%M:%S')" \
  --build-arg GIT_COMMIT="$(git rev-parse --short HEAD)" \
  -t diagramai:1.0.45 .
```

## Docker Images

### Available Tags
- `padster2012/diagramai:latest` - Latest stable release
- `padster2012/diagramai:1.0.45` - Specific version
- `padster2012/diagramai:1.0.${BUILD_NUMBER}` - CI/CD builds

### Version Information in Images
All Docker images contain embedded version information accessible via:
- Environment variables in container
- Application UI
- API endpoint

## Configuration Files

### Dockerfile
- Accepts `VERSION_STRING`, `BUILD_DATE`, `GIT_COMMIT` build args
- Sets environment variables in container
- Default version: `1.0.45`

### Docker Compose
- **Development**: Uses `Dockerfile.dev` with version args
- **Production**: Uses pre-built image or local build with args
- Supports environment variable overrides

### Next.js Configuration
- Exposes version environment variables to client
- Enables runtime access to version information

## Troubleshooting

### Version Not Displaying
1. Check environment variables:
   ```bash
   docker exec container_name env | grep -E "(APP_VERSION|BUILD_DATE|GIT_COMMIT)"
   ```

2. Verify API endpoint:
   ```bash
   curl http://localhost:3000/api/version
   ```

3. Check browser console for errors

### Build Issues
1. Ensure build args are passed correctly
2. Verify environment variables are set
3. Check Docker build logs for version-related errors

## Best Practices

1. **Always use semantic versioning** (e.g., 1.0.45)
2. **Include environment suffix** for non-production builds (e.g., 1.0.45-dev)
3. **Use CI/CD for production builds** to ensure consistent versioning
4. **Tag Docker images** with both version and 'latest'
5. **Document version changes** in release notes

## Integration with CI/CD

The version tracking system is fully integrated with the Jenkins CI/CD pipeline:
- Automatic version generation based on build number
- Git commit tracking for traceability
- Docker image tagging with version information
- Deployment to DockerHub with proper versioning

This ensures every production deployment has proper version tracking and traceability.
