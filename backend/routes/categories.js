import express from 'express';
import {
  getCategories,
  getCategory,
  getCategoryTree,
} from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getCategories);

router.route('/tree')
  .get(getCategoryTree);

router.route('/:id')
  .get(getCategory);

export default router;
