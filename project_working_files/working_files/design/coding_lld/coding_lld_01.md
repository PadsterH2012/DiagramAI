# Backend LLD 01: API Architecture and Code Organization

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Backend Architecture  
**Domain:** Backend/Code Architecture  
**Coverage Area:** API design, code organization, service architecture  
**Prerequisites:** project_hld.md, techstack.md, db_lld_01-04.md  

## Purpose and Scope

This document defines the comprehensive backend architecture and code organization for DiagramAI. It establishes API design patterns, service layer architecture, error handling strategies, and code organization principles that support the application's core functionality and scalability requirements.

**Coverage Areas in This Document:**
- API architecture and endpoint design
- Service layer organization and patterns
- Error handling and validation strategies
- Authentication and authorization implementation
- Code organization and module structure

**Related LLD Files:**
- coding_lld_02.md: AI integration and MCP implementation
- coding_lld_03.md: Performance optimization and caching
- db_lld_01-04.md: Database integration and data models

## Technology Foundation

### Backend Technology Stack
Based on validated research findings and Next.js 15+ capabilities:

**Core Framework:**
- **Next.js 15+ API Routes**: Integrated backend solution with frontend framework
- **TypeScript 5+**: Type safety and enhanced developer experience
- **Node.js 18+**: Runtime environment with modern features

**Database Integration:**
- **Prisma 5+**: Type-safe ORM with automatic migrations
- **PostgreSQL 15+**: Production database with JSONB support
- **SQLite 3.40+**: Development database for local testing

**AI Integration:**
- **Model Context Protocol (MCP)**: Standardized AI service communication
- **OpenAI SDK**: Primary AI provider integration
- **Anthropic SDK**: Secondary AI provider for redundancy

## API Architecture

### 1. RESTful API Design

#### API Structure Overview
```
/api/
├── auth/
│   ├── login
│   ├── logout
│   ├── register
│   ├── refresh
│   └── reset-password
├── users/
│   ├── [id]
│   ├── [id]/profile
│   ├── [id]/preferences
│   └── [id]/sessions
├── diagrams/
│   ├── [id]
│   ├── [id]/versions
│   ├── [id]/collaborators
│   ├── [id]/comments
│   └── [id]/export
├── ai/
│   ├── generate
│   ├── analyze
│   ├── convert
│   └── suggest
└── system/
    ├── health
    ├── settings
    └── metrics
```

#### API Endpoint Specifications

##### Authentication Endpoints
```typescript
// /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

// /api/auth/register
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface RegisterResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  };
  message: string;
}
```

##### Diagram Management Endpoints
```typescript
// /api/diagrams
interface CreateDiagramRequest {
  title: string;
  description?: string;
  content: DiagramContent;
  format: 'react_flow' | 'mermaid';
  tags?: string[];
  isPublic?: boolean;
}

interface DiagramResponse {
  id: string;
  title: string;
  description?: string;
  content: DiagramContent;
  format: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
}

// /api/diagrams/[id]/versions
interface CreateVersionRequest {
  content: DiagramContent;
  format: 'react_flow' | 'mermaid';
  changeSummary?: string;
  changeType: 'manual' | 'ai_generated' | 'conversion';
}

interface VersionResponse {
  id: string;
  versionNumber: number;
  content: DiagramContent;
  format: string;
  changeSummary?: string;
  changeType: string;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  };
}
```

##### AI Integration Endpoints
```typescript
// /api/ai/generate
interface GenerateDiagramRequest {
  description: string;
  format: 'react_flow' | 'mermaid';
  diagramType?: string;
  style?: string;
}

interface GenerateDiagramResponse {
  success: boolean;
  diagram: DiagramContent;
  metadata: {
    provider: string;
    model: string;
    processingTime: number;
  };
}

// /api/ai/analyze
interface AnalyzeDiagramRequest {
  diagramId: string;
  analysisType: 'logic' | 'structure' | 'optimization' | 'suggestions';
}

interface AnalyzeDiagramResponse {
  success: boolean;
  analysis: {
    type: string;
    findings: AnalysisFinding[];
    suggestions: Suggestion[];
    score: number;
  };
  metadata: {
    provider: string;
    processingTime: number;
  };
}
```

### 2. Service Layer Architecture

#### Service Organization Pattern
```typescript
// Service Layer Structure
interface ServiceLayer {
  // Core Services
  userService: UserService;
  diagramService: DiagramService;
  authService: AuthService;
  
  // AI Services
  aiService: AIService;
  conversionService: ConversionService;
  
  // Utility Services
  validationService: ValidationService;
  notificationService: NotificationService;
  cacheService: CacheService;
}

// Base Service Interface
interface BaseService {
  create(data: any): Promise<any>;
  findById(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<boolean>;
  findMany(filters: any): Promise<any[]>;
}
```

