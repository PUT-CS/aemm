import { Router } from 'express';
import { getNode } from './controllers/nodeController';

const router = Router();

router.get('/scr/*queryPath', getNode);

export default router;
