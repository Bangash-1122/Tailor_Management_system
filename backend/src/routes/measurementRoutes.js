import { Router } from 'express';
import { body } from 'express-validator';
import {
  createMeasurement,
  getMeasurements,
  getMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../controllers/measurementController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('admin', 'manager', 'receptionist'),
  [
    body('customerId').notEmpty().withMessage('Customer required'),
    body('type').notEmpty().withMessage('Clothing type required'),
    validate,
  ],
  createMeasurement
);

router.get('/', authorize('admin', 'manager', 'receptionist', 'tailor'), getMeasurements);
router.get('/:id', authorize('admin', 'manager', 'receptionist', 'tailor'), getMeasurement);
router.put('/:id', authorize('admin', 'manager', 'receptionist'), updateMeasurement);
router.delete('/:id', authorize('admin'), deleteMeasurement);

export default router;
