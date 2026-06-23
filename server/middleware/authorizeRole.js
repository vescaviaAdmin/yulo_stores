import { ApiError } from '../utils/ApiError.js';

export const authorizeRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    throw new ApiError(403, 'FORBIDDEN', 'Insufficient role');
  }
  next();
};
