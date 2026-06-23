import mongoose from 'mongoose';

const tableSessionSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    waiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffMember' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    batchCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['open', 'bill_requested', 'paid', 'cancelled'],
      default: 'open',
    },
    guestCount: { type: Number, default: 1 },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

tableSessionSchema.index({ tableId: 1, status: 1 });
tableSessionSchema.index({ restaurantId: 1, status: 1 });

export default mongoose.model('TableSession', tableSessionSchema);
