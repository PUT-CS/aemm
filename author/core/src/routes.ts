import { Router } from 'express';
import { getNode, updateNode } from './controllers/nodeController';
import { getDbHealth } from './controllers/dbController';
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from './controllers/itemsController';

const router = Router();

router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', updateNode);

router.get('/db/health', getDbHealth);

router.get('/items', listItems);
router.post('/items', createItem);
router.get('/items/:id', getItem);
router.patch('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

export default router;
