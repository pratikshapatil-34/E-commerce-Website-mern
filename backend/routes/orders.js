import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateOrder } from '../utils/validators.js';
import {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  getOrderByNumber,
} from '../controllers/orderController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getOrders)
  .post(validateOrder, createOrder);

router.route('/number/:orderNumber')
  .get(getOrderByNumber);

router.route('/:id')
  .get(getOrder);

router.route('/:id/cancel')
  .put(cancelOrder);

export default router;
