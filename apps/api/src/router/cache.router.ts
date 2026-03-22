import { Router } from 'express';
import cacheController from '../controller/cache.controller';

const router = Router();

// Cache statistics
router.get('/stats', cacheController.getStats);

// Cache management
router.delete('/clear', cacheController.clearAll);

// Individual cache key operations
router.get('/key/:key/:prefix?', cacheController.getKey);
router.post('/key/:key/:prefix?', cacheController.setKey);
router.delete('/key/:key/:prefix?', cacheController.deleteKey);

export default router; 

