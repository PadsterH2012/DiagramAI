# 🚀 DiagramAI Automated Production Deployment

This guide explains how to deploy DiagramAI in production using the automated deployment script that downloads the latest files and handles the entire deployment process.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Internet connection to download files
- `curl` or `wget` available
- Sufficient disk space for Docker images and data

## 🎯 Quick Deployment

### Option 1: One-Line Deployment (Recommended)

Run this command on your production server:

```bash
curl -sSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/scripts/deploy-production.sh | bash
```

### Option 2: Download and Run

```bash
# Download the script
wget https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/scripts/deploy-production.sh

# Make it executable
chmod +x deploy-production.sh

# Run the deployment
./deploy-production.sh
```

## 🔧 What the Script Does

The deployment script automatically:

1. **✅ Pre-flight Checks**: Verifies Docker is installed and running
2. **💾 Backup**: Creates a timestamped backup of existing files
3. **⬇️ Download**: Fetches the latest production files from GitHub:
   - `docker-compose.prod.yml`
   - `redis.conf`
   - Database initialization scripts
   - Helper scripts
4. **🛑 Stop**: Gracefully stops existing containers
5. **📦 Pull**: Downloads the latest Docker images
6. **🚀 Start**: Starts the updated containers
7. **❤️ Health Check**: Waits for services to become healthy
8. **📊 Status**: Shows deployment status and access URLs

## 📁 Files Downloaded

The script downloads these essential files:

```
docker-compose.prod.yml    # Main production configuration
redis.conf                 # Redis configuration
scripts/
├── init-db.sql           # Database initialization
├── init-database.sh      # Database setup script
├── start-prod.sh         # Production startup script
└── verify-database.sh    # Database verification
```

## 🌐 Access URLs

After successful deployment:

- **🌐 DiagramAI**: http://localhost:3000
- **🗄️ Database Admin**: http://localhost:8080
- **❤️ Health Check**: http://localhost:3000/api/health

## 🔍 Troubleshooting

### Check Container Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs app
docker-compose -f docker-compose.prod.yml logs db
```

### Manual Health Check
```bash
curl http://localhost:3000/api/health
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

## 🔄 Updating

To update to the latest version, simply run the deployment script again:

```bash
curl -sSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/scripts/deploy-production.sh | bash
```

The script will:
- Create a new backup
- Download the latest files
- Update the deployment
- Preserve your data

## 💾 Backup and Recovery

### Automatic Backups

The script automatically creates timestamped backups in `backup-YYYYMMDD-HHMMSS/` directories.

### Manual Backup
```bash
# Backup current configuration
cp docker-compose.prod.yml docker-compose.prod.yml.backup
cp -r scripts scripts.backup

# Backup data volumes
docker run --rm -v diagramai_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
docker run --rm -v diagramai_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .
```

### Recovery
```bash
# Restore from backup directory
cp backup-YYYYMMDD-HHMMSS/* .
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Environment Variables

Edit `docker-compose.prod.yml` to customize:

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=postgresql://postgres:DiagramAI2024!@db:5432/diagramai_dev
  - REDIS_URL=redis://redis:6379
  - NEXTAUTH_URL=http://your-domain.com
  - NEXTAUTH_SECRET=your-secret-here
  # Add your API keys
  - OPENAI_API_KEY=your_openai_key_here
  - ANTHROPIC_API_KEY=your_anthropic_key_here
```

### SSL/HTTPS Setup

To enable HTTPS with Nginx:

```bash
# Start with Nginx profile
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d

# Add SSL certificates to ./ssl/ directory
# Update nginx.conf for your domain
```

## 📊 Monitoring

### Health Monitoring
```bash
# Continuous health monitoring
watch -n 30 'curl -s http://localhost:3000/api/health | jq .'
```

### Resource Usage
```bash
# Container resource usage
docker stats

# Disk usage
docker system df
```

## 🆘 Support

If you encounter issues:

1. **Check the logs**: `docker-compose -f docker-compose.prod.yml logs`
2. **Verify health**: `curl http://localhost:3000/api/health`
3. **Restart services**: `docker-compose -f docker-compose.prod.yml restart`
4. **Restore backup**: Copy files from `backup-YYYYMMDD-HHMMSS/` directory

## 🔐 Security Notes

- Change default passwords in `docker-compose.prod.yml`
- Use HTTPS in production
- Regularly update Docker images
- Monitor access logs
- Backup data regularly

---

**Need help?** Check the [GitHub Issues](https://github.com/PadsterH2012/DiagramAI/issues) or create a new issue.
