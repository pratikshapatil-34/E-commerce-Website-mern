import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import APIFeatures from '../utils/ApiFeatures.js';
import { deleteImage } from '../middleware/upload.js';
import { sendEmail, getEmailTemplate } from '../utils/sendEmail.js';

// ==================== PRODUCTS ====================

// @desc    Get all products (Admin)
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAdminProducts = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .search(['name', 'description', 'brand'])
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate('category', 'name');

  const products = await features.query;
  const pagination = await features.getPaginationMetadata(Product.countDocuments());

  res.status(200).json({
    success: true,
    data: products,
    pagination,
  });
});

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, originalPrice, category, brand, stock, featured, specifications } = req.body;

  // Validate category
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const product = await Product.create({
    name,
    description,
    price,
    originalPrice,
    category,
    brand,
    stock,
    featured,
    specifications,
    createdBy: req.user.id,
    images: req.imageUrls || [],
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Update fields
  const updates = { ...req.body };
  if (req.imageUrls) {
    updates.images = [...product.images, ...req.imageUrls];
  }

  product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Delete images from cloudinary
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (image.public_id) {
        await deleteImage(image.public_id);
      }
    }
  }

  // Soft delete - set isActive to false
  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// @desc    Delete product image
// @route   DELETE /api/admin/products/:id/images/:imageId
// @access  Private/Admin
export const deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const image = product.images.find(
    (img) => img.public_id === req.params.imageId
  );

  if (!image) {
    return next(new ErrorResponse('Image not found', 404));
  }

  await deleteImage(image.public_id);
  product.images = product.images.filter(
    (img) => img.public_id !== req.params.imageId
  );
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Image deleted',
    data: product,
  });
});

// ==================== USERS ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    User.find().select('-password'),
    req.query
  )
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate();

  const users = await features.query;
  const pagination = await features.getPaginationMetadata(User.countDocuments());

  res.status(200).json({
    success: true,
    data: users,
    pagination,
  });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Get user stats
  const orders = await Order.find({ user: user._id });
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      stats: {
        totalOrders: orders.length,
        totalSpent,
      },
    },
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const { name, role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, role, isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Don't allow deleting yourself
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// ==================== ORDERS ====================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Order.find().populate('user', 'name email'),
    req.query
  )
    .filter()
    .sort('-createdAt')
    .paginate();

  const orders = await features.query;
  const pagination = await features.getPaginationMetadata(Order.countDocuments());

  res.status(200).json({
    success: true,
    data: orders,
    pagination,
  });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  await order.save();

  // Send email if order is shipped
  if (status === 'shipped' && trackingNumber) {
    const emailTemplate = getEmailTemplate('orderShipped', {
      name: order.user.name,
      orderNumber: order.orderNumber,
      trackingNumber,
      orderId: order._id,
    });
    sendEmail({
      email: order.user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }).catch(console.error);
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: order,
  });
});

// ==================== DASHBOARD ====================

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get date ranges
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  // Total stats
  const totalUsers = await User.countDocuments({ isActive: true });
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  // Monthly stats
  const monthlyOrders = await Order.countDocuments({
    createdAt: { $gte: startOfMonth },
  });
  const monthlyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const lastMonthRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      },
    },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const monthlyUsers = await User.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  // Pending orders
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const processingOrders = await Order.countDocuments({ status: 'processing' });

  // Recent orders
  const recentOrders = await Order.find()
    .sort('-createdAt')
    .limit(5)
    .populate('user', 'name email');

  // Top products
  const topProducts = await Product.find({ isActive: true })
    .sort('-sold')
    .limit(5)
    .select('name price sold images');

  // Revenue chart data (last 7 days)
  const revenueData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue[0]?.total || 0,
      },
      monthly: {
        orders: monthlyOrders,
        revenue: monthlyRevenue[0]?.total || 0,
        newUsers: monthlyUsers,
        revenueGrowth:
          lastMonthRevenue[0]?.total && monthlyRevenue[0]?.total
            ? ((monthlyRevenue[0].total - lastMonthRevenue[0].total) /
                lastMonthRevenue[0].total) *
              100
            : 0,
      },
      pending: {
        orders: pendingOrders + processingOrders,
        pendingOrders,
        processingOrders,
      },
      recentOrders,
      topProducts,
      revenueData,
    },
  });
});

// ==================== CATEGORIES ====================

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create({
    ...req.body,
    image: req.imageUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const updates = { ...req.body };
  if (req.imageUrl) updates.image = req.imageUrl;

  category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({ category: req.params.id });
  if (productsCount > 0) {
    return next(
      new ErrorResponse(
        'Cannot delete category with products. Move or delete products first.',
        400
      )
    );
  }

  // Delete image from cloudinary
  if (category.image?.public_id) {
    await deleteImage(category.image.public_id);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
