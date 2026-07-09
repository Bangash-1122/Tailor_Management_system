import { Router } from 'express';
import { body } from 'express-validator';
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getMonthlyExpenses,
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('category').notEmpty().withMessage('Category required'),
    body('title').notEmpty().withMessage('Title required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
    validate,
  ],
  createExpense
);

router.get('/', authorize('admin', 'manager'), getExpenses);
router.get('/monthly', authorize('admin', 'manager'), getMonthlyExpenses);
router.put('/:id', authorize('admin', 'manager'), updateExpense);
router.delete('/:id', authorize('admin'), deleteExpense);

export default router;
