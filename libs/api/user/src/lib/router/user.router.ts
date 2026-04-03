import { Router } from 'express';
import { validateRequest, authSchema, requireAdmin } from '@dersim/api/core';
import UserController from '../controller/user.controller';

const router = Router();

// Public routes
router.post('/register', validateRequest(authSchema), UserController.register);
router.post('/login', validateRequest(authSchema), UserController.login);
router.get('/status', UserController.status);

// Client routes
router.get('/', UserController.getUser);
router.delete('/:id', UserController.deleteUser);
router.post('/logout', UserController.logout);

// Admin routes
router.get('/all', requireAdmin, UserController.getUsers);
router.get('/:id', requireAdmin, UserController.getUserById);

export default router;
