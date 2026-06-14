import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateReview } from '../utils/validators.js';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from '../controllers/reviewController.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getReviews);

router.route('/:id')
  .get(getReview);

// Protected routes
router.use(protect);

router.route('/')
  .post(validateReview, createReview);

router.route('/:id')
  .put(updateReview)
  .delete(deleteReview);

router.route('/:id/helpful')
  .put(markReviewHelpful);

export default router;
