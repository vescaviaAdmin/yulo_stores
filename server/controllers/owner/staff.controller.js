import argon2 from 'argon2';
import StaffMember from '../../models/StaffMember.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Auto-generate next staffCode for this restaurant: W01, W02 / C01, C02
async function nextStaffCode(restaurantId, role) {
  const prefix = role === 'chef' ? 'C' : 'W';
  const last = await StaffMember.findOne({ restaurantId, staffCode: new RegExp(`^${prefix}`) })
    .sort({ staffCode: -1 })
    .select('staffCode')
    .lean();
  if (!last) return `${prefix}01`;
  const num = parseInt(last.staffCode.slice(1), 10) + 1;
  return `${prefix}${String(num).padStart(2, '0')}`;
}

export const listStaff = asyncHandler(async (req, res) => {
  const staff = await StaffMember.find({ restaurantId: req.restaurant._id })
    .select('-pinHash')
    .lean();
  sendSuccess(res, 200, 'Staff members', { staff });
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, role, pin, email } = req.body;

  if (!name) throw new ApiError(400, 'VALIDATION_ERROR', 'name is required');
  if (!role || !['waiter', 'chef'].includes(role)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'role must be "waiter" or "chef"');
  }
  if (!pin || pin.length < 4 || pin.length > 8) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'pin must be 4–8 digits');
  }

  const staffCode = await nextStaffCode(req.restaurant._id, role);
  const pinHash   = await argon2.hash(pin, { type: argon2.argon2id });

  const member = await StaffMember.create({
    restaurantId: req.restaurant._id,
    staffCode,
    name,
    role,
    pinHash,
    email: email || null,
  });

  const out = member.toObject();
  delete out.pinHash;
  sendSuccess(res, 201, 'Staff member created', { staff: out });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { name, email, isActive, pin } = req.body;
  const updates = {};
  if (name     !== undefined) updates.name     = name;
  if (email    !== undefined) updates.email    = email;
  if (isActive !== undefined) updates.isActive = isActive;
  if (pin) {
    if (pin.length < 4 || pin.length > 8) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'pin must be 4–8 digits');
    }
    updates.pinHash = await argon2.hash(pin, { type: argon2.argon2id });
  }

  const member = await StaffMember.findOneAndUpdate(
    { _id: req.params.staffId, restaurantId: req.restaurant._id },
    { $set: updates },
    { new: true }
  ).select('-pinHash');

  if (!member) throw new ApiError(404, 'NOT_FOUND', 'Staff member not found');
  sendSuccess(res, 200, 'Staff member updated', { staff: member });
});

export const removeStaff = asyncHandler(async (req, res) => {
  const member = await StaffMember.findOneAndUpdate(
    { _id: req.params.staffId, restaurantId: req.restaurant._id },
    { $set: { isActive: false } },
    { new: true }
  );
  if (!member) throw new ApiError(404, 'NOT_FOUND', 'Staff member not found');
  sendSuccess(res, 200, 'Staff member deactivated', null);
});
