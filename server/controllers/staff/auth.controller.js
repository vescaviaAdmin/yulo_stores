import argon2 from 'argon2';
import StaffMember from '../../models/StaffMember.js';
import * as authService from '../../services/auth.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const staffLogin = asyncHandler(async (req, res) => {
  const { restaurantId, pin } = req.body;

  const staffList = await StaffMember.find({ restaurantId, isActive: true });

  let authenticated = null;
  for (const staff of staffList) {
    try {
      const match = await argon2.verify(staff.pinHash, pin);
      if (match) { authenticated = staff; break; }
    } catch {
      // malformed hash — skip this staff member
    }
  }

  if (!authenticated) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid PIN');
  }

  const staffToken = authService.generateStaffToken(
    authenticated._id,
    authenticated.role,
    authenticated.restaurantId
  );

  sendSuccess(res, 200, 'Login successful', {
    staffToken,
    role: authenticated.role,
    name: authenticated.name,
    restaurantId: authenticated.restaurantId,
  });
});

export const staffLogout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    await authService.blacklistToken(header.slice(7));
  }
  sendSuccess(res, 200, 'Logged out', null);
});
