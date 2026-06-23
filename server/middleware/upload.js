import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const upload = (fieldName, maxSizeMB) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG and WebP are allowed'));
      }
    },
  }).single(fieldName);
