import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank', 'card', 'EasyPaisa', 'JazzCash', 'online'],
      default: 'cash',
    },
    paymentType: {
      type: String,
      enum: ['advance', 'partial', 'full', 'refund'],
      default: 'partial',
    },
    paymentDate: { type: Date, default: Date.now },
    transactionId: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

paymentSchema.index({ customerId: 1, paymentDate: -1 });

export default mongoose.model('Payment', paymentSchema);
