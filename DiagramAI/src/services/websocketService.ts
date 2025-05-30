import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import { parse } from 'url'
import { AgentOperationService, AgentOperationRequest } from './agentOperationService'

export interface AgentMessage {
  type: 'agent_operation' | 'subscribe' | 'unsubscribe' | 'ping'
  diagram_uuid?: string
  operation?: 'create_diagram' | 'add_node' | 'update_node' | 'delete_node' | 'add_edge' | 'delete_edge'
  data?: any
  agent_id: string
  request_id?: string
}

export interface DiagramUpdate {
  type: 'diagram_updated' | 'pong' | 'error'
  diagram_uuid?: string
  changes?: any[]
  updated_by?: 'user' | 'agent'
  timestamp?: string
  error?: string
  request_id?: string
}

export interface Connection {
  ws: WebSocket
  id: string
  type: 'agent' | 'user'
  agent_id?: string
  user_id?: string
  subscriptions: Set<string>
  lastPing: Date
}

export class DiagramWebSocketService {
  private wss: WebSocketServer
  private connections: Map<string, Connection> = new Map()
  private diagramSubscriptions: Map<string, Set<string>> = new Map()
  private pingInterval: NodeJS.Timeout | undefined
  private agentOperationService: AgentOperationService

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws/diagrams',
      verifyClient: this.verifyClient.bind(this)
    })

    this.agentOperationService = new AgentOperationService()
    this.setupEventHandlers()
    this.startPingInterval()
  }

  private verifyClient(info: any): boolean {
    // Basic verification - in production, add proper authentication
    const url = parse(info.req.url, true)
    return url.pathname === '/ws/diagrams'
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      this.handleConnection(ws, req)
    })

    this.wss.on('error', (error) => {
      console.error('WebSocket Server Error:', error)
    })
  }

  private handleConnection(ws: WebSocket, req: any): void {
    const url = parse(req.url, true)
    const agentId = url.query.agent_id as string
    const userId = url.query.user_id as string
    const connectionId = this.generateConnectionId()

    const connection: Connection = {
      ws,
      id: connectionId,
      type: agentId ? 'agent' : 'user',
      agent_id: agentId,
      user_id: userId,
      subscriptions: new Set(),
      lastPing: new Date()
    }

    this.connections.set(connectionId, connection)

    console.log(`WebSocket connection established: ${connection.type} ${agentId || userId}`)

    ws.on('message', (data) => {
      this.handleMessage(connectionId, data)
    })

    ws.on('close', () => {
      this.handleDisconnection(connectionId)
    })

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error)
      this.handleDisconnection(connectionId)
    })

    // Send welcome message
    this.sendMessage(connectionId, {
      type: 'pong',
      timestamp: new Date().toISOString()
    })
  }

  private handleMessage(connectionId: string, data: any): void {
    try {
      const message: AgentMessage = JSON.parse(data.toString())
      const connection = this.connections.get(connectionId)

      if (!connection) {
        console.error('Message from unknown connection:', connectionId)
        return
      }

      switch (message.type) {
        case 'ping':
          connection.lastPing = new Date()
          this.sendMessage(connectionId, { type: 'pong', request_id: message.request_id })
          break

        case 'subscribe':
          if (message.diagram_uuid) {
            this.subscribeToDiagram(connectionId, message.diagram_uuid)
          }
          break

        case 'unsubscribe':
          if (message.diagram_uuid) {
            this.unsubscribeFromDiagram(connectionId, message.diagram_uuid)
          }
          break

        case 'agent_operation':
          this.handleAgentOperation(connectionId, message).catch(error => {
            console.error('Error handling agent operation:', error)
          })
          break

        default:
          console.warn('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
      this.sendMessage(connectionId, {
        type: 'error',
        error: 'Invalid message format'
      })
    }
  }

  private async handleAgentOperation(connectionId: string, message: AgentMessage): Promise<void> {
    const connection = this.connections.get(connectionId)
    if (!connection || connection.type !== 'agent') {
      this.sendMessage(connectionId, {
        type: 'error',
        error: 'Unauthorized: Only agents can perform operations',
        request_id: message.request_id
      })
      return
    }

    try {
      console.log(`🤖 Processing agent operation: ${message.operation} from ${connection.agent_id}`)

      const operationRequest: AgentOperationRequest = {
        type: 'agent_operation',
        operation: message.operation!,
        diagram_uuid: message.diagram_uuid,
        data: message.data,
        agent_id: connection.agent_id!,
        request_id: message.request_id!
      }

      const response = await this.agentOperationService.handleOperation(operationRequest)

      // Send response back to the requesting agent
      this.sendMessage(connectionId, response)

      // If operation was successful and affected a diagram, broadcast to subscribers
      if (response.success && response.diagram_uuid) {
        this.broadcastDiagramUpdate(
          response.diagram_uuid,
          {
            operation: message.operation,
            result: response.result,
            agent_id: connection.agent_id
          },
          'agent'
        )
      }

    } catch (error) {
      console.error(`❌ Agent operation failed:`, error)
      this.sendMessage(connectionId, {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        request_id: message.request_id
      })
    }
  }

  private subscribeToDiagram(connectionId: string, diagramUuid: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    connection.subscriptions.add(diagramUuid)

    if (!this.diagramSubscriptions.has(diagramUuid)) {
      this.diagramSubscriptions.set(diagramUuid, new Set())
    }
    this.diagramSubscriptions.get(diagramUuid)!.add(connectionId)

    console.log(`Connection ${connectionId} subscribed to diagram ${diagramUuid}`)
  }

  private unsubscribeFromDiagram(connectionId: string, diagramUuid: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    connection.subscriptions.delete(diagramUuid)
    this.diagramSubscriptions.get(diagramUuid)?.delete(connectionId)

    console.log(`Connection ${connectionId} unsubscribed from diagram ${diagramUuid}`)
  }

  public broadcastDiagramUpdate(diagramUuid: string, changes: any, source: 'user' | 'agent'): void {
    const subscribers = this.diagramSubscriptions.get(diagramUuid)
    if (!subscribers) return

    const updateMessage: DiagramUpdate = {
      type: 'diagram_updated',
      diagram_uuid: diagramUuid,
      changes: [changes],
      updated_by: source,
      timestamp: new Date().toISOString()
    }

    subscribers.forEach(connectionId => {
      this.sendMessage(connectionId, updateMessage)
    })

    console.log(`Broadcasted update for diagram ${diagramUuid} to ${subscribers.size} subscribers`)
  }

  private sendMessage(connectionId: string, message: DiagramUpdate): void {
    const connection = this.connections.get(connectionId)
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return
    }

    try {
      connection.ws.send(JSON.stringify(message))
    } catch (error) {
      console.error(`Error sending message to ${connectionId}:`, error)
      this.handleDisconnection(connectionId)
    }
  }

  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    // Remove from all diagram subscriptions
    connection.subscriptions.forEach(diagramUuid => {
      this.diagramSubscriptions.get(diagramUuid)?.delete(connectionId)
    })

    this.connections.delete(connectionId)
    console.log(`Connection ${connectionId} disconnected`)
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = new Date()
      const timeout = 30000 // 30 seconds

      this.connections.forEach((connection, connectionId) => {
        if (now.getTime() - connection.lastPing.getTime() > timeout) {
          console.log(`Connection ${connectionId} timed out`)
          connection.ws.terminate()
          this.handleDisconnection(connectionId)
        }
      })
    }, 15000) // Check every 15 seconds
  }

  public getConnectionStats(): any {
    return {
      totalConnections: this.connections.size,
      agentConnections: Array.from(this.connections.values()).filter(c => c.type === 'agent').length,
      userConnections: Array.from(this.connections.values()).filter(c => c.type === 'user').length,
      totalSubscriptions: Array.from(this.diagramSubscriptions.values()).reduce((sum, subs) => sum + subs.size, 0)
    }
  }

  public close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    this.wss.close()
  }
}
