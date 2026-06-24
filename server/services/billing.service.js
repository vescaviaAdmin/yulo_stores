import Bill from '../models/Bill.js';
import TableSession from '../models/TableSession.js';
import Table from '../models/Table.js';
import Discount from '../models/Discount.js';
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import { ApiError } from '../utils/ApiError.js';
import { notifyService } from './notify.service.js';

export const assembleBill = async (tableSessionId) => {
  const session = await TableSession.findById(tableSessionId).populate('orders').lean();
  if (!session) throw new ApiError(404, 'NOT_FOUND', 'Session not found');

  const restaurant = await Restaurant.findById(session.restaurantId).lean();

  const batches = session.orders.map((order) => ({
    batchNumber: order.batchNumber,
    orderId: order._id,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      lineTotal: i.price * i.quantity,
    })),
    batchTotal: order.subtotal,
    placedAt: order.createdAt,
  }));

  const subtotal = batches.reduce((sum, b) => sum + b.batchTotal, 0);
  const gstPercent = restaurant.settings.gstPercent;
  const gstAmount = subtotal * (gstPercent / 100);
  const serviceChargePercent = restaurant.settings.serviceChargePercent;
  const serviceChargeAmount = subtotal * (serviceChargePercent / 100);
  const grandTotal = subtotal + gstAmount + serviceChargeAmount;

  const bill = await Bill.findOneAndUpdate(
    { tableSessionId },
    {
      restaurantId: session.restaurantId,
      tableSessionId,
      batches,
      subtotal,
      gstPercent,
      gstAmount,
      serviceChargePercent,
      serviceChargeAmount,
      grandTotal,
    },
    { upsert: true, new: true }
  );

  notifyService.billUpdated({ ...bill.toObject(), tableId: session.tableId });
  return bill;
};

export const applyDiscount = async ({ billId, discountCode, restaurantId }) => {
  const bill = await Bill.findById(billId);
  if (!bill || bill.status !== 'open') {
    throw new ApiError(404, 'NOT_FOUND', 'Bill not found');
  }

  const discount = await Discount.findOne({
    code: discountCode,
    restaurantId,
    status: 'active',
  });
  if (!discount) {
    throw new ApiError(404, 'NOT_FOUND', 'Discount code not found or inactive');
  }

  const now = new Date();
  if (now < discount.startDate || now > discount.endDate) {
    throw new ApiError(400, 'DISCOUNT_EXPIRED', 'This offer has expired');
  }

  if (bill.subtotal < discount.minimumOrderValue) {
    throw new ApiError(
      400,
      'DISCOUNT_MIN_VALUE',
      `Minimum order value is ₹${discount.minimumOrderValue}`
    );
  }

  let deduction = 0;
  if (discount.type === 'percentage') {
    deduction = bill.subtotal * (discount.percentage / 100);
  } else if (discount.type === 'flat_amount') {
    deduction = discount.flatAmount;
  } else if (discount.type === 'free_item') {
    const freeItem = await MenuItem.findById(discount.freeItemId).lean();
    deduction = freeItem?.sellingPrice ?? 0;
  } else if (discount.type === 'tablewise') {
    deduction = discount.flatAmount;
  }

  bill.discountsApplied.push({
    discountId: discount._id,
    code: discount.code,
    description: discount.offerName,
    amount: deduction,
  });

  bill.grandTotal =
    bill.subtotal +
    bill.gstAmount +
    bill.serviceChargeAmount -
    bill.discountsApplied.reduce((s, d) => s + d.amount, 0);

  await bill.save();
  return bill;
};

export const markPaid = async ({ billId, restaurantId, paymentMethod }) => {
  const bill = await Bill.findOne({ _id: billId, restaurantId, status: 'open' });
  if (!bill) throw new ApiError(404, 'NOT_FOUND', 'Bill not found or already settled');

  const now = new Date();
  bill.status = 'paid';
  bill.paidAt = now;
  bill.paidBy = paymentMethod;
  await bill.save();

  const [session] = await Promise.all([
    TableSession.findByIdAndUpdate(
      bill.tableSessionId,
      { status: 'paid', closedAt: now },
      { new: false }
    ),
  ]);

  if (session?.tableId) {
    const table = await Table.findById(session.tableId).lean();
    if (table) notifyService.tableStatusChanged(restaurantId, table, 'paid');
  }

  return bill;
};
