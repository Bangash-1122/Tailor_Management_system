import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, unique: true, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    measurementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement' },
    assignedTailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    status: {
      type: String,
      enum: ['pending', 'cutting', 'stitching', 'trial', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    advanceAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
    stitchingNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, deliveryDate: 1 });
orderSchema.index({ customerId: 1 });

export default mongoose.model('Order', orderSchema);
