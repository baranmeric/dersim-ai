import { TAG, Logger, NotificationFactory, socketManager } from '@dersim/api/core';
import { SessionTaskType } from '@dersim/shared';
import { BaseQueue, IBaseTask, IBaseTaskParams, IQueueStats } from './base.queue';
import SessionGenerator from '../generator/session.generator';
import sessionService from '../service/session.service';

export interface ISessionTaskParams extends IBaseTaskParams {
    type: SessionTaskType;
}

export interface ISessionTask extends IBaseTask {
    type: SessionTaskType;
}

class SessionQueue extends BaseQueue<ISessionTask> {
    protected override TAG = 'SESSION';
    private sessionLocks: Set<string> = new Set();

    public enqueueTask(params: ISessionTaskParams): string {
        const existingTask = this.queue.find(
            task => task.sessionId === params.sessionId && task.type === params.type && !task.processing
        );

        if (existingTask) {
            Logger.info(TAG.QUEUE, `Task already queued for session ${params.sessionId}, type ${params.type}`);
            return existingTask.id;
        }

        const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const task: ISessionTask = {
            id: taskId,
            userId: params.userId,
            sessionId: params.sessionId,
            type: params.type,
            force: params.force ?? false,
            createdAt: new Date()
        };

        this.queue.push(task);
        this.logTask('QUEUED', task);

        if (!this.isProcessing) this.startProcessing();

        return taskId;
    }

    protected findNextTaskIndex(): number {
        return this.queue.findIndex(task =>
            !task.processing && !this.sessionLocks.has(task.sessionId)
        );
    }

    protected lockResource(task: ISessionTask): void {
        this.sessionLocks.add(task.sessionId);
    }

    protected unlockResource(task: ISessionTask): void {
        this.sessionLocks.delete(task.sessionId);
    }

    protected async processTask(task: ISessionTask): Promise<void> {
        const session = await this.getSession(task.sessionId);
        if (!session) {
            Logger.error(TAG.QUEUE, `Session not found for task ${task.id}`);
            return;
        }

        if (task.type === SessionTaskType.CONDENSATION) {
            await SessionGenerator.generateCondensedMessages(session);
        } else if (task.type === SessionTaskType.SUMMARIZATION) {
            await SessionGenerator.generateSummary(session);
        }
    }

    protected async onTaskComplete(task: ISessionTask) {
        Logger.log(TAG.QUEUE, 'Completed task:', task);

        if (task.type === SessionTaskType.SUMMARIZATION) {
            const session = await sessionService.getSessionById(task.sessionId);
            const sessionListItem = session.toListItem();
            const notification = NotificationFactory.createSessionNotification(sessionListItem);
            socketManager.notifyClient(task.userId, notification);
        }
    }

    public override getStats(): IQueueStats {
        return {
            ...super.getStats(),
            locks: this.sessionLocks,
        };
    }
}

const sessionQueue = new SessionQueue('SESSION');
export default sessionQueue;
