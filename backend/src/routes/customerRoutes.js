import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('admin', 'manager', 'receptionist'),
  [
    body('name').notEmpty().withMessage('Name required'),
    body('phone').notEmpty().withMessage('Phone required'),
    validate,
  ],
  createCustomer
);

router.get('/', authorize('admin', 'manager', 'receptionist'), getCustomers);
router.get('/:id', authorize('admin', 'manager', 'receptionist'), getCustomer);
router.put('/:id', authorize('admin', 'manager', 'receptionist'), updateCustomer);
router.delete('/:id', authorize('admin'), deleteCustomer);

export default router;
