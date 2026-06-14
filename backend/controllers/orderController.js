import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendEmail, getEmailTemplate } from '../utils/sendEmail.js';

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .sort('-createdAt')
    .populate('items.product', 'name images');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'items.product',
    'name images price'
  );

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is order owner or admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.product',
    'name price images stock isActive'
  );

  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Your cart is empty', 400));
  }

  // Validate products and stock
  const orderItems = [];
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      return next(
        new ErrorResponse(`Product ${item.product?.name || 'unknown'} is no longer available`, 400)
      );
    }
    if (item.product.stock < item.quantity) {
      return next(
        new ErrorResponse(`Insufficient stock for ${item.product.name}`, 400)
      );
    }

    orderItems.push({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0]?.url || '',
      quantity: item.quantity,
      price: item.product.price,
    });
  }

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    tax: cart.tax,
    discount: cart.coupon?.discount || 0,
    total: cart.total,
    shippingAddress,
    paymentMethod,
    notes,
  });

  // Update product stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  // Clear cart
  cart.items = [];
  cart.coupon = undefined;
  cart.calculateTotals();
  await cart.save();

  // Send order confirmation email
  const user = req.user;
  const emailTemplate = getEmailTemplate('orderConfirmation', {
    name: user.name,
    orderNumber: order.orderNumber,
    total: order.total.toFixed(2),
    orderId: order._id,
  });
  sendEmail({
    email: user.email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  }).catch(console.error);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is order owner
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this order', 403));
  }

  // Check if order can be cancelled
  if (!['pending', 'processing'].includes(order.status)) {
    return next(new ErrorResponse('Order cannot be cancelled at this stage', 400));
  }

  // Update order status
  order.status = 'cancelled';
  await order.save();

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Private
export const getOrderByNumber = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
  }).populate('items.product', 'name images price');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Make sure user is order owner or admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});
