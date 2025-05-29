# Backend LLD 02: AI Integration and Model Context Protocol Implementation

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Backend AI Integration  
**Domain:** Backend/Code Architecture  
**Coverage Area:** AI integration, MCP implementation, format conversion services  
**Prerequisites:** coding_lld_01.md, project_hld.md, techstack.md  

## Purpose and Scope

This document defines the comprehensive AI integration architecture and Model Context Protocol (MCP) implementation for DiagramAI. It establishes AI service integration patterns, format conversion services, and intelligent diagram analysis capabilities that power the application's core AI-driven functionality.

**Coverage Areas in This Document:**
- Model Context Protocol (MCP) implementation
- Multi-provider AI integration architecture
- Diagram format conversion services
- AI-powered diagram analysis and generation
- Error handling and fallback mechanisms

**Related LLD Files:**
- coding_lld_01.md: API architecture and code organization
- coding_lld_03.md: Performance optimization and caching
- db_lld_02.md: Diagram data models and content storage

## Technology Foundation

### AI Integration Technology Stack
Based on validated research findings and MCP standards:

**AI Providers:**
- **OpenAI GPT-4+**: Primary AI provider for diagram generation and analysis
- **Anthropic Claude 3+**: Secondary provider for redundancy and specialized tasks
- **Azure OpenAI**: Enterprise deployment option with data residency

**Integration Framework:**
- **Model Context Protocol (MCP)**: Standardized AI service communication
- **Provider SDKs**: Official SDKs for each AI provider
- **Fallback System**: Automatic provider switching for reliability

**Format Support:**
- **React Flow JSON**: Interactive visual diagram format
- **Mermaid Syntax**: Text-based diagram format
- **Bidirectional Conversion**: Seamless format transformation

## Model Context Protocol Implementation

### 1. MCP Architecture Overview
```typescript
// MCP Service Architecture
interface MCPService {
  providers: AIProvider[];
  router: ProviderRouter;
  converter: FormatConverter;
  analyzer: DiagramAnalyzer;
  cache: ResponseCache;
}

// MCP Provider Interface
interface AIProvider {
  id: string;
  name: string;
  capabilities: ProviderCapabilities;
  client: ProviderClient;
  config: ProviderConfig;
}

interface ProviderCapabilities {
  diagramGeneration: boolean;
  diagramAnalysis: boolean;
  formatConversion: boolean;
  textProcessing: boolean;
  maxTokens: number;
  supportedFormats: DiagramFormat[];
}
```

