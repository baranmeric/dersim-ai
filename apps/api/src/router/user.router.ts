import { Router } from 'express';
import userController from '../controller/user.controller';
import {validateRequest, authSchema} from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validateRequest(authSchema), userController.register);
router.post('/login', validateRequest(authSchema), userController.login);
router.get('/status', userController.status);

// Client routes
router.get('/', userController.getUser);
router.delete('/:id', userController.deleteUser);
router.post('/logout', userController.logout);

// Admin routes
router.get('/all', userController.getUsers);
router.get('/:id', userController.getUserById);

export default router;
