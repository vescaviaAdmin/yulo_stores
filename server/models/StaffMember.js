import mongoose from 'mongoose';

const staffMemberSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    staffCode:    { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['waiter', 'chef'], required: true },
    pinHash: { type: String, required: true },
    email: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// staffCode unique per restaurant — O(1) lookup on login
staffMemberSchema.index({ restaurantId: 1, staffCode: 1 }, { unique: true });
staffMemberSchema.index({ restaurantId: 1, role: 1 });

export default mongoose.model('StaffMember', staffMemberSchema);
