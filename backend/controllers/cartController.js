import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.product',
    select: 'name price images stock isActive',
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Calculate totals
  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Add to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check stock
  if (product.stock < quantity) {
    return next(new ErrorResponse('Insufficient stock available', 400));
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Check if product already in cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      return next(new ErrorResponse('Insufficient stock available', 400));
    }
    existingItem.quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
    });
  }

  // Calculate totals
  cart.calculateTotals();
  await cart.save();

  // Return populated cart
  cart = await cart.populate({
    path: 'items.product',
    select: 'name price images stock',
  });

  res.status(200).json({
    success: true,
    message: 'Product added to cart',
    data: cart,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new ErrorResponse('Invalid quantity', 400));
  }

  const product = await Product.findById(req.params.productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse('Insufficient stock available', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const item = cart.items.find(
    (item) => item.product.toString() === req.params.productId
  );

  if (!item) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  item.quantity = quantity;
  item.price = product.price;

  cart.calculateTotals();
  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name price images stock',
  });

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: cart,
  });
});

// @desc    Remove from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  cart.calculateTotals();
  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name price images stock',
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: cart,
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (cart) {
    cart.items = [];
    cart.calculateTotals();
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: cart || { items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 },
  });
});

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) {
    return next(new ErrorResponse('Invalid coupon code', 400));
  }

  if (!coupon.isValid()) {
    return next(new ErrorResponse('Coupon has expired or reached usage limit', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart is empty', 400));
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (cart.subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }

  // Check minimum order amount
  if (cart.subtotal < coupon.minOrderAmount) {
    return next(
      new ErrorResponse(
        `Minimum order amount of $${coupon.minOrderAmount} required`,
        400
      )
    );
  }

  cart.coupon = {
    code: coupon.code,
    discount,
  };

  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    data: cart,
  });
});

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (cart) {
    cart.coupon = undefined;
    cart.calculateTotals();
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Coupon removed',
    data: cart,
  });
});
