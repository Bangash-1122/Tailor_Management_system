import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['tailor', 'cutter', 'helper', 'receptionist'], default: 'tailor' },
    salary: { type: Number, default: 0, min: 0 },
    joiningDate: { type: Date, default: Date.now },
    status: { type: Boolean, default: true },
    assignedOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Staff', staffSchema);
