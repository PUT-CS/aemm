import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from './routes/users';
import { writeNode } from './routes/writeNode';
import { getNode } from './routes/getNode';
import { getTree } from './routes/getTree';

const router = Router();

router.get('/scrtree', getTree);

router.get('/scr*queryPath', getNode);

router.put('/scr*queryPath', writeNode);

router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:name', getUser);
router.patch('/users/:name', updateUser);
router.delete('/users/:name', deleteUser);

export default router;
