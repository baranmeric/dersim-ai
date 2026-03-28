import { SessionTaskType } from '@dersim/shared';
import { Logger, TAG, createServiceProxy } from '@dersim/api/core';
import SessionQueue, { ISessionTaskParams } from '../queue/session.queue';
import { ISession } from '../schema/session';

const QueueService = {
    enqueueSessionTask(params: ISessionTaskParams): string {
        SessionQueue.enqueueTask(params);
        return `${params.type} task queued for session ${params.sessionId}`;
    },

    async tryEnqueueSessionTask(session: ISession): Promise<void> {
        if (!session || !session._id) {
            Logger.error(TAG.CONTEXT, "Cannot process context for invalid session");
            return;
        }

        const params: ISessionTaskParams = {
            userId: session.getUserId(),
            sessionId: session.id,
            type: SessionTaskType.CONDENSATION,
        };

        if (session.isReadyFor(SessionTaskType.CONDENSATION)) {
            this.enqueueSessionTask(params);
        }
        if (session.isReadyFor(SessionTaskType.SUMMARIZATION)) {
            params.type = SessionTaskType.SUMMARIZATION;
            this.enqueueSessionTask(params);
        }
    },
};

export default createServiceProxy(QueueService);
