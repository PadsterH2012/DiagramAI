# DiagramAI Testing Guide

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** User Documentation - Testing Guide  
**Audience:** Developers, QA Engineers, DevOps Engineers  
**Related LLD:** `/working_files/design/testing_lld/testing_lld_01.md`  

## Overview

This guide provides comprehensive information about testing procedures, quality assurance processes, and testing tools for the DiagramAI project. It covers everything from running tests locally to understanding test results and contributing to the test suite.

## Getting Started with Testing

### Prerequisites
- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Database setup for integration tests
- Environment variables configured

### Quick Start
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Test Types and When to Use Them

### Unit Tests
**Purpose**: Test individual components, functions, and services in isolation  
**When to Use**: For every new function, component, or service  
**Speed**: Fast (< 1 second per test)  
**Coverage**: 70% of total test suite  

**Examples**:
- React component rendering
- Utility function behavior
- Service method logic
- Hook functionality

```bash
# Run unit tests only
npm run test:unit

# Run unit tests for specific file
npm test -- Button.test.tsx

# Run unit tests with coverage
npm run test:unit -- --coverage
```

### Integration Tests
**Purpose**: Test how different parts of the system work together  
**When to Use**: For API endpoints, database operations, service interactions  
**Speed**: Medium (1-5 seconds per test)  
**Coverage**: 20% of total test suite  

**Examples**:
- API endpoint functionality
- Database operations
- Service-to-service communication
- Authentication flows

```bash
# Run integration tests only
npm run test:integration

# Run integration tests with database
npm run test:integration -- --setupFilesAfterEnv ./jest.integration.setup.js
```

### End-to-End (E2E) Tests
**Purpose**: Test complete user workflows from browser perspective  
**When to Use**: For critical user journeys and cross-browser compatibility  
**Speed**: Slow (10-30 seconds per test)  
**Coverage**: 10% of total test suite  

**Examples**:
- User registration and login
- Creating and editing diagrams
- Sharing and collaboration features
- Export functionality

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (visible browser)
npm run test:e2e -- --headed

# Run E2E tests for specific browser
npm run test:e2e -- --project=chromium
```

## Running Tests Locally

### Development Workflow
1. **Write Code**: Implement new feature or fix
2. **Write Tests**: Add corresponding tests
3. **Run Tests**: Verify tests pass locally
4. **Check Coverage**: Ensure coverage meets requirements
5. **Commit**: Push changes with passing tests

### Test Commands Reference
```bash
# Basic test commands
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report

# Specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only

# Test filtering
npm test -- --testNamePattern="Button"     # Run tests matching pattern
npm test -- --testPathPattern="components" # Run tests in specific path
npm test -- --watch                        # Watch mode for specific tests

# Coverage and reporting
npm run test:coverage      # Generate coverage report
npm run test:ci           # Run tests in CI mode (no watch)
```

### Environment Setup for Testing

#### Unit and Integration Tests
```bash
# Environment variables for testing
export NODE_ENV=test
export DATABASE_URL="postgresql://test:test@localhost:5432/diagramai_test"
export JWT_SECRET="test-secret-key"
export OPENAI_API_KEY="test-api-key"
```

#### E2E Tests
```bash
# Additional E2E environment variables
export PLAYWRIGHT_BROWSERS_PATH=./browsers
export BASE_URL="http://localhost:3000"
```

## Understanding Test Results

### Test Output Interpretation
```bash
# Successful test run
✓ Button renders correctly (15ms)
✓ Button handles click events (8ms)
✓ Button shows loading state (12ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.156s
```

### Coverage Reports
```bash
# Coverage summary
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|------------------
All files |   85.2  |   78.9   |   90.1  |   84.7  |
 Button   |   100   |   100    |   100   |   100   |
 Modal    |   75.5  |   66.7   |   80.0  |   74.2  | 45-52,67
```

### Common Test Failures

#### Unit Test Failures
```bash
# Component rendering failure
✗ Button renders correctly
  Expected element to be in the document
  
# Solution: Check component props and rendering logic
```

#### Integration Test Failures
```bash
# Database connection failure
✗ Creates user successfully
  Connection refused to database
  
# Solution: Ensure test database is running and accessible
```

#### E2E Test Failures
```bash
# Element not found
✗ User can create diagram
  Timeout waiting for element with selector 'button[data-testid="create-diagram"]'
  
# Solution: Check element selectors and page load timing
```

## Writing Tests

### Unit Test Best Practices

#### Component Testing
```typescript
// Good: Test user behavior, not implementation
test('shows error message when form is invalid', () => {
  render(<LoginForm />);
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});

// Avoid: Testing implementation details
test('calls setError when validation fails', () => {
  const setError = jest.fn();
  // Don't test internal function calls
});
```

#### Service Testing
```typescript
// Good: Test business logic and edge cases
test('creates diagram with valid data', async () => {
  const diagramData = {
    title: 'Test Diagram',
    content: { nodes: [], edges: [] },
    format: 'react_flow'
  };
  
  const result = await diagramService.create(diagramData);
  expect(result.id).toBeDefined();
  expect(result.title).toBe('Test Diagram');
});

test('throws error for invalid diagram format', async () => {
  const invalidData = { format: 'invalid' };
  await expect(diagramService.create(invalidData)).rejects.toThrow();
});
```

### Integration Test Best Practices

#### API Testing
```typescript
// Test complete request/response cycle
test('POST /api/diagrams creates new diagram', async () => {
  const response = await request(app)
    .post('/api/diagrams')
    .set('Authorization', `Bearer ${validToken}`)
    .send({
      title: 'Test Diagram',
      content: { nodes: [], edges: [] },
      format: 'react_flow'
    })
    .expect(201);
    
  expect(response.body.data.title).toBe('Test Diagram');
  
  // Verify database state
  const diagram = await prisma.diagram.findUnique({
    where: { id: response.body.data.id }
  });
  expect(diagram).toBeTruthy();
});
```

### E2E Test Best Practices

#### User Journey Testing
```typescript
// Test complete user workflows
test('user can create and edit diagram', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  
  // Create diagram
  await page.click('[data-testid="create-diagram"]');
  await page.fill('[data-testid="diagram-title"]', 'My Test Diagram');
  await page.click('[data-testid="save-diagram"]');
  
  // Verify creation
  await expect(page.locator('text=My Test Diagram')).toBeVisible();
});
```

## Test Data Management

### Test Fixtures
```typescript
// fixtures/users.ts
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123'
  },
  adminUser: {
    email: 'admin@example.com',
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  }
};

