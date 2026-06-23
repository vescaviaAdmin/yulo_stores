import mongoose from 'mongoose';

const loyaltyProgramSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, unique: true },
    name: { type: String },
    isActive: { type: Boolean, default: false },
    pointsPerRupee: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('LoyaltyProgram', loyaltyProgramSchema);