#### User Service Implementation
```typescript
// services/UserService.ts
export class UserService implements BaseService {
  constructor(
    private prisma: PrismaClient,
    private validationService: ValidationService,
    private cacheService: CacheService
  ) {}

  async create(userData: CreateUserData): Promise<User> {
    // Validate input data
    await this.validationService.validateUserData(userData);
    
    // Check for existing user
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);
    
    // Create user with transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          ...userData,
          passwordHash,
          profile: {
            create: {
              timezone: 'UTC',
              languagePreference: 'en',
              themePreference: 'light'
            }
          }
        },
        include: {
          profile: true
        }
      });
      
      return newUser;
    });
    
    // Clear cache
    await this.cacheService.invalidate(`user:${user.id}`);
    
    return this.sanitizeUser(user);
  }

  async findById(id: string): Promise<User | null> {
    // Check cache first
    const cached = await this.cacheService.get(`user:${id}`);
    if (cached) return cached;
    
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        _count: {
          select: {
            diagrams: true,
            sessions: { where: { isActive: true } }
          }
        }
      }
    });
    
    if (user) {
      const sanitized = this.sanitizeUser(user);
      await this.cacheService.set(`user:${id}`, sanitized, 300); // 5 min cache
      return sanitized;
    }
    
    return null;
  }

  async update(id: string, updateData: UpdateUserData): Promise<User> {
    await this.validationService.validateUserUpdateData(updateData);
    
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        profile: true
      }
    });
    
    // Clear cache
    await this.cacheService.invalidate(`user:${id}`);
    
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any): User {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
```

#### Diagram Service Implementation
```typescript
// services/DiagramService.ts
export class DiagramService implements BaseService {
  constructor(
    private prisma: PrismaClient,
    private validationService: ValidationService,
    private conversionService: ConversionService,
    private cacheService: CacheService
  ) {}

  async create(diagramData: CreateDiagramData): Promise<Diagram> {
    // Validate diagram content
    await this.validationService.validateDiagramContent(
      diagramData.content, 
      diagramData.format
    );
    
    // Generate content hash
    const contentHash = this.generateContentHash(diagramData.content);
    
    // Create diagram with initial version
    const diagram = await this.prisma.$transaction(async (tx) => {
      const newDiagram = await tx.diagram.create({
        data: {
          ...diagramData,
          contentHash,
          versions: {
            create: {
              versionNumber: 1,
              content: diagramData.content,
              format: diagramData.format,
              contentHash,
              changeType: 'manual',
              createdBy: diagramData.userId
            }
          }
        },
        include: {
          user: {
            select: { id: true, username: true, displayName: true }
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1
          }
        }
      });
      
      return newDiagram;
    });
    
    return diagram;
  }

  async findById(id: string, userId?: string): Promise<Diagram | null> {
    const diagram = await this.prisma.diagram.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, displayName: true }
        },
        collaborators: {
          where: { status: 'accepted' },
          include: {
            user: {
              select: { id: true, username: true, displayName: true }
            }
          }
        },
        _count: {
          select: {
            versions: true,
            comments: true,
            collaborators: { where: { status: 'accepted' } }
          }
        }
      }
    });
    
    if (!diagram) return null;
    
    // Check access permissions
    if (!this.hasAccess(diagram, userId)) {
      throw new ForbiddenError('Access denied to this diagram');
    }
    
    return diagram;
  }

  async createVersion(
    diagramId: string, 
    versionData: CreateVersionData
  ): Promise<DiagramVersion> {
    // Validate content
    await this.validationService.validateDiagramContent(
      versionData.content,
      versionData.format
    );
    
    const contentHash = this.generateContentHash(versionData.content);
    
    const version = await this.prisma.$transaction(async (tx) => {
      // Get next version number
      const lastVersion = await tx.diagramVersion.findFirst({
        where: { diagramId },
        orderBy: { versionNumber: 'desc' }
      });
      
      const versionNumber = (lastVersion?.versionNumber || 0) + 1;
      
      // Create new version
      const newVersion = await tx.diagramVersion.create({
        data: {
          ...versionData,
          diagramId,
          versionNumber,
          contentHash
        }
      });
      
      // Update diagram with latest content
      await tx.diagram.update({
        where: { id: diagramId },
        data: {
          content: versionData.content,
          format: versionData.format,
          contentHash,
          updatedAt: new Date()
        }
      });
      
      return newVersion;
    });
    
    return version;
  }

  private hasAccess(diagram: any, userId?: string): boolean {
    // Public diagrams are accessible to everyone
    if (diagram.isPublic) return true;
    
    // Owner has full access
    if (diagram.userId === userId) return true;
    
    // Check collaborator access
    if (userId && diagram.collaborators.some((c: any) => c.userId === userId)) {
      return true;
    }
    
    return false;
  }

  private generateContentHash(content: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex');
  }
}
```

