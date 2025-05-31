# DiagramAI

A powerful, AI-enhanced diagram creation and collaboration platform built with Next.js, React Flow, and Mermaid.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/PadsterH2012/DiagramAI)
[![Docker](https://img.shields.io/badge/docker-available-blue)](https://hub.docker.com/r/padster2012/diagramai)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Quick Start with Docker

### Option 1: One-Command Setup (Recommended)

```bash
# Download and start DiagramAI with all dependencies
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/docker-compose.prod.yml -o docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Clone and Run

```bash
# Clone the repository
git clone https://github.com/PadsterH2012/DiagramAI.git
cd DiagramAI/DiagramAI

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

### Access Your Application

- **DiagramAI**: http://localhost:3000
- **Database Admin**: http://localhost:8080
- **Health Check**: http://localhost:3000/api/health

## 📋 Features

### Core Functionality
- 🎨 **Interactive Diagram Editor** - Drag-and-drop interface with React Flow
- 📊 **Mermaid Support** - Create diagrams with Mermaid syntax
- 🤖 **AI Integration** - OpenAI, Anthropic, and OpenRouter support
- 💾 **Real-time Collaboration** - WebSocket-based live editing
- 🔐 **Authentication** - Secure user management with NextAuth.js

### Diagram Types
- Flowcharts and Process Diagrams
- Entity Relationship Diagrams (ERD)
- Network Diagrams
- Organizational Charts
- Mind Maps
- Custom Diagrams

### Technical Features
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **High Performance** - Optimized for speed and scalability
- 🔒 **Security** - Built-in security headers and authentication
- 📈 **Monitoring** - Health checks and performance monitoring
- 🐳 **Docker Ready** - Production-ready containerization

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Diagram Engine**: React Flow, Mermaid.js
- **Backend**: Node.js, Prisma ORM
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI, Anthropic, OpenRouter APIs
- **Testing**: Jest, Playwright, Testing Library
- **DevOps**: Docker, Jenkins CI/CD

## 📦 Available Docker Images

### Production Images
- **Latest**: `padster2012/diagramai:latest`
- **Versioned**: `padster2012/diagramai:1.0.40`

### Pull and Run Manually
```bash
# Pull the latest image
docker pull padster2012/diagramai:latest

# Run with dependencies (see PRODUCTION-DEPLOYMENT.md for full setup)
docker run -p 3000:3000 padster2012/diagramai:latest
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15
- Redis 7

### Local Development
```bash
# Clone the repository
git clone https://github.com/PadsterH2012/DiagramAI.git
cd DiagramAI/DiagramAI

# Install dependencies
npm install

# Start development services
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

### Environment Configuration
Copy `.env.production.example` to `.env.local` and configure:

```bash
cp .env.production.example .env.local
# Edit .env.local with your configuration
```

## 🧪 Testing

### Run All Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# All tests with coverage
npm run test:all
```

### Test Results
- **Unit Tests**: 24/24 passing
- **Integration Tests**: 10/10 passing
- **E2E Tests**: 38/38 passing
- **Total Coverage**: 100% success rate

## 🤖 AI Agent Integration

### MCP Server for Claude Desktop

DiagramAI includes a Model Context Protocol (MCP) server that allows AI agents like Claude Desktop to create and edit diagrams programmatically.

**Repository**: [mcp-server-diagramai](https://github.com/PadsterH2012/mcp-server-diagramai)

#### Installation
```bash
# Install globally via npm
npm install -g mcp-server-diagramai
```

#### Claude Desktop Configuration
Add to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "diagramai": {
      "command": "npx",
      "args": ["mcp-server-diagramai"],
      "env": {
        "DIAGRAMAI_API_URL": "http://localhost:3000",
        "DIAGRAMAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### Available Tools
- `create_diagram` - Create new diagrams
- `get_diagram` - Retrieve diagram content
- `update_diagram` - Modify existing diagrams
- `delete_diagram` - Remove diagrams
- `add_node` - Add nodes to diagrams
- `add_edge` - Connect nodes with edges
- `list_diagrams` - Get all accessible diagrams

## 📚 Documentation

- [Production Deployment Guide](PRODUCTION-DEPLOYMENT.md)
- [Version Tracking System](VERSION-TRACKING.md)
- [Docker Push Implementation](DOCKER-PUSH-IMPLEMENTATION.md)
- [Jenkins CI/CD Setup](JENKINS-CICD-SUMMARY.md)
- [API Documentation](documentation/api/)
- [Architecture Overview](documentation/architecture/)
- [MCP Server Documentation](https://github.com/PadsterH2012/mcp-server-diagramai)

## 🚀 Production Deployment

### Docker Compose (Recommended)
```bash
# Download production compose file
curl -fsSL https://raw.githubusercontent.com/PadsterH2012/DiagramAI/main/DiagramAI/docker-compose.prod.yml -o docker-compose.prod.yml

# Configure environment (optional)
cp .env.production.example .env.production

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Docker Setup
See [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md) for detailed instructions.

### With Nginx (Optional)
```bash
# Start with Nginx reverse proxy
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d
```

## 🔐 Security

- HTTPS/TLS encryption
- Security headers (HSTS, CSP, etc.)
- Rate limiting
- Input validation and sanitization
- Secure authentication with NextAuth.js
- Environment variable protection

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Container health
docker-compose -f docker-compose.prod.yml ps
```

### Logs
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# View all service logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/PadsterH2012/DiagramAI/issues)
- **Documentation**: [Project Wiki](https://github.com/PadsterH2012/DiagramAI/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/PadsterH2012/DiagramAI/discussions)

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the diagram editor
- [Mermaid.js](https://mermaid.js.org/) for diagram syntax
- [Next.js](https://nextjs.org/) for the application framework
- [Prisma](https://prisma.io/) for database management

---

**Made with ❤️ by the DiagramAI Team**
