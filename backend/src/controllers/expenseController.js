import * as expenseService from '../services/expenseService.js';

export const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body, req.user._id);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

export const getExpenses = async (req, res, next) => {
  try {
    const result = await expenseService.getExpenses(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    res.json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.params.id);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

export const getMonthlyExpenses = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const result = await expenseService.getMonthlyExpenses(year, month);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