### 2. MCP Service Implementation
```typescript
// services/MCPService.ts
export class MCPService {
  private providers: Map<string, AIProvider> = new Map();
  private router: ProviderRouter;
  private cache: ResponseCache;

  constructor() {
    this.initializeProviders();
    this.router = new ProviderRouter(this.providers);
    this.cache = new ResponseCache();
  }

  private initializeProviders(): void {
    // OpenAI Provider
    this.providers.set('openai', {
      id: 'openai',
      name: 'OpenAI GPT-4',
      capabilities: {
        diagramGeneration: true,
        diagramAnalysis: true,
        formatConversion: true,
        textProcessing: true,
        maxTokens: 128000,
        supportedFormats: ['react_flow', 'mermaid']
      },
      client: new OpenAIClient({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID
      }),
      config: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 4000
      }
    });

    // Anthropic Provider
    this.providers.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic Claude 3',
      capabilities: {
        diagramGeneration: true,
        diagramAnalysis: true,
        formatConversion: true,
        textProcessing: true,
        maxTokens: 200000,
        supportedFormats: ['react_flow', 'mermaid']
      },
      client: new AnthropicClient({
        apiKey: process.env.ANTHROPIC_API_KEY
      }),
      config: {
        model: 'claude-3-sonnet-20240229',
        temperature: 0.7,
        maxTokens: 4000
      }
    });

    // Azure OpenAI Provider
    if (process.env.AZURE_OPENAI_KEY) {
      this.providers.set('azure', {
        id: 'azure',
        name: 'Azure OpenAI',
        capabilities: {
          diagramGeneration: true,
          diagramAnalysis: true,
          formatConversion: true,
          textProcessing: true,
          maxTokens: 128000,
          supportedFormats: ['react_flow', 'mermaid']
        },
        client: new AzureOpenAIClient({
          apiKey: process.env.AZURE_OPENAI_KEY,
          endpoint: process.env.AZURE_OPENAI_ENDPOINT,
          apiVersion: '2024-02-15-preview'
        }),
        config: {
          model: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 4000
        }
      });
    }
  }

  async generateDiagram(request: GenerateDiagramRequest): Promise<GenerateDiagramResponse> {
    const cacheKey = this.generateCacheKey('generate', request);
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Select optimal provider
    const provider = await this.router.selectProvider('diagramGeneration', request);
    
    try {
      const response = await this.executeGeneration(provider, request);
      
      // Cache successful response
      await this.cache.set(cacheKey, response, 3600); // 1 hour cache
      
      return response;
    } catch (error) {
      // Try fallback provider
      const fallbackProvider = await this.router.selectFallbackProvider(provider.id, 'diagramGeneration');
      if (fallbackProvider) {
        return await this.executeGeneration(fallbackProvider, request);
      }
      throw error;
    }
  }

  private async executeGeneration(
    provider: AIProvider, 
    request: GenerateDiagramRequest
  ): Promise<GenerateDiagramResponse> {
    const startTime = Date.now();
    
    const prompt = this.buildGenerationPrompt(request);
    const response = await provider.client.complete({
      model: provider.config.model,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(request.format)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: provider.config.temperature,
      max_tokens: provider.config.maxTokens
    });

    const diagram = this.parseDiagramResponse(response.content, request.format);
    
    return {
      success: true,
      diagram,
      metadata: {
        provider: provider.id,
        model: provider.config.model,
        processingTime: Date.now() - startTime,
        tokensUsed: response.usage?.total_tokens || 0
      }
    };
  }
}
```

### 3. Provider Router Implementation
```typescript
// services/ProviderRouter.ts
export class ProviderRouter {
  constructor(private providers: Map<string, AIProvider>) {}

  async selectProvider(
    capability: keyof ProviderCapabilities,
    request: any
  ): Promise<AIProvider> {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.capabilities[capability])
      .filter(provider => this.isProviderHealthy(provider.id));

    if (availableProviders.length === 0) {
      throw new Error(`No available providers for capability: ${capability}`);
    }

    // Provider selection logic
    return this.selectOptimalProvider(availableProviders, request);
  }

  private selectOptimalProvider(
    providers: AIProvider[],
    request: any
  ): AIProvider {
    // Selection criteria:
    // 1. Provider health and availability
    // 2. Request complexity and provider capabilities
    // 3. Cost optimization
    // 4. Load balancing

    const scores = providers.map(provider => ({
      provider,
      score: this.calculateProviderScore(provider, request)
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores[0].provider;
  }

  private calculateProviderScore(provider: AIProvider, request: any): number {
    let score = 100;

    // Health check
    if (!this.isProviderHealthy(provider.id)) {
      score -= 50;
    }

    // Capability match
    if (request.format && provider.capabilities.supportedFormats.includes(request.format)) {
      score += 20;
    }

    // Token capacity
    const estimatedTokens = this.estimateTokenUsage(request);
    if (estimatedTokens > provider.capabilities.maxTokens) {
      score -= 30;
    }

    // Load balancing (prefer less used providers)
    const currentLoad = this.getProviderLoad(provider.id);
    score -= currentLoad * 10;

    return score;
  }

  async selectFallbackProvider(
    excludeProviderId: string,
    capability: keyof ProviderCapabilities
  ): Promise<AIProvider | null> {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.id !== excludeProviderId)
      .filter(provider => provider.capabilities[capability])
      .filter(provider => this.isProviderHealthy(provider.id));

    return availableProviders.length > 0 ? availableProviders[0] : null;
  }

  private isProviderHealthy(providerId: string): boolean {
    // Implement health check logic
    // Check recent error rates, response times, etc.
    return true; // Simplified for now
  }

  private getProviderLoad(providerId: string): number {
    // Implement load tracking
    return 0; // Simplified for now
  }

  private estimateTokenUsage(request: any): number {
    // Estimate token usage based on request complexity
    const baseTokens = 1000;
    const descriptionTokens = (request.description?.length || 0) * 0.75;
    return baseTokens + descriptionTokens;
  }
}
```

