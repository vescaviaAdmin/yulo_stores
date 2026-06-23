import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

subCategorySchema.index({ categoryId: 1, displayOrder: 1 });

export default mongoose.model('SubCategory', subCategorySchema);
