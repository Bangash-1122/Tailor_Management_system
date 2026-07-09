import { Router } from 'express';
import { getLedger } from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/:customerId', authorize('admin', 'manager', 'receptionist'), getLedger);

export default router;
