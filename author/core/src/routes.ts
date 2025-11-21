import { Router } from 'express';
import { getNode, getTree, updateNode } from './controllers/nodeController';
import { getDbHealth } from './controllers/dbController';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from './controllers/usersController';

const router = Router();

router.get('/scrtree', getTree);

router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', updateNode);

router.get('/db/health', getDbHealth);

router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:name', getUser);
router.patch('/users/:name', updateUser);
router.delete('/users/:name', deleteUser);

export default router;
