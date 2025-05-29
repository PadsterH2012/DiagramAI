# Testing LLD 01: Test Strategy and Framework Setup

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Testing Strategy  
**Domain:** Testing Architecture  
**Coverage Area:** Test strategy, frameworks, coverage requirements, automation  
**Prerequisites:** project_hld.md, techstack.md, all domain LLD files  

## Purpose and Scope

This document defines the comprehensive testing strategy and framework setup for DiagramAI. It establishes testing methodologies, coverage requirements, automation strategies, and quality assurance processes that ensure reliable, secure, and high-quality application delivery.

**Coverage Areas in This Document:**
- Testing strategy and methodology
- Unit testing framework and setup
- Integration testing approach
- End-to-end testing automation
- Performance and security testing
- Quality assurance processes

**Related LLD Files:**
- testing_lld_02.md: Integration and E2E testing implementation
- testing_lld_03.md: Performance and security testing procedures
- All domain LLD files: Testing integration requirements

## Technology Foundation

### Testing Technology Stack
Based on validated research findings and modern testing best practices:

**Unit Testing:**
- **Jest 29.7+**: Primary testing framework with comprehensive features
- **React Testing Library 14+**: Component testing with user-centric approach
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

**Integration Testing:**
- **Supertest**: API endpoint testing
- **MSW (Mock Service Worker)**: API mocking for frontend tests
- **Test Containers**: Database testing with isolated containers

**End-to-End Testing:**
- **Playwright**: Cross-browser E2E testing automation
- **Chromatic**: Visual regression testing for components
- **Lighthouse CI**: Performance and accessibility testing

**Performance Testing:**
- **Artillery**: Load testing and performance benchmarking
- **Clinic.js**: Node.js performance profiling
- **Web Vitals**: Core web vitals monitoring

## Testing Strategy Overview

### 1. Testing Pyramid Implementation
```
┌─────────────────────────────────────────────────────────────┐
│                    DiagramAI Testing Pyramid               │
├─────────────────────────────────────────────────────────────┤
│  E2E Tests (10%)                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ User Journeys, Critical Paths, Browser Testing     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Integration Tests (20%)                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Testing, Database Integration, Service Layer   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Unit Tests (70%)                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Components, Functions, Services, Utilities         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Testing Coverage Requirements
```typescript
// Coverage Targets
const coverageTargets = {
  statements: 80,
  branches: 75,
  functions: 85,
  lines: 80,
  
  // Critical areas require higher coverage
  criticalAreas: {
    authentication: 95,
    dataValidation: 90,
    aiIntegration: 85,
    diagramConversion: 90
  }
};
```

### 3. Test Categories and Scope

#### Unit Testing Scope
- **React Components**: Component rendering, props handling, user interactions
- **Service Layer**: Business logic, data transformation, validation
- **Utility Functions**: Helper functions, formatters, validators
- **Hooks**: Custom React hooks and state management
- **API Routes**: Individual endpoint logic and error handling

#### Integration Testing Scope
- **API Integration**: Full request/response cycles with database
- **Database Operations**: CRUD operations, transactions, constraints
- **Service Integration**: Inter-service communication and data flow
- **Authentication Flow**: Login, logout, token management
- **File Operations**: Upload, download, format conversion

#### End-to-End Testing Scope
- **User Journeys**: Complete user workflows from start to finish
- **Cross-Browser**: Chrome, Firefox, Safari, Edge compatibility
- **Responsive Design**: Mobile, tablet, desktop layouts
- **Performance**: Page load times, interaction responsiveness
- **Accessibility**: Screen reader, keyboard navigation, WCAG compliance

## Unit Testing Framework Setup

### 1. Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
    },
    './src/services/': {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
    './src/utils/': {
      statements: 95,
      branches: 90,
      functions: 100,
      lines: 95,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### 2. Test Setup and Utilities
```typescript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './src/__mocks__/server';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

### 3. Component Testing Patterns
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');
  });
});
```

### 4. Service Layer Testing
```typescript
// __tests__/services/DiagramService.test.ts
import { DiagramService } from '@/services/DiagramService';
import { prismaMock } from '@/__mocks__/prisma';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

