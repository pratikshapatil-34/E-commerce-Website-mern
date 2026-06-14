import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadImage, uploadMultipleImages } from '../middleware/upload.js';
import { validateProduct } from '../utils/validators.js';
import {
  // Products
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  // Users
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  // Orders
  getOrders,
  updateOrderStatus,
  // Dashboard
  getDashboardStats,
  // Categories
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.route('/stats').get(getDashboardStats);

// Products
router
  .route('/products')
  .get(getAdminProducts)
  .post(uploadMultipleImages, validateProduct, createProduct);

router
  .route('/products/:id')
  .put(uploadMultipleImages, updateProduct)
  .delete(deleteProduct);

router.route('/products/:id/images/:imageId').delete(deleteProductImage);

// Users
router.route('/users').get(getUsers);
router.route('/users/:id').get(getUser).put(updateUser).delete(deleteUser);

// Orders
router.route('/orders').get(getOrders);
router.route('/orders/:id').put(updateOrderStatus);

// Categories
router
  .route('/categories')
  .post(uploadImage, createCategory);

router
  .route('/categories/:id')
  .put(uploadImage, updateCategory)
  .delete(deleteCategory);

export default router;
