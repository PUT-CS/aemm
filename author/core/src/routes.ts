import express, { Router } from 'express';
import config from './config/config';
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
import { requireAdmin } from './middlewares/requireAdmin';

const router = Router();

router.post('/login', login);
router.get('/scrtree', getTree);
router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', requireAuth, createNode);
router.patch('/scr*queryPath', requireAuth, editNode);
router.post(
  '/scr*queryPath',
  requireAuth,
  express.raw({ type: () => true, limit: config.maxUploadSize }),
  uploadAsset,
);
router.delete('/scr*queryPath', requireAuth, deleteNode);

router.get('/backup*queryPath', requireAuth, getBackup);
router.post('/backup*queryPath', requireAuth, setBackup);

router.get('/users', requireAuth, requireAdmin, fetchUsers);
router.post('/users', requireAuth, requireAdmin, createUser);
router.get('/users/:name', requireAuth, requireAdmin, getUser);
router.patch('/users/:name', requireAuth, requireAdmin, updateUser);
router.delete('/users/:name', requireAuth, requireAdmin, deleteUser);

export default router;
