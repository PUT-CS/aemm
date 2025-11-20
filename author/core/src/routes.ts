import {Router} from 'express';
import {getNode, getTree, updateNode} from './controllers/nodeController';

const router = Router();

router.get('/scrtree', getTree);

router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', updateNode);

export default router;
