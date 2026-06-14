import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProduct,
  getProductsByCategory,
  searchProducts,
  getRelatedProducts,
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getProducts);

router.route('/featured')
  .get(getFeaturedProducts);

router.route('/search')
  .get(searchProducts);

router.route('/category/:categoryId')
  .get(getProductsByCategory);

router.route('/:id')
  .get(getProduct);

router.route('/:id/related')
  .get(getRelatedProducts);

export default router;
