import { Router } from 'express';
import { getDbHealth } from './controllers/dbController';
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from './controllers/usersController';
import { uploadAsset } from './routes/uploadAsset';
import { getNode } from './routes/getNode';
import { getTree } from './routes/getTree';
import { updateNode } from './routes/updateNode';

const router = Router();

router.get('/scrtree', getTree);

router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', updateNode);

router.post('/scr*queryPath', uploadAsset);

router.get('/db/health', getDbHealth);

router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:name', getUser);
router.patch('/users/:name', updateUser);
router.delete('/users/:name', deleteUser);

export default router;
