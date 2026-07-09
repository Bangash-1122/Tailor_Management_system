import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('admin', 'manager', 'receptionist'),
  [
    body('customerId').notEmpty().withMessage('Customer required'),
    body('deliveryDate').notEmpty().withMessage('Delivery date required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    validate,
  ],
  createOrder
);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('admin', 'manager', 'receptionist', 'tailor'), updateOrderStatus);
router.put('/:id', authorize('admin', 'manager', 'receptionist'), updateOrder);
router.delete('/:id', authorize('admin'), deleteOrder);

export default router;
