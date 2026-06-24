import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadBuffer = ({ buffer, folder, publicId }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

export { cloudinary };
