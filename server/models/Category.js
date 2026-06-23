import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ restaurantId: 1, displayOrder: 1 });

export default mongoose.model('Category', categorySchema);
