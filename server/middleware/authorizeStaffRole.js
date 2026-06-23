import { ApiError } from '../utils/ApiError.js';

export const authorizeStaffRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.staff?.role)) {
    throw new ApiError(403, 'FORBIDDEN', 'Insufficient role');
  }
  next();
};
