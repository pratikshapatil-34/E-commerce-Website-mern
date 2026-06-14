import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../controllers/cartController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/coupon')
  .post(applyCoupon)
  .delete(removeCoupon);

router.route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;
