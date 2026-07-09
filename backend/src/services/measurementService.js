import Measurement from '../models/Measurement.js';
import { AppError } from '../utils/AppError.js';

export const createMeasurement = async (data) => {
  const existing = await Measurement.findOne({ customerId: data.customerId, type: data.type })
    .sort({ version: -1 });
  const version = existing ? existing.version + 1 : 1;
  return Measurement.create({ ...data, version });
};

export const getMeasurements = async ({ customerId, type, page = 1, limit = 10 }) => {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (type) query.type = type;

  const skip = (page - 1) * limit;
  const [measurements, total] = await Promise.all([
    Measurement.find(query).populate('customerId', 'name phone customerCode').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Measurement.countDocuments(query),
  ]);

  return { measurements, total, page, pages: Math.ceil(total / limit) };
};

export const getMeasurementById = async (id) => {
  const measurement = await Measurement.findById(id).populate('customerId', 'name phone customerCode');
  if (!measurement) throw new AppError('Measurement not found', 404);
  return measurement;
};

export const updateMeasurement = async (id, data) => {
  const measurement = await Measurement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!measurement) throw new AppError('Measurement not found', 404);
  return measurement;
};

export const deleteMeasurement = async (id) => {
  const measurement = await Measurement.findByIdAndDelete(id);
  if (!measurement) throw new AppError('Measurement not found', 404);
  return measurement;
};
