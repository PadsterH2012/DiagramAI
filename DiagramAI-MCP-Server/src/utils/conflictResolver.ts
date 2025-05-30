import { EventEmitter } from 'events';

export interface ConflictEvent {
  id: string;
  type: ConflictType;
  diagramUuid: string;
  nodeId?: string;
  edgeId?: string;
  operations: ConflictingOperation[];
  timestamp: Date;
  resolved: boolean;
  resolution?: ConflictResolution;
}

export interface ConflictingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  target: 'node' | 'edge' | 'diagram';
  targetId: string;
  data: any;
  agentId?: string;
  userId?: string;
  timestamp: Date;
  priority: number;
}

export interface ConflictResolution {
  strategy: ConflictResolutionStrategy;
  winningOperation: string;
  rejectedOperations: string[];
  mergedData?: any;
  timestamp: Date;
  reason: string;
}

export enum ConflictType {
  SIMULTANEOUS_EDIT = 'simultaneous_edit',
  CONCURRENT_DELETE = 'concurrent_delete',
  POSITION_CONFLICT = 'position_conflict',
  DATA_CONFLICT = 'data_conflict',
  DEPENDENCY_CONFLICT = 'dependency_conflict',
}

export enum ConflictResolutionStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  FIRST_WRITE_WINS = 'first_write_wins',
  USER_PRIORITY = 'user_priority',
  AGENT_PRIORITY = 'agent_priority',
  OPERATIONAL_TRANSFORM = 'operational_transform',
  MANUAL_RESOLUTION = 'manual_resolution',
}

export interface ConflictDetectionOptions {
  timingWindowMs?: number;
  enablePositionConflictDetection?: boolean;
  enableDataConflictDetection?: boolean;
  userPriorityWeight?: number;
  agentPriorityWeight?: number;
}

export class ConflictResolver extends EventEmitter {
  private activeConflicts: Map<string, ConflictEvent> = new Map();
  private operationHistory: Map<string, ConflictingOperation[]> = new Map();
  private options: Required<ConflictDetectionOptions>;

  constructor(options: ConflictDetectionOptions = {}) {
    super();
    
    this.options = {
      timingWindowMs: options.timingWindowMs || 5000, // 5 second window
      enablePositionConflictDetection: options.enablePositionConflictDetection ?? true,
      enableDataConflictDetection: options.enableDataConflictDetection ?? true,
      userPriorityWeight: options.userPriorityWeight || 1.5,
      agentPriorityWeight: options.agentPriorityWeight || 1.0,
    };
  }

  /**
   * Register an operation and check for conflicts
   */
  registerOperation(operation: ConflictingOperation): ConflictEvent | null {
    const key = this.getOperationKey(operation);
    
    // Add to operation history
    if (!this.operationHistory.has(key)) {
      this.operationHistory.set(key, []);
    }
    this.operationHistory.get(key)!.push(operation);

    // Check for conflicts
    const conflict = this.detectConflict(operation);
    if (conflict) {
      this.activeConflicts.set(conflict.id, conflict);
      this.emit('conflictDetected', conflict);
      console.warn(`⚠️ Conflict detected: ${conflict.type} for ${conflict.diagramUuid}`);
    }

    return conflict;
  }

