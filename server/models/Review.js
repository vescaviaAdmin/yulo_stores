import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

reviewSchema.index({ restaurantId: 1, createdAt: -1 });

reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const [result] = await Review.aggregate([
    { $match: { restaurantId: this.restaurantId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await mongoose.model('Restaurant').findByIdAndUpdate(this.restaurantId, {
    avgRating: result?.avg ?? 0,
    totalRatings: result?.count ?? 0,
  });
});

export default mongoose.model('Review', reviewSchema);
