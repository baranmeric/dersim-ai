import {Router} from "express";
import {chatSchema, validateRequest} from "../middleware/validation";
import {ChatController} from "../controller/chat.controller";

const router = Router();
router.post('/:id', validateRequest(chatSchema), ChatController.chat);

export default router;
