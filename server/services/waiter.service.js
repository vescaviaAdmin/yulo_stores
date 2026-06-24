import Table from '../models/Table.js';
import TableSession from '../models/TableSession.js';
import { ApiError } from '../utils/ApiError.js';

export const scanTable = async ({ restaurantId, qrToken, staffId }) => {
  const table = await Table.findOne({
    restaurantId,
    'qrCode.url': { $regex: qrToken },
    isActive: true,
  }).lean();

  if (!table) throw new ApiError(404, 'NOT_FOUND', 'Table not found');
  if (table.qrCode?.status === 'void') throw new ApiError(400, 'QR_VOID', 'QR code has been voided');

  let session = await TableSession.findOne({ tableId: table._id, status: 'open' });
  if (!session) {
    session = await TableSession.create({ restaurantId, tableId: table._id, waiterId: staffId });
  }

  await session.populate('orders');

  return { table, session };
};
