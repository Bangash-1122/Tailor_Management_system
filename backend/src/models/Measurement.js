import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    type: {
      type: String,
      enum: ['shirt', 'pant', 'kurta', 'shalwar', 'trouser', 'coat', 'waistcoat', 'sherwani', 'blazer', 'custom'],
      required: true,
    },
    measurements: {
      neck: Number,
      chest: Number,
      waist: Number,
      hip: Number,
      shoulder: Number,
      sleeve: Number,
      length: Number,
      bottom: Number,
      inseam: Number,
      thigh: Number,
      custom: mongoose.Schema.Types.Mixed,
    },
    notes: { type: String, trim: true },
    imageUrl: { type: String },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

measurementSchema.index({ customerId: 1, type: 1 });

export default mongoose.model('Measurement', measurementSchema);
