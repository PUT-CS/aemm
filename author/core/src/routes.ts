import { Router } from 'express';
import { getNode, updateNode } from './controllers/nodeController';

const router = Router();

router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', updateNode);

export default router;
