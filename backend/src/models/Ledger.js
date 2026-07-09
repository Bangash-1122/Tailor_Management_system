import mongoose from 'mongoose';

const ledgerSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ledgerSchema.index({ customerId: 1, date: -1 });

export default mongoose.model('Ledger', ledgerSchema);
