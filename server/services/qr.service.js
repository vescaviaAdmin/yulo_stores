import qrcode from 'qrcode';
import { cloudinary } from './upload.service.js';
import Table from '../models/Table.js';

export const generateTableQR = async ({ restaurantId, tableId, tableNumber, baseUrl }) => {
  const menuUrl = `${baseUrl}/menu?restaurantId=${restaurantId}&tableNumber=${encodeURIComponent(tableNumber)}`;

  const dataUrl = await qrcode.toDataURL(menuUrl, { width: 300, margin: 2 });

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `yulostores/qr/${restaurantId}`,
    public_id: `table_${tableNumber}_${Date.now()}`,
  });

  await Table.findByIdAndUpdate(tableId, {
    'qrCode.url': menuUrl,
    'qrCode.imageUrl': result.secure_url,
    'qrCode.status': 'active',
    'qrCode.generatedAt': new Date(),
  });

  return { url: menuUrl, imageUrl: result.secure_url, tableNumber };
};
