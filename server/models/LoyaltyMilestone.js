import mongoose from 'mongoose';

const loyaltyMilestoneSchema = new mongoose.Schema(
  {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoyaltyProgram', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId },
    offerName: { type: String },
    rewardType: {
      type: String,
      enum: ['free_item', 'flat_amount', 'percentage', 'tablewise'],
    },
    freeItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', default: null },
    freeItemName: { type: String, default: null },
    rewardValue: { type: Number, default: null },
    minimumOrderValue: { type: Number },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

loyaltyMilestoneSchema.index({ programId: 1 });

export default mongoose.model('LoyaltyMilestone', loyaltyMilestoneSchema);
