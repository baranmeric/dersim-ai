import { Router } from 'express';
import { requireAdmin } from '@dersim/api/core';
import sessionController from '../controller/session.controller';
import queueController from '../controller/queue.controller';

const router = Router();

router.route('/all').get(requireAdmin, sessionController.getAllSessions);
router.route('/context/:id').delete(sessionController.resetContextWindow);
router.route('/queue/condense/:id').patch(queueController.triggerCondensation);
router.route('/queue/summarize/:id').patch(queueController.triggerSummarization);

router.route('/').post(sessionController.createSession);
router.route('/').get(sessionController.getUserSessions);
router.route('/:id').get(sessionController.getSessionDto);
router.route('/:id').delete(sessionController.deleteSession);

export default router;