// fixtures/diagrams.ts
export const testDiagrams = {
  simpleDiagram: {
    title: 'Simple Flow',
    content: {
      nodes: [
        { id: '1', data: { label: 'Start' }, position: { x: 0, y: 0 } }
      ],
      edges: []
    },
    format: 'react_flow'
  }
};
```

### Database Seeding for Tests
```typescript
// test-utils/database.ts
export async function seedTestData() {
  const user = await prisma.user.create({
    data: testUsers.validUser
  });
  
  const diagram = await prisma.diagram.create({
    data: {
      ...testDiagrams.simpleDiagram,
      userId: user.id
    }
  });
  
  return { user, diagram };
}

export async function cleanupTestData() {
  await prisma.diagram.deleteMany();
  await prisma.user.deleteMany();
}
```

## Debugging Tests

### Common Debugging Techniques

#### Debug Unit Tests
```bash
# Run single test with debug output
npm test -- --testNamePattern="Button" --verbose

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand --testNamePattern="Button"
```

#### Debug Integration Tests
```bash
# Run with database logging
DEBUG=prisma:query npm run test:integration

# Run single integration test
npm run test:integration -- --testNamePattern="creates user"
```

#### Debug E2E Tests
```bash
# Run in headed mode (visible browser)
npm run test:e2e -- --headed

# Run with debug mode
npm run test:e2e -- --debug

# Generate trace for failed tests
npm run test:e2e -- --trace on
```

### Test Debugging Tools

#### Jest Debugging
- Use `console.log()` for simple debugging
- Use `debugger` statements with Node.js inspector
- Use Jest's `--verbose` flag for detailed output
- Use `--runInBand` to run tests serially

#### Playwright Debugging
- Use `page.pause()` to pause execution
- Use `--headed` to see browser actions
- Use `--debug` for step-by-step execution
- Use trace viewer for post-mortem debugging

## Continuous Integration

### GitHub Actions Integration
Tests run automatically on:
- Pull request creation and updates
- Pushes to main and development branches
- Scheduled nightly runs

### Test Results and Reporting
- **Coverage Reports**: Uploaded to Codecov
- **Test Results**: Available in GitHub Actions logs
- **E2E Results**: Screenshots and videos for failed tests
- **Performance Reports**: Lighthouse scores and metrics

### Quality Gates
Before code can be merged:
- [ ] All tests must pass
- [ ] Coverage must meet minimum thresholds (80% overall)
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks must pass

## Troubleshooting

### Common Issues and Solutions

#### Test Database Issues
**Problem**: Tests fail with database connection errors  
**Solution**:
1. Ensure test database is running
2. Check DATABASE_URL environment variable
3. Run database migrations: `npx prisma migrate deploy`
4. Reset test database: `npx prisma migrate reset --force`

#### Flaky E2E Tests
**Problem**: E2E tests pass sometimes, fail other times  
**Solution**:
1. Add explicit waits: `await page.waitForSelector()`
2. Increase timeouts for slow operations
3. Use `page.waitForLoadState('networkidle')`
4. Avoid hard-coded delays, use dynamic waits

#### Memory Issues
**Problem**: Tests run out of memory or run slowly  
**Solution**:
1. Use `--runInBand` for serial execution
2. Increase Node.js memory: `--max-old-space-size=4096`
3. Clean up test data between tests
4. Use `--detectOpenHandles` to find memory leaks

### Getting Help
- **Documentation**: Check this guide and LLD documents
- **Team Chat**: Ask in #testing channel
- **Code Review**: Request testing-focused review
- **Pair Programming**: Work with experienced team members

## Contributing to Tests

### Test Contribution Guidelines
1. **Write tests for new features**: Every new feature needs tests
2. **Update tests for changes**: Modify tests when changing existing code
3. **Follow naming conventions**: Use descriptive test names
4. **Keep tests focused**: One concept per test
5. **Use appropriate test type**: Unit for logic, integration for APIs, E2E for workflows

### Code Review Checklist
- [ ] Tests cover happy path and error scenarios
- [ ] Test names clearly describe what is being tested
- [ ] Tests are independent and can run in any order
- [ ] Appropriate test type is used (unit/integration/E2E)
- [ ] Test data is properly cleaned up
- [ ] Tests follow project conventions and patterns

This comprehensive testing guide provides all the information needed to effectively test DiagramAI, from running basic tests to contributing new test coverage and debugging complex issues.
