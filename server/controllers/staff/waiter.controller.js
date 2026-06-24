import { z } from 'zod';
import Table from '../../models/Table.js';
import TableSession from '../../models/TableSession.js';
import Bill from '../../models/Bill.js';
import * as waiterService from '../../services/waiter.service.js';
import * as menuService from '../../services/menu.service.js';
import * as orderService from '../../services/order.service.js';
import * as billingService from '../../services/billing.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const waiterOrderSchema = z.object({
  tableSessionId: z.string().min(1),
  items: z.array(z.object({
    menuItemId: z.string().min(1),
    quantity: z.number().int().min(1),
    note: z.string().optional(),
  })).min(1),
  specialInstructions: z.string().optional(),
});

export const scanTable = asyncHandler(async (req, res) => {
  const { qrToken } = req.body;
  if (!qrToken) throw new ApiError(400, 'VALIDATION_ERROR', 'qrToken is required');

  const data = await waiterService.scanTable({
    restaurantId: req.staff.restaurantId,
    qrToken,
    staffId: req.staff._id,
  });

  sendSuccess(res, 200, 'Table scanned', data);
});

export const getTables = asyncHandler(async (req, res) => {
  const [tables, sessions] = await Promise.all([
    Table.find({ restaurantId: req.staff.restaurantId, isActive: true }).lean(),
    TableSession.find({ restaurantId: req.staff.restaurantId, status: 'open' }).lean(),
  ]);

  const sessionMap = new Map(sessions.map((s) => [s.tableId.toString(), s]));
  const result = tables.map((t) => ({
    ...t,
    session: sessionMap.get(t._id.toString()) || null,
  }));

  sendSuccess(res, 200, 'Tables fetched', { tables: result });
});

export const getMenu = asyncHandler(async (req, res) => {
  const menu = await menuService.getMenu(req.staff.restaurantId);
  sendSuccess(res, 200, 'Menu', { menu });
});

export const createOrder = asyncHandler(async (req, res) => {
  const result = waiterOrderSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid order data', result.error.flatten());
  }

  const idempotencyKey = req.headers['idempotency-key'] || null;

  const order = await orderService.createOrder({
    ...result.data,
    restaurantId: req.staff.restaurantId,
    staffId: req.staff._id,
    type: 'dine_in',
    idempotencyKey,
  });

  const statusCode = order.duplicate ? 200 : 201;
  sendSuccess(res, statusCode, order.duplicate ? 'Duplicate — existing order returned' : 'Order placed', { order });
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await TableSession.find({
    restaurantId: req.staff.restaurantId,
    status: 'open',
  })
    .populate('orders')
    .lean();

  const result = sessions.map((s) => ({
    ...s,
    runningTotal: s.orders.reduce((sum, o) => sum + o.subtotal, 0),
  }));

  sendSuccess(res, 200, 'Active sessions', { sessions: result });
});

export const getBill = asyncHandler(async (req, res) => {
  const bill = await billingService.assembleBill(req.params.sessionId);
  sendSuccess(res, 200, 'Bill', { bill });
});

export const markPaid = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;
  if (!paymentMethod) throw new ApiError(400, 'VALIDATION_ERROR', 'paymentMethod is required');

  // Resolve billId from the session
  const session = await TableSession.findById(req.params.sessionId).lean();
  if (!session || session.restaurantId.toString() !== req.staff.restaurantId.toString()) {
    throw new ApiError(404, 'NOT_FOUND', 'Session not found');
  }

  const bill = await Bill.findOne({ tableSessionId: req.params.sessionId, status: 'open' }).lean();
  if (!bill) throw new ApiError(404, 'NOT_FOUND', 'No open bill for this session — call assemble first');

  const paid = await billingService.markPaid({
    billId: bill._id,
    restaurantId: req.staff.restaurantId,
    paymentMethod,
  });

  sendSuccess(res, 200, 'Bill marked as paid', { bill: paid });
});
