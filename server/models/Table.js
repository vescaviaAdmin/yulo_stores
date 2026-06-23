import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    identifier: { type: String, required: true },
    capacity: { type: Number },
    qrCode: {
      url: { type: String },
      imageUrl: { type: String },
      status: { type: String, enum: ['active', 'void'], default: 'active' },
      generatedAt: { type: Date },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, identifier: 1 }, { unique: true });

export default mongoose.model('Table', tableSchema);
