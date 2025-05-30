import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { EventQueue, QueuedEvent } from '../utils/eventQueue.js';

export interface DiagramMessage {
  type: string;
  diagram_uuid?: string;
  operation?: string;
  data?: any;
  agent_id?: string;
  request_id?: string;
  timestamp?: string;
}

export interface DiagramResponse {
  type: string;
  diagram_uuid?: string;
  changes?: any[];
  updated_by?: 'user' | 'agent';
  timestamp?: string;
  error?: string;
  request_id?: string;
  success?: boolean;
  result?: any;
}

export class DiagramWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private agentId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();
  private eventQueue: EventQueue;

  constructor() {
    super();
    this.url = process.env.DIAGRAMAI_WS_URL || 'ws://localhost:3000/ws/diagrams';
    this.agentId = process.env.MCP_AGENT_ID || `mcp-agent-${Date.now()}`;

    // Initialize event queue
    this.eventQueue = new EventQueue({
      maxConcurrentEvents: 5,
      defaultMaxRetries: 3,
      retryDelayMs: 1000,
      deadLetterQueueSize: 50,
      processingTimeoutMs: 30000,
    });

    this.setupEventQueueProcessors();
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected()) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.url}?agent_id=${this.agentId}`;
        console.error(`🔌 Connecting to DiagramAI WebSocket: ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
          console.error('✅ WebSocket connection established');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startHeartbeat();
          resolve();
        });

        this.ws.on('message', (data) => {
          this.handleMessage(data);
        });

        this.ws.on('close', (code, reason) => {
          console.error(`🔌 WebSocket connection closed: ${code} ${reason}`);
          this.isConnecting = false;
          this.cleanup();
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        });

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    // Stop event queue first
    await this.stopEventQueue();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
    console.error('🔌 WebSocket disconnected');
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async sendMessage(message: DiagramMessage, useQueue: boolean = true): Promise<DiagramResponse> {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const requestId = message.request_id || this.generateRequestId();
    const messageWithId = {
      ...message,
      request_id: requestId,
      agent_id: this.agentId,
      timestamp: new Date().toISOString(),
    };

    if (useQueue) {
      // Use event queue for reliable delivery
      return new Promise((resolve, reject) => {
        const eventId = this.eventQueue.enqueue('websocket_message', {
          message: messageWithId,
          resolve,
          reject,
        }, {
          priority: this.getMessagePriority(message.type),
          diagramUuid: message.diagram_uuid,
          agentId: this.agentId,
        });

        console.log(`📤 Message queued for delivery: ${message.type} (Event ID: ${eventId})`);
      });
    } else {
      // Direct send (for immediate messages like ping/pong)
      return this.sendMessageDirect(messageWithId);
    }
  }

  private async sendMessageDirect(messageWithId: DiagramMessage): Promise<DiagramResponse> {
    return new Promise((resolve, reject) => {
      const requestId = messageWithId.request_id!;

      // Set up timeout for the request
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout: ${requestId}`));
      }, 30000); // 30 second timeout

      // Store the request
      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      // Send the message
      try {
        this.ws!.send(JSON.stringify(messageWithId));
      } catch (error) {
        this.pendingRequests.delete(requestId);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async subscribeToDiagram(diagramUuid: string): Promise<void> {
    await this.sendMessage({
      type: 'subscribe',
      diagram_uuid: diagramUuid,
    });
  }

  async unsubscribeFromDiagram(diagramUuid: string): Promise<void> {
    await this.sendMessage({
      type: 'unsubscribe',
      diagram_uuid: diagramUuid,
    });
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const message: DiagramResponse = JSON.parse(data.toString());
      
      // Handle response to pending request
      if (message.request_id && this.pendingRequests.has(message.request_id)) {
        const pending = this.pendingRequests.get(message.request_id)!;
        this.pendingRequests.delete(message.request_id);
        clearTimeout(pending.timeout);
        
        if (message.type === 'error' || message.error) {
          pending.reject(new Error(message.error || 'Unknown error'));
        } else {
          pending.resolve(message);
        }
        return;
      }

      // Handle broadcast messages
      this.emit('message', message);
      
      // Handle specific message types
      switch (message.type) {
        case 'diagram_updated':
          this.emit('diagramUpdated', message);
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          console.error('Unknown message type:', message.type);
      }

    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  private startHeartbeat(): void {
    setInterval(() => {
      if (this.isConnected()) {
        // Send ping directly (not through queue) for immediate heartbeat
        this.sendMessage({
          type: 'ping',
          agent_id: this.agentId,
          timestamp: new Date().toISOString(),
        }, false).catch(error => {
          console.error('❌ Heartbeat ping failed:', error);
        });
      }
    }, 30000); // Ping every 30 seconds
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.error(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('❌ Reconnection failed:', error);
      });
    }, delay);
  }

  private cleanup(): void {
    // Reject all pending requests
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('WebSocket connection lost'));
    }
    this.pendingRequests.clear();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventQueueProcessors(): void {
    // Register WebSocket message processor
    this.eventQueue.registerProcessor('websocket_message', async (event: QueuedEvent) => {
      const { message, resolve, reject } = event.data;

      try {
        const response = await this.sendMessageDirect(message);
        resolve(response);
      } catch (error) {
        reject(error);
        throw error; // Re-throw to trigger retry mechanism
      }
    });

    // Listen to event queue events
    this.eventQueue.on('eventProcessed', (event: QueuedEvent) => {
      console.log(`✅ Event queue processed: ${event.type} (ID: ${event.id})`);
    });

    this.eventQueue.on('eventRetry', (event: QueuedEvent, error: Error) => {
      console.log(`🔄 Event queue retry: ${event.type} (ID: ${event.id}) - ${error.message}`);
    });

    this.eventQueue.on('eventDeadLetter', (event: QueuedEvent, error: Error) => {
      console.error(`💀 Event moved to dead letter queue: ${event.type} (ID: ${event.id}) - ${error.message}`);

      // Reject the original promise if it exists
      if (event.data.reject) {
        event.data.reject(new Error(`Event failed after ${event.maxRetries} retries: ${error.message}`));
      }
    });
  }

  private getMessagePriority(messageType: string): number {
    // Higher priority for critical operations
    switch (messageType) {
      case 'ping':
      case 'pong':
        return 10; // Highest priority for heartbeat
      case 'subscribe':
      case 'unsubscribe':
        return 8; // High priority for subscription management
      case 'agent_operation':
        return 5; // Medium priority for operations
      default:
        return 1; // Low priority for other messages
    }
  }

  /**
   * Get event queue statistics
   */
  getQueueStats(): any {
    return this.eventQueue.getStats();
  }

  /**
   * Get dead letter queue events
   */
  getDeadLetterEvents(): QueuedEvent[] {
    return this.eventQueue.getDeadLetterEvents();
  }

  /**
   * Retry a dead letter event
   */
  retryDeadLetterEvent(eventId: string): boolean {
    return this.eventQueue.retryDeadLetterEvent(eventId);
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue(): void {
    this.eventQueue.clearDeadLetterQueue();
  }

  /**
   * Stop the event queue
   */
  async stopEventQueue(): Promise<void> {
    await this.eventQueue.stop();
  }
}
