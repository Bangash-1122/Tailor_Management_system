import Expense from '../models/Expense.js';
import { AppError } from '../utils/AppError.js';

export const createExpense = async (data, userId) => {
  return Expense.create({ ...data, createdBy: userId });
};

export const getExpenses = async ({ category, startDate, endDate, page = 1, limit = 10 }) => {
  const query = {};
  if (category) query.category = category;
  if (startDate || endDate) {
    query.expenseDate = {};
    if (startDate) query.expenseDate.$gte = new Date(startDate);
    if (endDate) query.expenseDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [expenses, total] = await Promise.all([
    Expense.find(query).populate('createdBy', 'name').sort({ expenseDate: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(query),
  ]);

  return { expenses, total, page, pages: Math.ceil(total / limit) };
};

export const updateExpense = async (id, data) => {
  const expense = await Expense.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!expense) throw new AppError('Expense not found', 404);
  return expense;
};

export const deleteExpense = async (id) => {
  const expense = await Expense.findByIdAndDelete(id);
  if (!expense) throw new AppError('Expense not found', 404);
  return expense;
};

export const getMonthlyExpenses = async (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const result = await Expense.aggregate([
    { $match: { expenseDate: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ]);
  const total = result.reduce((sum, r) => sum + r.total, 0);
  return { breakdown: result, total };
};
