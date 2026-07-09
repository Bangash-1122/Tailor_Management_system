import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerCode: { type: String, unique: true, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    notes: { type: String, trim: true },
    status: { type: Boolean, default: true },
    ledgerBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', phone: 'text', customerCode: 'text' });

export default mongoose.model('Customer', customerSchema);