## Diagram Format Conversion Services

### 1. Format Converter Implementation
```typescript
// services/FormatConverter.ts
export class FormatConverter {
  private mcpService: MCPService;

  constructor(mcpService: MCPService) {
    this.mcpService = mcpService;
  }

  async convertFormat(
    content: DiagramContent,
    fromFormat: DiagramFormat,
    toFormat: DiagramFormat
  ): Promise<ConversionResult> {
    if (fromFormat === toFormat) {
      return {
        success: true,
        content,
        metadata: {
          fromFormat,
          toFormat,
          processingTime: 0
        }
      };
    }

    const startTime = Date.now();

    try {
      let result: DiagramContent;

      if (fromFormat === 'react_flow' && toFormat === 'mermaid') {
        result = await this.reactFlowToMermaid(content);
      } else if (fromFormat === 'mermaid' && toFormat === 'react_flow') {
        result = await this.mermaidToReactFlow(content);
      } else {
        throw new Error(`Unsupported conversion: ${fromFormat} to ${toFormat}`);
      }

      return {
        success: true,
        content: result,
        metadata: {
          fromFormat,
          toFormat,
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          fromFormat,
          toFormat,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  private async reactFlowToMermaid(content: ReactFlowContent): Promise<MermaidContent> {
    const { nodes, edges } = content;
    
    // Determine diagram type based on structure
    const diagramType = this.detectMermaidType(nodes, edges);
    
    // Generate Mermaid syntax
    let syntax = `${diagramType}\n`;
    
    // Add nodes
    for (const node of nodes) {
      const nodeId = this.sanitizeId(node.id);
      const label = node.data?.label || node.id;
      syntax += `    ${nodeId}[${label}]\n`;
    }
    
    // Add edges
    for (const edge of edges) {
      const sourceId = this.sanitizeId(edge.source);
      const targetId = this.sanitizeId(edge.target);
      const label = edge.label ? `|${edge.label}|` : '';
      syntax += `    ${sourceId} --> ${label} ${targetId}\n`;
    }

    return {
      syntax: syntax.trim(),
      type: diagramType,
      config: {},
      metadata: {
        version: '1.0',
        created: new Date().toISOString(),
        author: 'DiagramAI Converter'
      }
    };
  }

  private async mermaidToReactFlow(content: MermaidContent): Promise<ReactFlowContent> {
    // Use AI to parse Mermaid syntax and convert to React Flow
    const conversionRequest = {
      description: `Convert this Mermaid diagram to React Flow format: ${content.syntax}`,
      format: 'react_flow' as const,
      sourceFormat: 'mermaid' as const,
      sourceSyntax: content.syntax
    };

    const response = await this.mcpService.convertDiagram(conversionRequest);
    
    if (!response.success) {
      throw new Error(`Conversion failed: ${response.error}`);
    }

    return response.diagram as ReactFlowContent;
  }

  private detectMermaidType(nodes: any[], edges: any[]): string {
    // Simple heuristics to detect diagram type
    if (edges.length === 0) {
      return 'graph TD';
    }
    
    // Check for sequential flow patterns
    const hasSequentialFlow = this.hasSequentialPattern(nodes, edges);
    if (hasSequentialFlow) {
      return 'sequenceDiagram';
    }
    
    // Default to flowchart
    return 'graph TD';
  }

  private hasSequentialPattern(nodes: any[], edges: any[]): boolean {
    // Implement logic to detect sequential patterns
    return false; // Simplified for now
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }
}
```

