import { Router } from 'express';
import multer from 'multer';
import { getSettings, updateSettings, getHours, updateHours, getDelivery, updateDelivery } from '../../controllers/owner/settings.controller.js';

const router = Router({ mergeParams: true });

// Accepts optional logo (2 MB) and banner (5 MB) in a single multipart request
const brandUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

router.get('/', getSettings);
router.patch('/', brandUpload, updateSettings);
router.get('/hours', getHours);
router.patch('/hours', updateHours);
router.get('/delivery', getDelivery);
router.patch('/delivery', updateDelivery);

export default router;
