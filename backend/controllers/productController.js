import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import APIFeatures from '../utils/ApiFeatures.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Product.find({ isActive: true }),
    req.query
  )
    .search(['name', 'description', 'brand'])
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate([
      { path: 'category', select: 'name' },
      { path: 'createdBy', select: 'name' },
    ]);

  const products = await features.query;
  const pagination = await features.getPaginationMetadata(
    Product.countDocuments({ isActive: true })
  );

  res.status(200).json({
    success: true,
    data: products,
    pagination,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isActive: true, featured: true })
    .sort('-rating')
    .limit(8)
    .populate('category', 'name');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('createdBy', 'name');

  if (!product || !product.isActive) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Get reviews for this product
  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      ...product.toObject(),
      recentReviews: reviews,
    },
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const features = new APIFeatures(
    Product.find({ category: req.params.categoryId, isActive: true }),
    req.query
  )
    .search(['name', 'description', 'brand'])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;
  const pagination = await features.getPaginationMetadata(
    Product.countDocuments({ category: req.params.categoryId, isActive: true })
  );

  res.status(200).json({
    success: true,
    data: products,
    pagination,
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const products = await Product.find(
    { $text: { $search: q }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .populate('category', 'name');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .sort('-rating');

  res.status(200).json({
    success: true,
    data: relatedProducts,
  });
});
