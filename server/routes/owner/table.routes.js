import { Router } from 'express';
import {
  listTables, createTable, updateTable, deleteTable, generateQR, voidQR,
} from '../../controllers/owner/table.controller.js';

const router = Router({ mergeParams: true });

router.get('/', listTables);
router.post('/', createTable);
router.patch('/:tableId', updateTable);
router.delete('/:tableId', deleteTable);
router.post('/:tableId/qr', generateQR);
router.patch('/:tableId/qr/void', voidQR);

export default router;
