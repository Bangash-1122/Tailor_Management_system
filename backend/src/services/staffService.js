import Staff from '../models/Staff.js';
import { AppError } from '../utils/AppError.js';

export const createStaff = async (data) => Staff.create(data);

export const getStaff = async ({ role, status, page = 1, limit = 10 }) => {
  const query = {};
  if (role) query.role = role;
  if (status !== undefined) query.status = status === 'true';

  const skip = (page - 1) * limit;
  const [staff, total] = await Promise.all([
    Staff.find(query).populate('userId', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Staff.countDocuments(query),
  ]);

  return { staff, total, page, pages: Math.ceil(total / limit) };
};

export const updateStaff = async (id, data) => {
  const member = await Staff.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!member) throw new AppError('Staff member not found', 404);
  return member;
};

export const deleteStaff = async (id) => {
  const member = await Staff.findByIdAndDelete(id);
  if (!member) throw new AppError('Staff member not found', 404);
  return member;
};
