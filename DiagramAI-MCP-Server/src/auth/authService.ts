import { createHash } from 'crypto';

export interface AgentCredentials {
  id: string;
  agentId: string;
  apiKeyHash: string;
  name: string;
  description?: string;
  permissions: any;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContext {
  agentId: string;
  permissions: any;
  isAuthenticated: boolean;
}

export class AuthService {
  private ready = false;
  private currentAuth: AuthContext | null = null;

  async initialize(): Promise<void> {
    console.error('🔐 Initializing authentication service...');
    
    try {
      // For now, we'll use a simple API key-based authentication
      // In production, this would connect to the database and validate credentials
      
      const apiKey = process.env.MCP_API_KEY;
      if (!apiKey) {
        console.error('⚠️  No MCP_API_KEY provided, running in development mode');
        // Create a default development authentication context
        this.currentAuth = {
          agentId: process.env.MCP_AGENT_ID || 'dev-agent',
          permissions: {
            canCreateDiagrams: true,
            canEditDiagrams: true,
            canDeleteDiagrams: true,
            canReadDiagrams: true,
          },
          isAuthenticated: true,
        };
      } else {
        // Validate the API key (this would normally be against the database)
        const agentId = await this.validateApiKey(apiKey);
        if (!agentId) {
          throw new Error('Invalid API key');
        }
        
        this.currentAuth = {
          agentId,
          permissions: await this.getAgentPermissions(agentId),
          isAuthenticated: true,
        };
      }

      this.ready = true;
      console.error(`✅ Authentication successful for agent: ${this.currentAuth.agentId}`);
      
    } catch (error) {
      console.error('❌ Authentication initialization failed:', error);
      throw error;
    }
  }

  async validateApiKey(apiKey: string): Promise<string | null> {
    try {
      // Hash the provided API key
      const hashedKey = this.hashApiKey(apiKey);
      
      // In a real implementation, this would query the database:
      // SELECT agent_id FROM agent_credentials 
      // WHERE api_key_hash = $1 AND is_active = true
      
      // For development, accept any key that starts with 'mcp-'
      if (apiKey.startsWith('mcp-')) {
        const agentId = apiKey.replace('mcp-', '') || 'default-agent';
        await this.updateLastUsed(agentId);
        return agentId;
      }
      
      return null;
    } catch (error) {
      console.error('❌ API key validation error:', error);
      return null;
    }
  }

  async getAgentPermissions(agentId: string): Promise<any> {
    // In a real implementation, this would query the database:
    // SELECT permissions FROM agent_credentials WHERE agent_id = $1
    
    // For development, return full permissions
    return {
      canCreateDiagrams: true,
      canEditDiagrams: true,
      canDeleteDiagrams: true,
      canReadDiagrams: true,
      canListDiagrams: true,
      maxDiagramsPerHour: 100,
      maxOperationsPerMinute: 60,
    };
  }

  async updateLastUsed(agentId: string): Promise<void> {
    // In a real implementation, this would update the database:
    // UPDATE agent_credentials SET last_used_at = NOW() WHERE agent_id = $1
    console.error(`📊 Updated last used timestamp for agent: ${agentId}`);
  }

  async logOperation(operation: string, diagramUuid: string, data: any, result: any, success: boolean, duration?: number): Promise<void> {
    if (!this.currentAuth) {
      return;
    }

    // In a real implementation, this would insert into the database:
    // INSERT INTO agent_operations (agent_id, diagram_uuid, operation, operation_data, result, success, duration, timestamp)
    // VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    
    console.error(`📝 Logged operation: ${operation} on ${diagramUuid} by ${this.currentAuth.agentId} - ${success ? 'SUCCESS' : 'FAILED'}`);
  }

  checkPermission(permission: string): boolean {
    if (!this.currentAuth || !this.currentAuth.isAuthenticated) {
      return false;
    }

    return this.currentAuth.permissions[permission] === true;
  }

  getCurrentAuth(): AuthContext | null {
    return this.currentAuth;
  }

  isAuthenticated(): boolean {
    return this.currentAuth?.isAuthenticated === true;
  }

  getAgentId(): string | null {
    return this.currentAuth?.agentId || null;
  }

  isReady(): boolean {
    return this.ready;
  }

  async close(): Promise<void> {
    this.ready = false;
    this.currentAuth = null;
    console.error('🔐 Authentication service closed');
  }

  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  // Rate limiting helpers
  private operationCounts = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(operation: string): boolean {
    if (!this.currentAuth) {
      return false;
    }

    const key = `${this.currentAuth.agentId}:${operation}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    
    const current = this.operationCounts.get(key);
    if (!current || now > current.resetTime) {
      this.operationCounts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    const maxOps = this.currentAuth.permissions.maxOperationsPerMinute || 60;
    if (current.count >= maxOps) {
      return false;
    }

    current.count++;
    return true;
  }
}
