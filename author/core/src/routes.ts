import { Router } from 'express';
import { getNode, updateNode } from './controllers/nodeController';
import { getDbHealth } from './controllers/dbController';

const router = Router();

router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', updateNode);

router.get('/db/health', getDbHealth);

export default router;
