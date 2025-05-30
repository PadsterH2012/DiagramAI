import { EventEmitter } from 'events';

export interface QueuedEvent {
  id: string;
  type: string;
  data: any;
  priority: number;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  delay?: number;
  diagramUuid?: string;
  agentId?: string;
}

export interface EventQueueOptions {
  maxConcurrentEvents?: number;
  defaultMaxRetries?: number;
  retryDelayMs?: number;
  deadLetterQueueSize?: number;
  processingTimeoutMs?: number;
}

export interface EventProcessor {
  (event: QueuedEvent): Promise<void>;
}

export class EventQueue extends EventEmitter {
  private queue: QueuedEvent[] = [];
  private processing: Map<string, QueuedEvent> = new Map();
  private deadLetterQueue: QueuedEvent[] = [];
  private processors: Map<string, EventProcessor> = new Map();
  private isProcessing = false;
  private options: Required<EventQueueOptions>;

  constructor(options: EventQueueOptions = {}) {
    super();
    
    this.options = {
      maxConcurrentEvents: options.maxConcurrentEvents || 10,
      defaultMaxRetries: options.defaultMaxRetries || 3,
      retryDelayMs: options.retryDelayMs || 1000,
      deadLetterQueueSize: options.deadLetterQueueSize || 100,
      processingTimeoutMs: options.processingTimeoutMs || 30000,
    };

    // Start processing loop
    this.startProcessing();
  }

  /**
   * Register an event processor for a specific event type
   */
  registerProcessor(eventType: string, processor: EventProcessor): void {
    this.processors.set(eventType, processor);
    console.log(`📝 Registered processor for event type: ${eventType}`);
  }

  /**
   * Add an event to the queue
   */
  enqueue(
    type: string,
    data: any,
    options: {
      priority?: number;
      maxRetries?: number;
      delay?: number;
      diagramUuid?: string;
      agentId?: string;
    } = {}
  ): string {
    const event: QueuedEvent = {
      id: this.generateEventId(),
      type,
      data,
      priority: options.priority || 0,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries || this.options.defaultMaxRetries,
      delay: options.delay,
      diagramUuid: options.diagramUuid,
      agentId: options.agentId,
    };

    // Insert event in priority order (higher priority first)
    const insertIndex = this.queue.findIndex(e => e.priority < event.priority);
    if (insertIndex === -1) {
      this.queue.push(event);
    } else {
      this.queue.splice(insertIndex, 0, event);
    }

    this.emit('eventEnqueued', event);
    console.log(`📥 Event enqueued: ${event.type} (ID: ${event.id}, Priority: ${event.priority})`);
    
    return event.id;
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueSize: number;
    processingCount: number;
    deadLetterCount: number;
    registeredProcessors: string[];
  } {
    return {
      queueSize: this.queue.length,
      processingCount: this.processing.size,
      deadLetterCount: this.deadLetterQueue.length,
      registeredProcessors: Array.from(this.processors.keys()),
    };
  }

  /**
   * Get events from dead letter queue
   */
  getDeadLetterEvents(): QueuedEvent[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Retry an event from dead letter queue
   */
  retryDeadLetterEvent(eventId: string): boolean {
    const eventIndex = this.deadLetterQueue.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      return false;
    }

    const event = this.deadLetterQueue.splice(eventIndex, 1)[0];
    event.retryCount = 0; // Reset retry count
    event.timestamp = new Date(); // Update timestamp

    // Re-enqueue the event
    const insertIndex = this.queue.findIndex(e => e.priority < event.priority);
    if (insertIndex === -1) {
      this.queue.push(event);
    } else {
      this.queue.splice(insertIndex, 0, event);
    }

    console.log(`🔄 Retrying dead letter event: ${event.type} (ID: ${event.id})`);
    return true;
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue(): void {
    const count = this.deadLetterQueue.length;
    this.deadLetterQueue = [];
    console.log(`🗑️ Cleared ${count} events from dead letter queue`);
  }

  /**
   * Stop the event queue processing
   */
  async stop(): Promise<void> {
    this.isProcessing = false;
    
    // Wait for current processing to complete
    while (this.processing.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🛑 Event queue stopped');
  }

  private startProcessing(): void {
    this.isProcessing = true;
    this.processEvents();
  }

  private async processEvents(): Promise<void> {
    while (this.isProcessing) {
      try {
        // Check if we can process more events
        if (this.processing.size >= this.options.maxConcurrentEvents) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        // Get next event from queue
        const event = this.queue.shift();
        if (!event) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        // Check if event should be delayed
        if (event.delay && event.delay > 0) {
          setTimeout(() => {
            this.queue.unshift(event);
          }, event.delay);
          event.delay = 0; // Clear delay after scheduling
          continue;
        }

        // Process the event
        this.processEvent(event);

      } catch (error) {
        console.error('❌ Error in event processing loop:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async processEvent(event: QueuedEvent): Promise<void> {
    this.processing.set(event.id, event);
    
    try {
      const processor = this.processors.get(event.type);
      if (!processor) {
        throw new Error(`No processor registered for event type: ${event.type}`);
      }

      console.log(`⚡ Processing event: ${event.type} (ID: ${event.id}, Attempt: ${event.retryCount + 1})`);
      
      // Set processing timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Event processing timeout: ${event.id}`));
        }, this.options.processingTimeoutMs);
      });

      // Process the event with timeout
      await Promise.race([
        processor(event),
        timeoutPromise
      ]);

      // Event processed successfully
      this.processing.delete(event.id);
      this.emit('eventProcessed', event);
      console.log(`✅ Event processed successfully: ${event.type} (ID: ${event.id})`);

    } catch (error) {
      this.processing.delete(event.id);
      await this.handleEventError(event, error as Error);
    }
  }

  private async handleEventError(event: QueuedEvent, error: Error): Promise<void> {
    event.retryCount++;
    
    console.error(`❌ Event processing failed: ${event.type} (ID: ${event.id}, Attempt: ${event.retryCount}/${event.maxRetries})`, error.message);

    if (event.retryCount < event.maxRetries) {
      // Retry the event with exponential backoff
      const retryDelay = this.options.retryDelayMs * Math.pow(2, event.retryCount - 1);
      event.delay = retryDelay;
      event.timestamp = new Date();

      // Re-enqueue for retry
      this.queue.unshift(event);
      this.emit('eventRetry', event, error);
      console.log(`🔄 Event scheduled for retry: ${event.type} (ID: ${event.id}) in ${retryDelay}ms`);

    } else {
      // Move to dead letter queue
      this.moveToDeadLetterQueue(event, error);
    }
  }

  private moveToDeadLetterQueue(event: QueuedEvent, error: Error): void {
    // Add error information to event
    (event as any).lastError = {
      message: error.message,
      timestamp: new Date(),
    };

    // Maintain dead letter queue size limit
    if (this.deadLetterQueue.length >= this.options.deadLetterQueueSize) {
      this.deadLetterQueue.shift(); // Remove oldest event
    }

    this.deadLetterQueue.push(event);
    this.emit('eventDeadLetter', event, error);
    console.error(`💀 Event moved to dead letter queue: ${event.type} (ID: ${event.id})`);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
