# DiagramAI

AI-Powered Interactive Diagramming Tool with bidirectional conversion between visual flow diagrams and Mermaid syntax.

## Overview

DiagramAI is a web application that provides intelligent feedback loops between AI-generated system diagrams and human editing capabilities. Users can describe their application logic in natural language, receive AI-generated diagrams, edit them in their preferred format, and get AI analysis to identify logic gaps and improvements.

## Features

- 🤖 **AI Diagram Generation**: Convert natural language to visual flow diagrams or Mermaid
- 🔄 **Bidirectional Conversion**: Seamlessly convert between visual flow and Mermaid formats
- ✏️ **Dual Format Editing**: Visual drag-and-drop editor and text-based Mermaid editor
- 🧠 **AI Feedback Loop**: Get intelligent analysis of diagram changes
- 🔍 **Logic Analysis**: Identify potential issues, gaps, and improvements
- ✅ **Format Validation**: Ensure semantic preservation during conversions

## Architecture

The application consists of several containerized services:

- **Frontend**: React app with React Flow and Mermaid.js
- **Backend**: Node.js API server with MCP integration
- **Database**: PostgreSQL for data persistence
- **Cache**: Redis for session management
- **Proxy**: Nginx reverse proxy

## Quick Start

### Prerequisites

- Docker with Docker Compose v2 support
- API keys for Claude and/or Gemini (optional for basic testing)

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd DiagramAI
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file with your API keys and configuration
```

3. Start the development environment:
```bash
./dev.sh
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

### Production Deployment

1. Configure production environment variables in `.env`
2. Run the deployment script:
```bash
./deploy.sh
```

The application will be available at http://localhost

## Services

### Frontend (React)
- Port: 3000
- Technologies: React, React Flow, Mermaid.js, Tailwind CSS
- Features: Visual diagram editor, Mermaid code editor, AI integration

### Backend (Node.js)
- Port: 3001
- Technologies: Express, Socket.io, MCP
- Features: API server, WebSocket support, AI integration, conversion engine

### Database (PostgreSQL)
- Port: 5432
- Features: User management, project storage, diagram versioning

### Cache (Redis)
- Port: 6379
- Features: Session management, caching AI responses

### Proxy (Nginx)
- Port: 80/443
- Features: Load balancing, SSL termination, rate limiting

## API Endpoints

- `GET /health` - Health check
- `GET /api/status` - Service status
- `POST /api/diagrams/generate` - Generate diagram from description
- `POST /api/diagrams/convert` - Convert between formats
- `POST /api/diagrams/analyze` - Analyze diagram for improvements

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Code Quality
```bash
# Backend linting
cd backend && npm run lint

# Frontend linting
cd frontend && npm run lint
```

### Database Migrations
The database is automatically initialized with the schema defined in `database/init.sql`.

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `CLAUDE_API_KEY`: Claude AI API key
- `GEMINI_API_KEY`: Gemini AI API key
- `JWT_SECRET`: Secret for JWT token signing
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

### Docker Compose

- `docker-compose.yml`: Production configuration
- `docker-compose.dev.yml`: Development overrides

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and support, please create an issue in the repository.