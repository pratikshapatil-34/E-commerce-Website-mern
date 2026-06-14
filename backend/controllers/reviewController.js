import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get reviews for product
// @route   GET /api/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.query;

  let query = {};
  if (productId) query.product = productId;

  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate('product', 'name');

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, title, comment } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user.id,
  });

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this product', 400));
  }

  // Check if user has purchased this product (for verified purchase)
  const order = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    status: 'delivered',
  });

  // Create review
  const review = await Review.create({
    product: productId,
    user: req.user.id,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!order,
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Make sure review belongs to user
  if (review.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this review', 403));
  }

  review = await Review.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Review updated',
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Review deleted',
  });
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
export const markReviewHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Check if user already marked as helpful
  if (review.helpful.users.includes(req.user.id)) {
    return next(new ErrorResponse('You already marked this review as helpful', 400));
  }

  review.helpful.users.push(req.user.id);
  review.helpful.count += 1;
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review marked as helpful',
    data: review,
  });
});
