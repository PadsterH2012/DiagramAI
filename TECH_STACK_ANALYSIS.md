# DiagramAI Tech Stack Analysis & Migration Guide

## Executive Summary

This document provides a comprehensive analysis of the current DiagramAI tech stack and recommendations for updates to ensure optimal performance, security, and maintainability. The analysis is based on the latest versions and best practices as of December 2024.

## Current vs Recommended Versions

### Frontend Dependencies

| Package | Current | Recommended | Priority | Breaking Changes |
|---------|---------|-------------|----------|------------------|
| React | ^18.2.0 | ^18.3.1 | Medium | None |
| React-DOM | ^18.2.0 | ^18.3.1 | Medium | None |
| React Flow | ^11.10.1 | @xyflow/react@^12.6.0 | **HIGH** | Package name change |
| Mermaid | ^10.6.1 | ^11.6.0 | **HIGH** | API changes |
| Fabric.js | ^5.3.0 | ^6.4.3 | Medium | Some API changes |
| Socket.io-client | ^4.7.4 | ^4.8.1 | Low | None |
| Axios | ^1.6.2 | ^1.7.9 | Low | None |

### Backend Dependencies

| Package | Current | Recommended | Priority | Breaking Changes |
|---------|---------|-------------|----------|------------------|
| Node.js | >=18.0.0 | >=20.0.0 | Medium | None (LTS upgrade) |
| @anthropic-ai/sdk | ^0.17.1 | ^0.32.1 | **HIGH** | API improvements |
| @google/generative-ai | ^0.1.3 | ^0.21.0 | **HIGH** | Gemini 2.0 support |
| @modelcontextprotocol/sdk | Not installed | ^1.12.0 | **HIGH** | New dependency |

## Critical Migration Steps

### 1. React Flow Migration (BREAKING CHANGE)

**Package Name Change:**
```bash
npm uninstall reactflow
npm install @xyflow/react@^12.6.0
```

**Import Changes Required:**
```javascript
// OLD (v11)
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background 
} from 'reactflow';

// NEW (v12)
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background 
} from '@xyflow/react';
```

**Key Benefits of v12:**
- Server-side rendering (SSR) support
- Better performance and memory usage
- Built-in dark mode support
- Enhanced TypeScript definitions
- Improved developer experience

### 2. Mermaid v11 Migration

**Major New Features:**
- Advanced layout algorithms (ELK integration)
- New diagram types (Kanban, Block diagrams)
- Enhanced customization options
- Better accessibility support

**Potential Breaking Changes:**
- Some theme variables renamed
- Configuration structure updates
- API method signatures changed

### 3. MCP Integration Setup

**New Official SDK:**
```bash
npm install @modelcontextprotocol/sdk@^1.12.0
```

**Key Features:**
- Official TypeScript support
- Latest protocol version (2025-03-26)
- Streamable HTTP transport
- Better error handling

## Migration Timeline & Priorities

### Phase 1: Critical Updates (Week 1)
1. **React Flow v12 Migration**
   - Update package.json
   - Update all import statements
   - Test existing flow functionality
   - Update any custom node/edge components

2. **MCP SDK Integration**
   - Install official SDK
   - Replace custom MCP implementation
   - Update AI integration layer

### Phase 2: AI SDK Updates (Week 2)
1. **Anthropic SDK v0.32.1**
   - Update Claude API calls
   - Test streaming functionality
   - Update error handling

2. **Google Generative AI v0.21.0**
   - Add Gemini 2.0 support
   - Update API calls
   - Test new features

### Phase 3: Minor Updates (Week 3)
1. **Mermaid v11**
   - Update configuration
   - Test diagram rendering
   - Leverage new features

2. **Other Dependencies**
   - Fabric.js v6
   - React v18.3.1
   - Minor package updates

## Code Changes Required

### React Flow Import Updates

**Files to Update:**
- All components using React Flow
- Flow editor components
- Node/Edge custom components

**Example Migration:**
```javascript
// Before
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  addEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';

// After  
import { 
  ReactFlow, 
  useNodesState, 
  useEdgesState, 
  addEdge 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
```

### MCP Integration Updates

**New MCP Server Setup:**
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'diagramai-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
```

## Testing Strategy

### 1. Unit Tests
- Update React Flow component tests
- Test MCP tool implementations
- Verify AI API integrations

### 2. Integration Tests
- End-to-end diagram creation flow
- Bidirectional conversion testing
- AI feedback loop validation

### 3. Performance Testing
- React Flow v12 performance gains
- Mermaid v11 rendering speed
- Memory usage optimization

## Risk Assessment

### High Risk
- **React Flow v12**: Major breaking changes in package name and imports
- **MCP SDK**: New implementation may require significant refactoring

### Medium Risk  
- **Mermaid v11**: Configuration and API changes
- **AI SDK Updates**: Potential API breaking changes

### Low Risk
- **React v18.3.1**: Minor version update
- **Other dependencies**: Mostly backward compatible

## Rollback Plan

1. **Git Branching Strategy**
   - Create feature branch for each major update
   - Test thoroughly before merging
   - Keep main branch stable

2. **Package Lock Strategy**
   - Backup current package-lock.json
   - Use exact versions for critical dependencies
   - Document all changes

3. **Environment Isolation**
   - Test in development environment first
   - Use Docker for consistent environments
   - Gradual production deployment

## Next Steps

1. **Immediate Actions:**
   - Review and approve this migration plan
   - Set up development branch for updates
   - Begin React Flow v12 migration

2. **Week 1 Goals:**
   - Complete React Flow migration
   - Integrate official MCP SDK
   - Update development environment

3. **Week 2-3 Goals:**
   - Complete AI SDK updates
   - Finish Mermaid v11 migration
   - Comprehensive testing

## Resources

- [React Flow v12 Migration Guide](https://reactflow.dev/learn/troubleshooting/migrate-to-v12)
- [Mermaid v11 Release Notes](https://docs.mermaidchart.com/blog/posts/mermaid-v11)
- [MCP TypeScript SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [Anthropic SDK v0.32 Changelog](https://github.com/anthropics/anthropic-sdk-typescript/releases)

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Next Review:** After Phase 1 completion