### 3. Error Handling Strategy

#### Custom Error Classes
```typescript
// errors/CustomErrors.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}
```

#### Global Error Handler
```typescript
// middleware/errorHandler.ts
export const errorHandler = (
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    
    if (error instanceof ValidationError) {
      details = { field: error.field };
    }
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    if (error.code === 'P2002') {
      statusCode = 409;
      message = 'Resource already exists';
    } else if (error.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    }
  }

  // Log error for monitoring
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: statusCode,
      details
    }
  });
};
```

### 4. Authentication and Authorization

#### JWT Authentication Middleware
```typescript
// middleware/auth.ts
export const authenticateToken = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Verify session is still active
    const session = await prisma.userSession.findUnique({
      where: { sessionToken: token },
      include: { user: true }
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Update last accessed time
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastAccessedAt: new Date() }
    });

    req.user = session.user;
    req.session = session;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
};

// Authorization middleware
export const requirePermission = (permission: string) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    // Check user permissions based on context
    const hasPermission = await checkUserPermission(req.user.id, permission, req);
    
    if (!hasPermission) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
```

### 5. API Route Implementation Pattern

#### Standard API Route Structure
```typescript
// pages/api/diagrams/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken, errorHandler } from '@/middleware';
import { DiagramService } from '@/services';

const diagramService = new DiagramService();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    switch (req.method) {
      case 'GET':
        return await getDiagram(req, res, id as string);
      case 'PUT':
        return await updateDiagram(req, res, id as string);
      case 'DELETE':
        return await deleteDiagram(req, res, id as string);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ 
          success: false, 
          error: { message: 'Method not allowed' } 
        });
    }
  } catch (error) {
    return errorHandler(error, req, res);
  }
}

async function getDiagram(req: NextApiRequest, res: NextApiResponse, id: string) {
  const diagram = await diagramService.findById(id, req.user?.id);
  
  if (!diagram) {
    throw new NotFoundError('Diagram');
  }
  
  res.status(200).json({
    success: true,
    data: diagram
  });
}

async function updateDiagram(req: NextApiRequest, res: NextApiResponse, id: string) {
  const updateData = req.body;
  const diagram = await diagramService.update(id, updateData, req.user!.id);
  
  res.status(200).json({
    success: true,
    data: diagram
  });
}

async function deleteDiagram(req: NextApiRequest, res: NextApiResponse, id: string) {
  await diagramService.delete(id, req.user!.id);
  
  res.status(204).end();
}

export default authenticateToken(handler);
```

## Code Organization Structure

### 1. Project Structure
```
src/
├── components/          # React components
├── pages/              # Next.js pages and API routes
│   ├── api/           # API route handlers
│   ├── auth/          # Authentication pages
│   └── dashboard/     # Application pages
├── services/          # Business logic services
├── lib/               # Utility libraries
├── middleware/        # API middleware
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
├── hooks/             # Custom React hooks
├── context/           # React context providers
└── prisma/            # Database schema and migrations
```

### 2. Module Organization Principles
- **Single Responsibility**: Each module has a single, well-defined purpose
- **Dependency Injection**: Services receive dependencies through constructors
- **Interface Segregation**: Small, focused interfaces rather than large ones
- **Separation of Concerns**: Clear separation between API, business logic, and data layers

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review coding_lld_02.md for AI integration and MCP implementation
2. Implement performance optimization in coding_lld_03.md
3. Integrate with database design from db_lld_01-04.md

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/backend/api-reference.md`
- **Developer Documentation**: `/docs/documentation/backend/development-guide.md`
- **Database Documentation**: `/docs/documentation/database/integration.md`

**Integration Points:**
- **Frontend**: API consumption and error handling
- **Database**: ORM integration and data validation
- **AI Services**: MCP protocol implementation and provider management

This comprehensive backend architecture provides a solid foundation for scalable, maintainable, and secure API development while supporting DiagramAI's core functionality and future growth.
