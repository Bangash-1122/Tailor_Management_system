import { Router } from 'express';
import { body } from 'express-validator';
import {
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('admin', 'manager'),
  [body('name').notEmpty().withMessage('Name required'), validate],
  createStaff
);

router.get('/', authorize('admin', 'manager'), getStaff);
router.put('/:id', authorize('admin', 'manager'), updateStaff);
router.delete('/:id', authorize('admin'), deleteStaff);

export default router;
