import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileBuffer, folder) => {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(fileBuffer);
  });
  return { url: result.secure_url, publicId: result.public_id };
};

export const destroyImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId).catch(() => {});
};

export { cloudinary };
