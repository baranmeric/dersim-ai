import { Router } from 'express';
import CacheController from '../controller/cache.controller';

const router = Router();

router.get('/stats', CacheController.getStats);
router.delete('/clear', CacheController.clearAll);
router.get('/key/:key/:prefix?', CacheController.getKey);
router.post('/key/:key/:prefix?', CacheController.setKey);
router.delete('/key/:key/:prefix?', CacheController.deleteKey);

export default router;
