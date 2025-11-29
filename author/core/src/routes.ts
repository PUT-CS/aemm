import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from './routes/users';
import { uploadAsset } from './routes/uploadAsset';
import { getNode } from './routes/getNode';
import { getTree } from './routes/getTree';
import { createNode, editNode } from './routes/updateNode';
import { deleteNode } from './routes/deleteNode';

const router = Router();

router.get('/scrtree', getTree);

router.get('/scr*queryPath', getNode);
router.put('/scr*queryPath', createNode);
router.patch('/scr*queryPath', editNode);
router.post('/scr*queryPath', uploadAsset);
router.delete('/scr*queryPath', deleteNode);

router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:name', getUser);
router.patch('/users/:name', updateUser);
router.delete('/users/:name', deleteUser);

export default router;
