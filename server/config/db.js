import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 5;

export async function connectDB() {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('MongoDB connected');
      break;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.error('MongoDB connection failed after max retries:', err.message);
        process.exit(1);
      }
      const delay = 1000 * Math.pow(2, attempt);
      console.warn(`MongoDB connection failed. Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
}
