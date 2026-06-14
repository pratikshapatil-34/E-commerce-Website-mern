import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
    path: 'products',
    select: 'name price images stock rating reviews isActive',
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  }

  res.status(200).json({
    success: true,
    count: wishlist.products.length,
    data: wishlist.products,
  });
});

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Get or create wishlist
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  }

  // Check if product already in wishlist
  if (wishlist.products.includes(productId)) {
    return res.status(200).json({
      success: true,
      message: 'Product already in wishlist',
      data: wishlist,
    });
  }

  // Add product to wishlist
  wishlist.products.push(productId);
  await wishlist.save();

  await wishlist.populate({
    path: 'products',
    select: 'name price images stock rating reviews',
  });

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    data: wishlist.products,
  });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return next(new ErrorResponse('Wishlist not found', 404));
  }

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== req.params.productId
  );

  await wishlist.save();

  await wishlist.populate({
    path: 'products',
    select: 'name price images stock rating reviews',
  });

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    data: wishlist.products,
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (wishlist) {
    wishlist.products = [];
    await wishlist.save();
  }

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared',
    data: [],
  });
});

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/:productId/move-to-cart
// @access  Private
export const moveToCart = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product || !product.isActive) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Add to cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === req.params.productId
  );

  if (!existingItem) {
    cart.items.push({
      product: req.params.productId,
      quantity: 1,
      price: product.price,
    });
    cart.calculateTotals();
    await cart.save();
  }

  // Remove from wishlist
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId
    );
    await wishlist.save();
  }

  res.status(200).json({
    success: true,
    message: 'Product moved to cart',
  });
});
