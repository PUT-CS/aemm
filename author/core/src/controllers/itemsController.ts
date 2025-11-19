import { Request, Response, NextFunction } from 'express';
import { all, get, runWithInfo, ensureTestItemsTable } from '../db/sqliteClient';
import { AppError } from '../middlewares/errorHandler';

interface ItemRow {
  id: number;
  name: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export async function listItems(_req: Request, res: Response, next: NextFunction) {
  try {
    await ensureTestItemsTable();
    // noinspection SqlResolve
    const items = await all<ItemRow>('SELECT id, name, value, created_at, updated_at FROM test_items ORDER BY id DESC;');
    res.json(items);
  } catch (err) {
    const error: AppError = err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}

export async function getItem(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureTestItemsTable();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' });
      return;
    }
    // noinspection SqlResolve
    const item = await get<ItemRow>('SELECT id, name, value, created_at, updated_at FROM test_items WHERE id = ?;', [id]);
    if (!item) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    const error: AppError = err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureTestItemsTable();
    const { name, value } = req.body || {};
    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: 'name is required' });
      return;
    }
    // noinspection SqlResolve
    const info = await runWithInfo('INSERT INTO test_items (name, value) VALUES (?, ?);', [name, value]);
    // noinspection SqlResolve
    const created = await get<ItemRow>('SELECT id, name, value, created_at, updated_at FROM test_items WHERE id = ?;', [info.lastID]);
    res.status(201).json(created);
  } catch (err) {
    const error: AppError = err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureTestItemsTable();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' });
      return;
    }
    const { name, value } = req.body || {};
    if (name && typeof name !== 'string') {
      res.status(400).json({ message: 'name must be string' });
      return;
    }
    if (value && typeof value !== 'string') {
      res.status(400).json({ message: 'value must be string' });
      return;
    }
    // noinspection SqlResolve
    await runWithInfo('UPDATE test_items SET name = COALESCE(?, name), value = COALESCE(?, value), updated_at = CURRENT_TIMESTAMP WHERE id = ?;', [name ?? null, value ?? null, id]);
    // noinspection SqlResolve
    const item = await get<ItemRow>('SELECT id, name, value, created_at, updated_at FROM test_items WHERE id = ?;', [id]);
    if (!item) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    const error: AppError = err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureTestItemsTable();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' });
      return;
    }
    // noinspection SqlResolve
    const info = await runWithInfo('DELETE FROM test_items WHERE id = ?;', [id]);
    if (!info.changes) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    const error: AppError = err instanceof Error ? err : new Error('Unknown error');
    error.status = 500;
    next(error);
  }
}
