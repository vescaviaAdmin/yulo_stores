import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    type: {
      type: String,
      enum: ['percentage', 'flat_amount', 'free_item', 'tablewise'],
      required: true,
    },
    offerName: { type: String, required: true },
    code: { type: String, default: null },
    percentage: { type: Number, default: null },
    flatAmount: { type: Number, default: null },
    freeItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', default: null },
    freeItemName: { type: String, default: null },
    applicableTableNumbers: [String],
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    applicableSubCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
    applicableItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    minimumOrderValue: { type: Number, default: 0 },
    applicableTo: { type: String, enum: ['dine_in', 'delivery', 'both'], default: 'both' },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['draft', 'active', 'expired'], default: 'draft' },
  },
  { timestamps: true }
);

discountSchema.index({ restaurantId: 1, status: 1 });
discountSchema.index({ code: 1, restaurantId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Discount', discountSchema);