### 2. AI-Powered Diagram Analysis
```typescript
// services/DiagramAnalyzer.ts
export class DiagramAnalyzer {
  private mcpService: MCPService;

  constructor(mcpService: MCPService) {
    this.mcpService = mcpService;
  }

  async analyzeDiagram(request: AnalyzeDiagramRequest): Promise<AnalyzeDiagramResponse> {
    const diagram = await this.getDiagramContent(request.diagramId);
    
    const analysisPrompt = this.buildAnalysisPrompt(diagram, request.analysisType);
    
    const provider = await this.mcpService.selectProvider('diagramAnalysis', request);
    
    const response = await provider.client.complete({
      model: provider.config.model,
      messages: [
        {
          role: 'system',
          content: this.getAnalysisSystemPrompt(request.analysisType)
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for analysis
      max_tokens: 2000
    });

    const analysis = this.parseAnalysisResponse(response.content, request.analysisType);
    
    return {
      success: true,
      analysis,
      metadata: {
        provider: provider.id,
        processingTime: Date.now() - Date.now() // Simplified
      }
    };
  }

  private buildAnalysisPrompt(diagram: DiagramContent, analysisType: string): string {
    const diagramJson = JSON.stringify(diagram, null, 2);
    
    switch (analysisType) {
      case 'logic':
        return `Analyze the logical flow and structure of this diagram:\n\n${diagramJson}\n\nProvide insights on logical consistency, flow patterns, and potential improvements.`;
      
      case 'structure':
        return `Analyze the structural organization of this diagram:\n\n${diagramJson}\n\nEvaluate hierarchy, grouping, layout efficiency, and structural clarity.`;
      
      case 'optimization':
        return `Suggest optimizations for this diagram:\n\n${diagramJson}\n\nFocus on simplification, clarity improvements, and better visual organization.`;
      
      case 'suggestions':
        return `Provide general suggestions to improve this diagram:\n\n${diagramJson}\n\nInclude recommendations for content, structure, and visual presentation.`;
      
      default:
        return `Analyze this diagram:\n\n${diagramJson}\n\nProvide comprehensive insights and recommendations.`;
    }
  }

  private getAnalysisSystemPrompt(analysisType: string): string {
    return `You are an expert diagram analyst. Analyze the provided diagram and return your findings in JSON format with the following structure:
    {
      "type": "${analysisType}",
      "findings": [
        {
          "category": "string",
          "severity": "low|medium|high",
          "description": "string",
          "location": "string (optional)"
        }
      ],
      "suggestions": [
        {
          "type": "improvement|optimization|fix",
          "priority": "low|medium|high",
          "description": "string",
          "implementation": "string"
        }
      ],
      "score": "number (0-100)"
    }`;
  }

  private parseAnalysisResponse(content: string, analysisType: string): DiagramAnalysis {
    try {
      const parsed = JSON.parse(content);
      return {
        type: analysisType,
        findings: parsed.findings || [],
        suggestions: parsed.suggestions || [],
        score: parsed.score || 0
      };
    } catch (error) {
      // Fallback parsing if JSON is malformed
      return {
        type: analysisType,
        findings: [{
          category: 'parsing',
          severity: 'medium',
          description: 'Analysis response could not be parsed properly'
        }],
        suggestions: [],
        score: 50
      };
    }
  }

  private async getDiagramContent(diagramId: string): Promise<DiagramContent> {
    // Fetch diagram from database
    const diagram = await prisma.diagram.findUnique({
      where: { id: diagramId }
    });
    
    if (!diagram) {
      throw new NotFoundError('Diagram');
    }
    
    return diagram.content as DiagramContent;
  }
}
```

## Error Handling and Resilience