describe('DiagramService', () => {
  let diagramService: DiagramService;

  beforeEach(() => {
    diagramService = new DiagramService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a new diagram with valid data', async () => {
      const diagramData = {
        title: 'Test Diagram',
        content: { nodes: [], edges: [] },
        format: 'react_flow' as const,
        userId: 'user-123',
      };

      const mockDiagram = {
        id: 'diagram-123',
        ...diagramData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.diagram.create.mockResolvedValue(mockDiagram);

      const result = await diagramService.create(diagramData);

      expect(result).toEqual(mockDiagram);
      expect(prismaMock.diagram.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: diagramData.title,
          content: diagramData.content,
          format: diagramData.format,
          userId: diagramData.userId,
        }),
      });
    });

    it('throws validation error for invalid data', async () => {
      const invalidData = {
        title: '', // Invalid: empty title
        content: {},
        format: 'invalid' as any,
        userId: 'user-123',
      };

      await expect(diagramService.create(invalidData)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  describe('findById', () => {
    it('returns diagram when found and user has access', async () => {
      const mockDiagram = {
        id: 'diagram-123',
        title: 'Test Diagram',
        userId: 'user-123',
        isPublic: false,
      };

      prismaMock.diagram.findUnique.mockResolvedValue(mockDiagram);

      const result = await diagramService.findById('diagram-123', 'user-123');

      expect(result).toEqual(mockDiagram);
    });

    it('throws forbidden error when user lacks access', async () => {
      const mockDiagram = {
        id: 'diagram-123',
        title: 'Test Diagram',
        userId: 'user-123',
        isPublic: false,
      };

      prismaMock.diagram.findUnique.mockResolvedValue(mockDiagram);

      await expect(
        diagramService.findById('diagram-123', 'other-user')
      ).rejects.toThrow('Access denied');
    });
  });
});
```

## API Testing Strategy

### 1. API Route Testing
```typescript
// __tests__/api/diagrams/[id].test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/diagrams/[id]';
import { prismaMock } from '@/__mocks__/prisma';

describe('/api/diagrams/[id]', () => {
  it('GET returns diagram for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'diagram-123' },
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Mock authentication middleware
    req.user = { id: 'user-123', email: 'test@example.com' };

    const mockDiagram = {
      id: 'diagram-123',
      title: 'Test Diagram',
      userId: 'user-123',
    };

    prismaMock.diagram.findUnique.mockResolvedValue(mockDiagram);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: mockDiagram,
    });
  });

  it('PUT updates diagram with valid data', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: 'diagram-123' },
      body: {
        title: 'Updated Title',
        content: { nodes: [], edges: [] },
      },
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    req.user = { id: 'user-123', email: 'test@example.com' };

    const updatedDiagram = {
      id: 'diagram-123',
      title: 'Updated Title',
      userId: 'user-123',
    };

    prismaMock.diagram.update.mockResolvedValue(updatedDiagram);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: updatedDiagram,
    });
  });

  it('returns 401 for unauthenticated requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'diagram-123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: {
        message: 'Authentication required',
        code: 401,
      },
    });
  });
});
```

### 2. Database Integration Testing
```typescript
// __tests__/integration/database.test.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

describe('Database Integration', () => {
  beforeAll(async () => {
    // Reset test database
    execSync('npx prisma migrate reset --force --skip-seed', {
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up data between tests
    await prisma.diagramComment.deleteMany();
    await prisma.diagramVersion.deleteMany();
    await prisma.diagram.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  it('creates user with profile automatically', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed-password',
    };

    const user = await prisma.user.create({
      data: userData,
      include: { profile: true },
    });

    expect(user.profile).toBeDefined();
    expect(user.profile.timezone).toBe('UTC');
    expect(user.profile.languagePreference).toBe('en');
  });

  it('enforces unique email constraint', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser1',
      passwordHash: 'hashed-password',
    };

    await prisma.user.create({ data: userData });

    await expect(
      prisma.user.create({
        data: { ...userData, username: 'testuser2' },
      })
    ).rejects.toThrow();
  });

  it('cascades delete from user to diagrams', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed-password',
      },
    });

    await prisma.diagram.create({
      data: {
        title: 'Test Diagram',
        content: { nodes: [], edges: [] },
        format: 'react_flow',
        contentHash: 'hash123',
        userId: user.id,
      },
    });

    await prisma.user.delete({ where: { id: user.id } });

    const diagrams = await prisma.diagram.findMany({
      where: { userId: user.id },
    });

    expect(diagrams).toHaveLength(0);
  });
});
```

## Test Automation and CI Integration

### 1. GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage --watchAll=false
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test database
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 2. Test Scripts Configuration
```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "playwright test",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## Quality Assurance Processes

### 1. Code Quality Gates
```typescript
// Quality requirements for PR approval
const qualityGates = {
  testCoverage: {
    minimum: 80,
    critical: 90, // For critical paths
  },
  
  testTypes: {
    unit: 'Required for all new functions/components',
    integration: 'Required for API endpoints',
    e2e: 'Required for user-facing features',
  },
  
  performance: {
    buildTime: '< 2 minutes',
    testSuite: '< 5 minutes',
    e2eTests: '< 15 minutes',
  },
  
  accessibility: {
    wcag: 'AA compliance required',
    lighthouse: '> 90 accessibility score',
  },
};
```

### 2. Test Review Checklist
- [ ] All new code has corresponding tests
- [ ] Tests cover happy path and error scenarios
- [ ] Integration tests verify API contracts
- [ ] E2E tests cover critical user journeys
- [ ] Performance tests validate response times
- [ ] Accessibility tests ensure WCAG compliance
- [ ] Security tests validate input sanitization

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review testing_lld_02.md for integration and E2E implementation
2. Implement performance testing in testing_lld_03.md
3. Integrate with all domain LLD testing requirements

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/testing/testing-guide.md`
- **Developer Documentation**: `/docs/documentation/testing/test-procedures.md`
- **QA Documentation**: `/docs/documentation/testing/qa-processes.md`

**Integration Points:**
- **Frontend**: Component and user interaction testing
- **Backend**: API and service layer testing
- **Database**: Data integrity and performance testing
- **AI Services**: AI integration and response validation testing

This comprehensive testing strategy ensures high-quality, reliable, and maintainable code while supporting continuous integration and deployment processes for DiagramAI.
