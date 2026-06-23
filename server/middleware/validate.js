import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid input', result.error.flatten());
  }
  req.body = result.data;
  next();
};
