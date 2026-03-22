import { Request, Response } from 'express';
import { HttpStatus, SessionTaskType } from '@dersim/shared';
import QueueService from '../service/queue.service';

const QueueController = {
    async triggerCondensation(req: Request, res: Response) {
        const message = QueueService.enqueueSessionTask({
            userId: req.userId,
            sessionId: req.params.sessionId,
            type: SessionTaskType.CONDENSATION,
        });
        res.status(HttpStatus.OK).json(message);
    },

    async triggerSummarization(req: Request, res: Response) {
        const message = QueueService.enqueueSessionTask({
            userId: req.userId,
            sessionId: req.params.sessionId,
            type: SessionTaskType.SUMMARIZATION,
        });
        res.status(HttpStatus.OK).json(message);
    },
};

export default QueueController;
