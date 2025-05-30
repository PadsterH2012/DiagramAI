import { prisma } from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'
import { ConflictResolver, ConflictingOperation, ConflictEvent, ConflictResolutionStrategy } from '../utils/conflictResolver'

export interface AgentOperationRequest {
  type: 'agent_operation'
  operation: string
  diagram_uuid?: string
  data: any
  agent_id: string
  request_id: string
}

export interface AgentOperationResponse {
  type: 'diagram_updated' | 'error'
  diagram_uuid?: string
  result?: any
  error?: string
  request_id: string
  success: boolean
  timestamp: string
}

export class AgentOperationService {
  private conflictResolver: ConflictResolver

  constructor() {
    this.conflictResolver = new ConflictResolver({
      timingWindowMs: 5000, // 5 second conflict detection window
      enablePositionConflictDetection: true,
      enableDataConflictDetection: true,
      userPriorityWeight: 1.5,
      agentPriorityWeight: 1.0,
    })

    // Set up conflict event handlers
    this.conflictResolver.on('conflictDetected', (conflict: ConflictEvent) => {
      console.warn(`⚠️ Conflict detected: ${conflict.type} for diagram ${conflict.diagramUuid}`)
    })

    this.conflictResolver.on('conflictResolved', (conflict: ConflictEvent, resolution: any) => {
      console.log(`✅ Conflict resolved: ${conflict.type} using ${resolution.strategy}`)
    })
  }

