import { Router } from "express";
import { validateRequest, chatSchema } from '@dersim/api/core';
import { ChatController } from '../controller/chat.controller';

const router = Router();
router.post('/:id', validateRequest(chatSchema), ChatController.chat);

export default router;