### 1. Provider Health Monitoring
```typescript
// services/ProviderHealthMonitor.ts
export class ProviderHealthMonitor {
  private healthStatus: Map<string, ProviderHealth> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(private providers: Map<string, AIProvider>) {
    this.initializeHealthMonitoring();
  }

  private initializeHealthMonitoring(): void {
    for (const [providerId, provider] of this.providers) {
      this.healthStatus.set(providerId, {
        isHealthy: true,
        lastCheck: new Date(),
        errorRate: 0,
        averageResponseTime: 0,
        consecutiveFailures: 0
      });

      this.circuitBreakers.set(providerId, new CircuitBreaker({
        failureThreshold: 5,
        recoveryTimeout: 60000, // 1 minute
        monitoringPeriod: 300000 // 5 minutes
      }));
    }

    // Start health check interval
    setInterval(() => this.performHealthChecks(), 30000); // Every 30 seconds
  }

  async performHealthChecks(): Promise<void> {
    for (const [providerId, provider] of this.providers) {
      try {
        const startTime = Date.now();
        await this.checkProviderHealth(provider);
        const responseTime = Date.now() - startTime;
        
        this.updateHealthStatus(providerId, true, responseTime);
      } catch (error) {
        this.updateHealthStatus(providerId, false, 0, error);
      }
    }
  }

  private async checkProviderHealth(provider: AIProvider): Promise<void> {
    // Simple health check - attempt a minimal API call
    const healthCheckPrompt = "Respond with 'OK' if you are functioning properly.";
    
    await provider.client.complete({
      model: provider.config.model,
      messages: [{ role: 'user', content: healthCheckPrompt }],
      max_tokens: 10,
      temperature: 0
    });
  }

  private updateHealthStatus(
    providerId: string,
    isHealthy: boolean,
    responseTime: number,
    error?: Error
  ): void {
    const status = this.healthStatus.get(providerId)!;
    
    status.lastCheck = new Date();
    status.isHealthy = isHealthy;
    
    if (isHealthy) {
      status.consecutiveFailures = 0;
      status.averageResponseTime = (status.averageResponseTime + responseTime) / 2;
    } else {
      status.consecutiveFailures++;
      console.error(`Provider ${providerId} health check failed:`, error);
    }
    
    // Update circuit breaker
    const circuitBreaker = this.circuitBreakers.get(providerId)!;
    if (isHealthy) {
      circuitBreaker.recordSuccess();
    } else {
      circuitBreaker.recordFailure();
    }
  }

  isProviderHealthy(providerId: string): boolean {
    const status = this.healthStatus.get(providerId);
    const circuitBreaker = this.circuitBreakers.get(providerId);
    
    return status?.isHealthy && circuitBreaker?.isOpen() === false;
  }

  getHealthStatus(): Map<string, ProviderHealth> {
    return new Map(this.healthStatus);
  }
}
```

### 2. Response Caching
```typescript
// services/ResponseCache.ts
export class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxSize = 1000;
  private readonly defaultTTL = 3600; // 1 hour

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000),
      lastAccessed: Date.now()
    });
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  generateCacheKey(operation: string, request: any): string {
    const requestHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(request))
      .digest('hex');
    
    return `${operation}:${requestHash}`;
  }
}
```

## API Integration

### 1. AI Service API Routes
```typescript
// pages/api/ai/generate.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description, format, diagramType, style } = req.body;
    
    const mcpService = new MCPService();
    const response = await mcpService.generateDiagram({
      description,
      format,
      diagramType,
      style
    });
    
    res.status(200).json(response);
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate diagram'
    });
  }
}

// pages/api/ai/convert.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, fromFormat, toFormat } = req.body;
    
    const converter = new FormatConverter(new MCPService());
    const response = await converter.convertFormat(content, fromFormat, toFormat);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Format conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to convert diagram format'
    });
  }
}
```

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review coding_lld_03.md for performance optimization and caching
2. Implement comprehensive error handling and monitoring
3. Integrate with frontend components for AI-powered features

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/backend/ai-integration.md`
- **API Documentation**: `/docs/documentation/backend/ai-api-reference.md`
- **Developer Documentation**: `/docs/documentation/backend/mcp-implementation.md`

**Integration Points:**
- **Frontend**: AI-powered diagram generation and analysis UI
- **Database**: AI analysis results and conversion history storage
- **Monitoring**: AI service performance and usage tracking
- **Security**: API key management and rate limiting

This comprehensive AI integration design provides robust, scalable, and intelligent diagram processing capabilities while maintaining reliability through multi-provider support and comprehensive error handling.