  async handleOperation(request: AgentOperationRequest): Promise<AgentOperationResponse> {
    const startTime = Date.now()

    try {
      console.log(`🤖 Processing agent operation: ${request.operation} from ${request.agent_id}`)

      // Register operation for conflict detection
      const conflictingOperation = this.createConflictingOperation(request)
      const conflict = this.conflictResolver.registerOperation(conflictingOperation)

      // If conflict detected, resolve it automatically
      if (conflict) {
        const resolution = await this.conflictResolver.resolveConflict(
          conflict.id,
          ConflictResolutionStrategy.LAST_WRITE_WINS // Default strategy
        )

        // Check if this operation was rejected due to conflict
        if (resolution.rejectedOperations.includes(conflictingOperation.id)) {
          throw new Error(`Operation rejected due to conflict: ${resolution.reason}`)
        }
      }

      let result: any
      
      switch (request.operation) {
        case 'create_diagram':
          result = await this.createDiagram(request.data, request.agent_id)
          break
        case 'read_diagram':
          result = await this.readDiagram(request.data, request.agent_id)
          break
        case 'list_diagrams':
          result = await this.listDiagrams(request.data, request.agent_id)
          break
        case 'add_node':
          result = await this.addNode(request.diagram_uuid!, request.data, request.agent_id)
          break
        case 'update_node':
          result = await this.updateNode(request.diagram_uuid!, request.data, request.agent_id)
          break
        case 'delete_node':
          result = await this.deleteNode(request.diagram_uuid!, request.data, request.agent_id)
          break
        case 'add_edge':
          result = await this.addEdge(request.diagram_uuid!, request.data, request.agent_id)
          break
        case 'delete_edge':
          result = await this.deleteEdge(request.diagram_uuid!, request.data, request.agent_id)
          break
        default:
          throw new Error(`Unknown operation: ${request.operation}`)
      }

      const duration = Date.now() - startTime
      
      // Log successful operation
      await this.logOperation(
        request.agent_id,
        request.diagram_uuid || 'new',
        request.operation,
        request.data,
        result,
        true,
        duration
      )

      return {
        type: 'diagram_updated',
        diagram_uuid: request.diagram_uuid || result?.diagram_uuid,
        result,
        request_id: request.request_id,
        success: true,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      console.error(`❌ Agent operation failed: ${request.operation}`, error)
      
      // Log failed operation
      await this.logOperation(
        request.agent_id,
        request.diagram_uuid || 'unknown',
        request.operation,
        request.data,
        null,
        false,
        duration
      )

      return {
        type: 'error',
        error: errorMessage,
        request_id: request.request_id,
        success: false,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async createDiagram(data: any, agentId: string): Promise<any> {
    const { title, description, format = 'reactflow', template, initialNodes = [], initialEdges = [] } = data

    // Create initial content based on format
    let content: any
    if (format === 'reactflow') {
      content = {
        nodes: initialNodes.map((node: any, index: number) => ({
          id: node.id || `node-${index + 1}`,
          type: node.type || 'default',
          position: node.position || { x: 100 + index * 200, y: 100 },
          data: { label: node.label || `Node ${index + 1}`, ...node.data },
          style: node.style || {}
        })),
        edges: initialEdges.map((edge: any, index: number) => ({
          id: edge.id || `edge-${index + 1}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: edge.type || 'smoothstep',
          style: edge.style || {}
        })),
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    } else if (format === 'mermaid') {
      content = {
        syntax: data.syntax || 'graph TD\n    A[Start] --> B[End]'
      }
    }

    // Generate content hash
    const contentHash = createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex')

    // Create diagram in database
    const diagram = await prisma.diagram.create({
      data: {
        title,
        description,
        content,
        format,
        contentHash,
        agentAccessible: true, // Mark as agent accessible
        userId: '00000000-0000-0000-0000-000000000000', // System user for agent-created diagrams
        tags: [`agent:${agentId}`, 'agent-created']
      }
    })

    return {
      diagram_uuid: diagram.uuid,
      diagram_id: diagram.id,
      title: diagram.title,
      format: diagram.format,
      content: diagram.content,
      created_at: diagram.createdAt
    }
  }

  private async readDiagram(data: any, agentId: string): Promise<any> {
    const { diagram_uuid, include_metadata = false } = data

    const diagram = await prisma.diagram.findFirst({
      where: {
        uuid: diagram_uuid,
        agentAccessible: true
      },
      include: include_metadata ? {
        user: { select: { id: true, name: true } },
        versions: { take: 5, orderBy: { createdAt: 'desc' } }
      } : undefined
    })

    if (!diagram) {
      throw new Error('Diagram not found or not accessible to agents')
    }

    const result: any = {
      diagram_uuid: diagram.uuid,
      title: diagram.title,
      description: diagram.description,
      format: diagram.format,
      content: diagram.content,
      tags: diagram.tags,
      created_at: diagram.createdAt,
      updated_at: diagram.updatedAt
    }

    if (include_metadata) {
      result.metadata = {
        user: diagram.user,
        versions: diagram.versions,
        view_count: diagram.viewCount,
        is_public: diagram.isPublic,
        is_template: diagram.isTemplate
      }
    }

    return result
  }

  private async listDiagrams(data: any, agentId: string): Promise<any> {
    const { limit = 10, offset = 0, filter = {} } = data

    const where: any = {
      agentAccessible: true
    }

    if (filter.format) {
      where.format = filter.format
    }

    const diagrams = await prisma.diagram.findMany({
      where,
      select: {
        uuid: true,
        title: true,
        description: true,
        format: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        isPublic: true
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.diagram.count({ where })

    return {
      diagrams: diagrams.map((d: any) => ({
        diagram_uuid: d.uuid,
        title: d.title,
        description: d.description,
        format: d.format,
        tags: d.tags,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
        view_count: d.viewCount,
        is_public: d.isPublic
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total
      }
    }
  }

  private async addNode(diagramUuid: string, data: any, agentId: string): Promise<any> {
    const diagram = await this.getDiagramForEdit(diagramUuid)
    
    if (diagram.format !== 'reactflow') {
      throw new Error('Node operations are only supported for ReactFlow diagrams')
    }

    const content = diagram.content as any
    const newNode = {
      id: data.id || `node-${Date.now()}`,
      type: data.type || 'default',
      position: data.position,
      data: { label: data.label, ...data.data },
      style: data.style || {}
    }

    content.nodes = content.nodes || []
    content.nodes.push(newNode)

    await this.updateDiagramContent(diagramUuid, content)

    return {
      diagram_uuid: diagramUuid,
      node_id: newNode.id,
      node: newNode,
      operation: 'add_node'
    }
  }

  private async updateNode(diagramUuid: string, data: any, agentId: string): Promise<any> {
    const { node_id, updates } = data
    const diagram = await this.getDiagramForEdit(diagramUuid)
    
    if (diagram.format !== 'reactflow') {
      throw new Error('Node operations are only supported for ReactFlow diagrams')
    }

    const content = diagram.content as any
    const nodeIndex = content.nodes?.findIndex((n: any) => n.id === node_id)
    
    if (nodeIndex === -1) {
      throw new Error('Node not found')
    }

    // Apply updates
    const node = content.nodes[nodeIndex]
    if (updates.label) node.data.label = updates.label
    if (updates.position) node.position = updates.position
    if (updates.style) node.style = { ...node.style, ...updates.style }
    if (updates.data) node.data = { ...node.data, ...updates.data }

    await this.updateDiagramContent(diagramUuid, content)

    return {
      diagram_uuid: diagramUuid,
      node_id,
      node: content.nodes[nodeIndex],
      operation: 'update_node'
    }
  }

  private async deleteNode(diagramUuid: string, data: any, agentId: string): Promise<any> {
    const { node_id } = data
    const diagram = await this.getDiagramForEdit(diagramUuid)
    
    if (diagram.format !== 'reactflow') {
      throw new Error('Node operations are only supported for ReactFlow diagrams')
    }

    const content = diagram.content as any
    const nodeIndex = content.nodes?.findIndex((n: any) => n.id === node_id)
    
    if (nodeIndex === -1) {
      throw new Error('Node not found')
    }

    // Remove node
    content.nodes.splice(nodeIndex, 1)
    
    // Remove connected edges
    content.edges = content.edges?.filter((e: any) => 
      e.source !== node_id && e.target !== node_id
    ) || []

    await this.updateDiagramContent(diagramUuid, content)

    return {
      diagram_uuid: diagramUuid,
      node_id,
      operation: 'delete_node'
    }
  }

  private async addEdge(diagramUuid: string, data: any, agentId: string): Promise<any> {
    const diagram = await this.getDiagramForEdit(diagramUuid)
    
    if (diagram.format !== 'reactflow') {
      throw new Error('Edge operations are only supported for ReactFlow diagrams')
    }

    const content = diagram.content as any
    const newEdge = {
      id: data.id || `edge-${Date.now()}`,
      source: data.source,
      target: data.target,
      label: data.label,
      type: data.type || 'smoothstep',
      style: data.style || {}
    }

    content.edges = content.edges || []
    content.edges.push(newEdge)

    await this.updateDiagramContent(diagramUuid, content)

    return {
      diagram_uuid: diagramUuid,
      edge_id: newEdge.id,
      edge: newEdge,
      operation: 'add_edge'
    }
  }

  private async deleteEdge(diagramUuid: string, data: any, agentId: string): Promise<any> {
    const { edge_id } = data
    const diagram = await this.getDiagramForEdit(diagramUuid)
    
    if (diagram.format !== 'reactflow') {
      throw new Error('Edge operations are only supported for ReactFlow diagrams')
    }

    const content = diagram.content as any
    const edgeIndex = content.edges?.findIndex((e: any) => e.id === edge_id)
    
    if (edgeIndex === -1) {
      throw new Error('Edge not found')
    }

    content.edges.splice(edgeIndex, 1)

    await this.updateDiagramContent(diagramUuid, content)

    return {
      diagram_uuid: diagramUuid,
      edge_id,
      operation: 'delete_edge'
    }
  }

  private async getDiagramForEdit(diagramUuid: string) {
    const diagram = await prisma.diagram.findFirst({
      where: {
        uuid: diagramUuid,
        agentAccessible: true
      }
    })

    if (!diagram) {
      throw new Error('Diagram not found or not accessible to agents')
    }

    return diagram
  }

  private async updateDiagramContent(diagramUuid: string, content: any) {
    const contentHash = createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex')

    await prisma.diagram.update({
      where: { uuid: diagramUuid },
      data: {
        content,
        contentHash,
        updatedAt: new Date()
      }
    })
  }

  private async logOperation(
    agentId: string,
    diagramUuid: string,
    operation: string,
    operationData: any,
    result: any,
    success: boolean,
    duration: number
  ) {
    try {
      await prisma.agentOperation.create({
        data: {
          agentId,
          diagramUuid,
          operation,
          operationData,
          result,
          success,
          duration
        }
      })
    } catch (error) {
      console.error('Failed to log agent operation:', error)
    }
  }

  private createConflictingOperation(request: AgentOperationRequest): ConflictingOperation {
    const operationType = this.mapOperationType(request.operation)
    const targetType = this.mapTargetType(request.operation)
    const targetId = this.getTargetId(request)

    return {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: operationType,
      target: targetType,
      targetId,
      data: request.data,
      agentId: request.agent_id,
      timestamp: new Date(),
      priority: this.getOperationPriority(request.operation),
      diagramUuid: request.diagram_uuid,
    }
  }

  private mapOperationType(operation: string): 'create' | 'update' | 'delete' {
    if (operation.startsWith('create_') || operation.startsWith('add_')) {
      return 'create'
    } else if (operation.startsWith('update_')) {
      return 'update'
    } else if (operation.startsWith('delete_')) {
      return 'delete'
    } else {
      return 'update' // Default for read operations
    }
  }

  private mapTargetType(operation: string): 'node' | 'edge' | 'diagram' {
    if (operation.includes('node')) {
      return 'node'
    } else if (operation.includes('edge')) {
      return 'edge'
    } else {
      return 'diagram'
    }
  }

  private getTargetId(request: AgentOperationRequest): string {
    if (request.operation === 'create_diagram') {
      return `diagram_${Date.now()}` // Temporary ID for new diagrams
    } else if (request.diagram_uuid) {
      if (request.data?.node_id) {
        return request.data.node_id
      } else if (request.data?.edge_id) {
        return request.data.edge_id
      } else {
        return request.diagram_uuid
      }
    }
    return 'unknown'
  }

  private getOperationPriority(operation: string): number {
    // Higher priority for destructive operations
    switch (operation) {
      case 'delete_node':
      case 'delete_edge':
        return 10
      case 'create_diagram':
        return 8
      case 'add_node':
      case 'add_edge':
        return 6
      case 'update_node':
        return 4
      case 'read_diagram':
      case 'list_diagrams':
        return 1
      default:
        return 5
    }
  }

  /**
   * Get conflict resolver statistics
   */
  getConflictStats(): any {
    return {
      activeConflicts: this.conflictResolver.getActiveConflicts().length,
      allConflicts: this.conflictResolver.getActiveConflicts(),
    }
  }

  /**
   * Manually resolve a conflict
   */
  async resolveConflictManually(
    conflictId: string,
    strategy: ConflictResolutionStrategy,
    manualData?: any
  ): Promise<any> {
    return await this.conflictResolver.resolveConflict(conflictId, strategy, manualData)
  }
}
