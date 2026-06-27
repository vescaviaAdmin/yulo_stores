import argon2 from 'argon2';
import StaffMember from '../../models/StaffMember.js';
import * as authService from '../../services/auth.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const staffLogin = asyncHandler(async (req, res) => {
  const { restaurantId, staffCode, pin } = req.body;

  if (!staffCode) throw new ApiError(400, 'VALIDATION_ERROR', 'staffCode is required');
  if (!pin)       throw new ApiError(400, 'VALIDATION_ERROR', 'pin is required');

  // O(1) — single indexed lookup, no loop
  const staff = await StaffMember.findOne({
    restaurantId,
    staffCode: staffCode.toUpperCase(),
    isActive: true,
  });

  if (!staff) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid staff code or PIN');

  const valid = await argon2.verify(staff.pinHash, pin);
  if (!valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid staff code or PIN');

  const staffToken = authService.generateStaffToken(
    staff._id,
    staff.role,
    staff.restaurantId
  );

  sendSuccess(res, 200, 'Login successful', {
    staffToken,
    role: staff.role,
    name: staff.name,
    staffCode: staff.staffCode,
    restaurantId: staff.restaurantId,
  });
});

export const staffLogout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    await authService.blacklistToken(header.slice(7));
  }
  sendSuccess(res, 200, 'Logged out', null);
});
