import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TableSession', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffMember', default: null },
    type: { type: String, enum: ['dine_in', 'delivery', 'takeaway'], required: true },
    tableNumber: { type: String, default: null },
    batchNumber: { type: Number, default: 1 },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    specialInstructions: { type: String, default: '' },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'online'], default: null },
    paymentIntentId: { type: String, default: null },
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      coordinates: { type: [Number], default: null },
    },
    estimatedDeliveryTime: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ tableSessionId: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, restaurantId: 1 });
orderSchema.index({ paymentIntentId: 1 }, { sparse: true });

export default mongoose.model('Order', orderSchema);
