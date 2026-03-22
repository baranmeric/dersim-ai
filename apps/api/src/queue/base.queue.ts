import { TAG, Logger } from "../helper/logger";
import SessionService from "../service/session.service";
import { ISession } from "../schema/session";

export interface IBaseTaskParams {
  userId: string;
  sessionId: string;
  force?: boolean;
}

// Base task interface that all task types will extend
export interface IBaseTask {
  id: string;
  userId: string;
  sessionId: string;
  createdAt: Date;
  processing?: boolean;
  force?: boolean;
}

export interface IQueueStats {
  queueLength: number;
  processingCount: number,
  isProcessing: boolean,
  locks: Set<string>,
}

// Base queue class that can be extended by specific queue implementations
export abstract class BaseQueue<T extends IBaseTask> {
  protected TAG: string;
  protected queue: T[] = [];
  protected isProcessing: boolean = false;
  protected maxConcurrent: number = 100; // Process maximum of 100 task at a time
  protected processingCount: number = 0;
  protected retryBuffer = 100; // Retry processing task in ms
  protected timeoutId: NodeJS.Timeout | null = null;

  constructor(tag: string) {
    this.TAG = tag;
    this.startProcessing();
  }

  /**
   * Start processing the queue
   */
  protected startProcessing(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    Logger.info(TAG.QUEUE, `${this.TAG} queue processing started`);
    
    this.processNextTask();
  }

  /**
   * Process the next task in the queue
   */
  protected async processNextTask(): Promise<void> {
    if (!this.isProcessing) return;
    
    // Only process if below concurrent limit
    if (this.processingCount >= this.maxConcurrent) {
      this.timeoutId = setTimeout(() => this.processNextTask(), this.retryBuffer);
      return;
    }

    // Find next task that isn't currently being processed
    const taskIndex = this.findNextTaskIndex();
    
    if (taskIndex === -1) {
      // No tasks to process right now
      this.timeoutId = setTimeout(() => this.processNextTask(), this.retryBuffer);
      return;
    }

    // Mark task as processing
    const task = this.queue[taskIndex];
    task.processing = true;
    this.processingCount++;
    
    // Lock the resource (implemented by subclasses)
    this.lockResource(task);
    
    try {
      this.logTask('PROCESSING', task);
      // Process the task (implemented by subclasses)
      await this.processTask(task);
      this.onTaskComplete(task);
      
      this.logTask('COMPLETED', task);
    } catch (error) {
      this.logTaskError(error, task);
    } finally {
      // Cleanup
      this.removeTask(taskIndex);
      this.unlockResource(task);
      this.processingCount--;
      
      // Continue processing, call in new stack frame
      setImmediate(() => this.processNextTask());
    }
  }

  /**
   * Remove a task from the queue
   */
  protected removeTask(index: number): void {
    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Stop queue processing
   */
  public stop(): void {
    this.isProcessing = false;
    if(this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    Logger.info(TAG.QUEUE, "Queue processing stopped");
  }

  /**
   * Get queue stats
   */
  public getStats(): IQueueStats {
    return {
      queueLength: this.queue.length,
      processingCount: this.processingCount,
      isProcessing: this.isProcessing,
      locks: new Set(),
    };
  }


  /**
   * Get a session by ID
   */
  protected async getSession(sessionId: string): Promise<ISession | null> {
    try {
      return await SessionService.getSessionById(sessionId);
    } catch (error) {
      Logger.error(TAG.QUEUE, `Error retrieving session ${sessionId}:`, error);
      return null;
    }
  }

  protected logTask(title: string, task: IBaseTask) {
    const type = 'type' in task ? task.type : 'unknown';
    Logger.info(TAG.QUEUE, `${title}:\n
      type: ${type}\n
      id: ${task.id}\n
      sessionId: ${task.sessionId}`);
  }

  protected logTaskError(error: any, task: IBaseTask) {
    const type = 'type' in task ? task.type : 'unknown';
    Logger.error(TAG.QUEUE, `ERROR:\n
      type: ${type}\n
      id: ${task.id}\n
      sessionId: ${task.sessionId}`, error);
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract findNextTaskIndex(): number;
  protected abstract lockResource(task: T): void;
  protected abstract unlockResource(task: T): void;
  protected abstract processTask(task: T): Promise<void>;
  protected abstract onTaskComplete(task: T): void;
} 
