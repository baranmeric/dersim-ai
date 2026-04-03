import { Router } from 'express';
import { requireAdmin } from '@dersim/api/core';
import CacheController from '../controller/cache.controller';

const router = Router();

router.get('/stats', requireAdmin, CacheController.getStats);
router.delete('/clear', requireAdmin, CacheController.clearAll);
router.get('/key/:key/:prefix?', requireAdmin, CacheController.getKey);
router.post('/key/:key/:prefix?', requireAdmin, CacheController.setKey);
router.delete('/key/:key/:prefix?', requireAdmin, CacheController.deleteKey);

export default router;