  /**
   * Resolve a conflict using the specified strategy
   */
  async resolveConflict(
    conflictId: string, 
    strategy: ConflictResolutionStrategy,
    manualData?: any
  ): Promise<ConflictResolution> {
    const conflict = this.activeConflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    let resolution: ConflictResolution;

    switch (strategy) {
      case ConflictResolutionStrategy.LAST_WRITE_WINS:
        resolution = this.resolveLastWriteWins(conflict);
        break;
      case ConflictResolutionStrategy.FIRST_WRITE_WINS:
        resolution = this.resolveFirstWriteWins(conflict);
        break;
      case ConflictResolutionStrategy.USER_PRIORITY:
        resolution = this.resolveUserPriority(conflict);
        break;
      case ConflictResolutionStrategy.AGENT_PRIORITY:
        resolution = this.resolveAgentPriority(conflict);
        break;
      case ConflictResolutionStrategy.OPERATIONAL_TRANSFORM:
        resolution = await this.resolveOperationalTransform(conflict);
        break;
      case ConflictResolutionStrategy.MANUAL_RESOLUTION:
        resolution = this.resolveManual(conflict, manualData);
        break;
      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`);
    }

    // Mark conflict as resolved
    conflict.resolved = true;
    conflict.resolution = resolution;

    this.emit('conflictResolved', conflict, resolution);
    console.log(`✅ Conflict resolved: ${conflict.type} using ${strategy}`);

    return resolution;
  }

  /**
   * Get all active conflicts
   */
  getActiveConflicts(): ConflictEvent[] {
    return Array.from(this.activeConflicts.values()).filter(c => !c.resolved);
  }

  /**
   * Get conflict by ID
   */
  getConflict(conflictId: string): ConflictEvent | undefined {
    return this.activeConflicts.get(conflictId);
  }

  /**
   * Clear resolved conflicts older than specified time
   */
  cleanupResolvedConflicts(olderThanMs: number = 3600000): void { // 1 hour default
    const cutoff = new Date(Date.now() - olderThanMs);
    
    for (const [id, conflict] of this.activeConflicts) {
      if (conflict.resolved && conflict.timestamp < cutoff) {
        this.activeConflicts.delete(id);
      }
    }
  }

  private detectConflict(operation: ConflictingOperation): ConflictEvent | null {
    const key = this.getOperationKey(operation);
    const history = this.operationHistory.get(key) || [];
    
    // Look for operations within the timing window
    const cutoff = new Date(operation.timestamp.getTime() - this.options.timingWindowMs);
    const recentOperations = history.filter(op => 
      op.timestamp >= cutoff && op.id !== operation.id
    );

    if (recentOperations.length === 0) {
      return null;
    }

    // Determine conflict type
    const conflictType = this.determineConflictType(operation, recentOperations);
    if (!conflictType) {
      return null;
    }

    // Create conflict event
    const conflict: ConflictEvent = {
      id: this.generateConflictId(),
      type: conflictType,
      diagramUuid: operation.targetId.startsWith('diagram_') ? operation.targetId : operation.diagramUuid || '',
      nodeId: operation.target === 'node' ? operation.targetId : undefined,
      edgeId: operation.target === 'edge' ? operation.targetId : undefined,
      operations: [operation, ...recentOperations],
      timestamp: new Date(),
      resolved: false,
    };

    return conflict;
  }

  private determineConflictType(
    operation: ConflictingOperation, 
    recentOperations: ConflictingOperation[]
  ): ConflictType | null {
    // Check for simultaneous edits on the same target
    const sameTargetOps = recentOperations.filter(op => 
      op.target === operation.target && op.targetId === operation.targetId
    );

    if (sameTargetOps.length > 0) {
      // Check for concurrent deletes
      if (operation.type === 'delete' || sameTargetOps.some(op => op.type === 'delete')) {
        return ConflictType.CONCURRENT_DELETE;
      }

      // Check for position conflicts (if enabled)
      if (this.options.enablePositionConflictDetection && this.hasPositionConflict(operation, sameTargetOps)) {
        return ConflictType.POSITION_CONFLICT;
      }

      // Check for data conflicts (if enabled)
      if (this.options.enableDataConflictDetection && this.hasDataConflict(operation, sameTargetOps)) {
        return ConflictType.DATA_CONFLICT;
      }

      return ConflictType.SIMULTANEOUS_EDIT;
    }

    // Check for dependency conflicts (e.g., deleting a node while adding an edge to it)
    if (this.hasDependencyConflict(operation, recentOperations)) {
      return ConflictType.DEPENDENCY_CONFLICT;
    }

    return null;
  }

  private hasPositionConflict(operation: ConflictingOperation, others: ConflictingOperation[]): boolean {
    if (!operation.data?.position) return false;
    
    return others.some(op => 
      op.data?.position && 
      (op.data.position.x !== operation.data.position.x || 
       op.data.position.y !== operation.data.position.y)
    );
  }

  private hasDataConflict(operation: ConflictingOperation, others: ConflictingOperation[]): boolean {
    if (!operation.data) return false;
    
    return others.some(op => {
      if (!op.data) return false;
      
      // Compare key data fields (excluding position and timestamps)
      const opData = { ...operation.data };
      const otherData = { ...op.data };
      delete opData.position;
      delete otherData.position;
      delete opData.timestamp;
      delete otherData.timestamp;
      
      return JSON.stringify(opData) !== JSON.stringify(otherData);
    });
  }

  private hasDependencyConflict(operation: ConflictingOperation, others: ConflictingOperation[]): boolean {
    // Example: deleting a node while someone else is adding an edge to it
    if (operation.type === 'delete' && operation.target === 'node') {
      return others.some(op => 
        op.type === 'create' && 
        op.target === 'edge' && 
        (op.data?.source === operation.targetId || op.data?.target === operation.targetId)
      );
    }

    // Example: creating an edge to a node that's being deleted
    if (operation.type === 'create' && operation.target === 'edge') {
      return others.some(op => 
        op.type === 'delete' && 
        op.target === 'node' && 
        (operation.data?.source === op.targetId || operation.data?.target === op.targetId)
      );
    }

    return false;
  }

  private resolveLastWriteWins(conflict: ConflictEvent): ConflictResolution {
    const sortedOps = conflict.operations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const winner = sortedOps[0];
    const rejected = sortedOps.slice(1);

    return {
      strategy: ConflictResolutionStrategy.LAST_WRITE_WINS,
      winningOperation: winner.id,
      rejectedOperations: rejected.map(op => op.id),
      timestamp: new Date(),
      reason: `Last write wins: operation ${winner.id} was most recent`,
    };
  }

  private resolveFirstWriteWins(conflict: ConflictEvent): ConflictResolution {
    const sortedOps = conflict.operations.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const winner = sortedOps[0];
    const rejected = sortedOps.slice(1);

    return {
      strategy: ConflictResolutionStrategy.FIRST_WRITE_WINS,
      winningOperation: winner.id,
      rejectedOperations: rejected.map(op => op.id),
      timestamp: new Date(),
      reason: `First write wins: operation ${winner.id} was earliest`,
    };
  }

  private resolveUserPriority(conflict: ConflictEvent): ConflictResolution {
    const userOps = conflict.operations.filter(op => op.userId);
    const agentOps = conflict.operations.filter(op => op.agentId);

    if (userOps.length > 0) {
      const winner = userOps.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      const rejected = conflict.operations.filter(op => op.id !== winner.id);

      return {
        strategy: ConflictResolutionStrategy.USER_PRIORITY,
        winningOperation: winner.id,
        rejectedOperations: rejected.map(op => op.id),
        timestamp: new Date(),
        reason: `User priority: user operation ${winner.id} takes precedence`,
      };
    }

    // Fallback to last write wins if no user operations
    return this.resolveLastWriteWins(conflict);
  }

  private resolveAgentPriority(conflict: ConflictEvent): ConflictResolution {
    const agentOps = conflict.operations.filter(op => op.agentId);
    const userOps = conflict.operations.filter(op => op.userId);

    if (agentOps.length > 0) {
      const winner = agentOps.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      const rejected = conflict.operations.filter(op => op.id !== winner.id);

      return {
        strategy: ConflictResolutionStrategy.AGENT_PRIORITY,
        winningOperation: winner.id,
        rejectedOperations: rejected.map(op => op.id),
        timestamp: new Date(),
        reason: `Agent priority: agent operation ${winner.id} takes precedence`,
      };
    }

    // Fallback to last write wins if no agent operations
    return this.resolveLastWriteWins(conflict);
  }

  private async resolveOperationalTransform(conflict: ConflictEvent): Promise<ConflictResolution> {
    // Simplified operational transformation - merge compatible changes
    const operations = conflict.operations.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (operations.length === 2 && this.canMergeOperations(operations[0], operations[1])) {
      const mergedData = this.mergeOperationData(operations[0], operations[1]);
      
      return {
        strategy: ConflictResolutionStrategy.OPERATIONAL_TRANSFORM,
        winningOperation: operations[0].id, // Use first as base
        rejectedOperations: [operations[1].id],
        mergedData,
        timestamp: new Date(),
        reason: `Operational transform: merged compatible changes`,
      };
    }

    // Fallback to last write wins if operations can't be merged
    return this.resolveLastWriteWins(conflict);
  }

  private resolveManual(conflict: ConflictEvent, manualData: any): ConflictResolution {
    return {
      strategy: ConflictResolutionStrategy.MANUAL_RESOLUTION,
      winningOperation: manualData.winningOperationId || conflict.operations[0].id,
      rejectedOperations: conflict.operations
        .filter(op => op.id !== manualData.winningOperationId)
        .map(op => op.id),
      mergedData: manualData.mergedData,
      timestamp: new Date(),
      reason: `Manual resolution: ${manualData.reason || 'User-specified resolution'}`,
    };
  }

  private canMergeOperations(op1: ConflictingOperation, op2: ConflictingOperation): boolean {
    // Can merge if they're both updates to the same target with non-conflicting data
    if (op1.type !== 'update' || op2.type !== 'update') return false;
    if (op1.target !== op2.target || op1.targetId !== op2.targetId) return false;
    
    // Check if data fields don't overlap
    const keys1 = Object.keys(op1.data || {});
    const keys2 = Object.keys(op2.data || {});
    const overlap = keys1.filter(key => keys2.includes(key));
    
    return overlap.length === 0;
  }

  private mergeOperationData(op1: ConflictingOperation, op2: ConflictingOperation): any {
    return {
      ...op1.data,
      ...op2.data,
    };
  }

  private getOperationKey(operation: ConflictingOperation): string {
    return `${operation.target}:${operation.targetId}`;
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
