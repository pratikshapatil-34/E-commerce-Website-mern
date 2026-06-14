import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
} from '../controllers/wishlistController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

router.route('/:productId/move-to-cart')
  .post(moveToCart);

export default router;
