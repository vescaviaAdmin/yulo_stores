import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number },
    unit: { type: String },
    cost: { type: Number },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    image: { type: String },
    prepTime: { type: Number },
    foodType: { type: String, enum: ['veg', 'non_veg', 'vegan'], required: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, default: null },
    ingredients: [ingredientSchema],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.virtual('effectivePrice').get(function () {
  return this.discountedPrice ?? this.sellingPrice;
});

menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

menuItemSchema.index({ restaurantId: 1, categoryId: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text' });

export default mongoose.model('MenuItem', menuItemSchema);
