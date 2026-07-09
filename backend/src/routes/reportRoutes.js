import { Router } from 'express';
import {
  getDashboard,
  getProfitLoss,
  getDeliveryReport,
  generateInvoice,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/dashboard', authorize('admin', 'manager', 'receptionist'), getDashboard);
router.get('/profit-loss', authorize('admin', 'manager'), getProfitLoss);
router.get('/delivery', authorize('admin', 'manager', 'receptionist'), getDeliveryReport);

export default router;

const invoiceRouter = Router();
invoiceRouter.use(protect);
invoiceRouter.get('/:orderId', authorize('admin', 'manager', 'receptionist'), generateInvoice);

export { invoiceRouter };
