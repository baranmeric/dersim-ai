import { TAG, Logger } from '@dersim/api/core';
import sessionService from '../service/session.service';
import { ISession } from '../schema/session';

export interface IBaseTaskParams {
    userId: string;
    sessionId: string;
    force?: boolean;
}

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
    processingCount: number;
    isProcessing: boolean;
    locks: Set<string>;
}

export abstract class BaseQueue<T extends IBaseTask> {
    protected TAG: string;
    protected queue: T[] = [];
    protected isProcessing = false;
    protected maxConcurrent = 100;
    protected processingCount = 0;
    protected retryBuffer = 100;
    protected timeoutId: NodeJS.Timeout | null = null;

    constructor(tag: string) {
        this.TAG = tag;
        this.startProcessing();
    }

    protected startProcessing(): void {
        if (this.isProcessing) return;
        this.isProcessing = true;
        Logger.info(TAG.QUEUE, `${this.TAG} queue processing started`);
        this.processNextTask();
    }

    protected async processNextTask(): Promise<void> {
        if (!this.isProcessing) return;

        if (this.processingCount >= this.maxConcurrent) {
            this.timeoutId = setTimeout(() => this.processNextTask(), this.retryBuffer);
            return;
        }

        const taskIndex = this.findNextTaskIndex();

        if (taskIndex === -1) {
            this.timeoutId = setTimeout(() => this.processNextTask(), this.retryBuffer);
            return;
        }

        const task = this.queue[taskIndex];
        task.processing = true;
        this.processingCount++;
        this.lockResource(task);

        try {
            this.logTask('PROCESSING', task);
            await this.processTask(task);
            this.onTaskComplete(task);
            this.logTask('COMPLETED', task);
        } catch (error) {
            this.logTaskError(error, task);
        } finally {
            this.removeTask(taskIndex);
            this.unlockResource(task);
            this.processingCount--;
            setImmediate(() => this.processNextTask());
        }
    }

    protected removeTask(index: number): void {
        if (index >= 0 && index < this.queue.length) {
            this.queue.splice(index, 1);
        }
    }

    public stop(): void {
        this.isProcessing = false;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        Logger.info(TAG.QUEUE, "Queue processing stopped");
    }

    public getStats(): IQueueStats {
        return {
            queueLength: this.queue.length,
            processingCount: this.processingCount,
            isProcessing: this.isProcessing,
            locks: new Set(),
        };
    }

    protected async getSession(sessionId: string): Promise<ISession | null> {
        try {
            return await sessionService.getSessionById(sessionId);
        } catch (error) {
            Logger.error(TAG.QUEUE, `Error retrieving session ${sessionId}:`, error);
            return null;
        }
    }

    protected logTask(title: string, task: IBaseTask) {
        const type = 'type' in task ? (task as any).type : 'unknown';
        Logger.info(TAG.QUEUE, `${title}:\n      type: ${type}\n      id: ${task.id}\n      sessionId: ${task.sessionId}`);
    }

    protected logTaskError(error: any, task: IBaseTask) {
        const type = 'type' in task ? (task as any).type : 'unknown';
        Logger.error(TAG.QUEUE, `ERROR:\n      type: ${type}\n      id: ${task.id}\n      sessionId: ${task.sessionId}`, error);
    }

    protected abstract findNextTaskIndex(): number;
    protected abstract lockResource(task: T): void;
    protected abstract unlockResource(task: T): void;
    protected abstract processTask(task: T): Promise<void>;
    protected abstract onTaskComplete(task: T): void;
}
