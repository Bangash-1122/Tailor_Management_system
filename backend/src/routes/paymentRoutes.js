import { Router } from 'express';
import { body } from 'express-validator';
import { createPayment, getPayments, getPayment } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('admin', 'manager', 'receptionist'),
  [
    body('customerId').notEmpty().withMessage('Customer required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
    validate,
  ],
  createPayment
);

router.get('/', authorize('admin', 'manager', 'receptionist'), getPayments);
router.get('/:id', authorize('admin', 'manager', 'receptionist'), getPayment);

export default router;
