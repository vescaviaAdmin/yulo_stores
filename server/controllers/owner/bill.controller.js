import Bill from '../../models/Bill.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const listBills = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { restaurantId: req.restaurant._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [bills, total] = await Promise.all([
    Bill.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Bill.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Bills', {
    bills,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

export const getBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findOne({
    _id: req.params.billId,
    restaurantId: req.restaurant._id,
  }).lean();
  if (!bill) throw new ApiError(404, 'NOT_FOUND', 'Bill not found');
  sendSuccess(res, 200, 'Bill', { bill });
});
