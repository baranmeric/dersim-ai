// src/queue/taskQueue.ts
import { TAG, Logger } from "../helper/logger";
import { BaseQueue, IBaseTask, IBaseTaskParams, IQueueStats } from "./base.queue";
import SessionGenerator from "../generator/session.generator";
import { SessionTaskType } from '@dersim/shared';
import { NotificationFactory } from "../socket/notificationFactory";
import sessionService from "../service/session.service";
import { socketManager } from "../socket/socketManager";

export interface ISessionTaskParams extends IBaseTaskParams {
  type: SessionTaskType,
}

// Define a task interface
export interface ISessionTask extends IBaseTask {
  type: SessionTaskType;
}

class SessionQueue extends BaseQueue<ISessionTask> {
  protected override TAG = 'SESSION';
  private sessionLocks: Set<string> = new Set(); // Track sessions being processed

  public enqueueTask(params: ISessionTaskParams): string {
    // Check if a similar task for this session already exists
    const existingTask = this.queue.find(
      task => task.sessionId === params.sessionId && task.type === params.type && !task.processing
    );

    if (existingTask) {
      Logger.info(TAG.QUEUE, `Task already queued for session ${params.sessionId}, type ${params.type}`);
      return existingTask.id;
    }

    // Create a new task
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const task: ISessionTask = {
      id: taskId,
      userId: params.userId,
      sessionId: params.sessionId,
      type: params.type,
      force: params.force ?? false,
      createdAt: new Date()
    };

    // Add to queue
    this.queue.push(task);
    this.logTask('QUEUED', task)

    // Ensure processing is started
    if (!this.isProcessing) {
      this.startProcessing();
    }

    return taskId;
  }

  /**
   * Find the next task that isn't for a session currently being processed
   */
  protected findNextTaskIndex(): number {
    return this.queue.findIndex(task =>
      !task.processing && !this.sessionLocks.has(task.sessionId)
    );
  }

  /**
   * Lock the session to prevent concurrent processing
   */
  protected lockResource(task: ISessionTask): void {
    this.sessionLocks.add(task.sessionId);
  }

  /**
   * Unlock the session when processing is complete
   */
  protected unlockResource(task: ISessionTask): void {
    this.sessionLocks.delete(task.sessionId);
  }

  /**
   * Process the task based on its type
   */
  protected async processTask(task: ISessionTask): Promise<void> {
    // Get the session
    const session = await this.getSession(task.sessionId);
    if (!session) {
      Logger.error(TAG.QUEUE, `Session not found for task ${task.id}`);
      return;
    }

    // Process based on task type
    if (task.type === SessionTaskType.CONDENSATION) {
      await SessionGenerator.generateCondensedMessages(session);
    } else if (task.type === SessionTaskType.SUMMARIZATION) {
      await SessionGenerator.generateSummary(session);
    }
  }

  protected async onTaskComplete(task: ISessionTask) {
    Logger.log(TAG.QUEUE, 'Completed task:', task);

    // Notify user of update via websocket
    if (task.type === SessionTaskType.SUMMARIZATION) {
      const session = await sessionService.getSessionById(task.sessionId);
      const sessionListItem = session.toListItem();
      const notification = NotificationFactory.createSessionNotification(sessionListItem);
      socketManager.notifyClient(task.userId, notification);
    }
  }

  /**
   * Get queue stats
   */
  public override getStats(): IQueueStats {
    return {
      ...super.getStats(),
      locks: this.sessionLocks,
    };
  }
}

// Create a singleton instance
const sessionQueue = new SessionQueue('SESSION');
export default sessionQueue;
