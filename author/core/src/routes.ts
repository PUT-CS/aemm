import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  fetchUsers,
  updateUser,
} from './routes/users';
import { uploadAsset } from './routes/uploadAsset';
import { getNode } from './routes/getNode';
import { getTree } from './routes/getTree';
import { createNode, editNode } from './routes/updateNode';
import { deleteNode } from './routes/deleteNode';
import { getBackup } from './routes/getBackup';
import { setBackup } from './routes/setBackup';
import { login } from './routes/login';
import { requireAuth } from './middlewares/requireAuth';

const router = Router();

router.post('/login', login);
router.get('/scrtree', getTree);
router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', requireAuth, createNode);
router.patch('/scr*queryPath', requireAuth, editNode);
router.post('/scr*queryPath', requireAuth, uploadAsset);
router.delete('/scr*queryPath', requireAuth, deleteNode);

router.get('/backup*queryPath', requireAuth, getBackup);
router.post('/backup*queryPath', requireAuth, setBackup);

router.get('/users', requireAuth, fetchUsers);
router.post('/users', requireAuth, createUser);
router.get('/users/:name', requireAuth, getUser);
router.patch('/users/:name', requireAuth, updateUser);
router.delete('/users/:name', requireAuth, deleteUser);

export default router;
