import Category from '../models/Category.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true })
    .sort('order name')
    .populate('parent', 'name');

  // Get product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const count = await Product.countDocuments({
        category: category._id,
        isActive: true,
      });
      return {
        ...category.toObject(),
        productCount: count,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categoriesWithCount,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate('parent', 'name');

  if (!category || !category.isActive) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Get product count
  const productCount = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });

  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      productCount,
    },
  });
});

// @desc    Get category tree (hierarchical)
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort('order name');

  // Build tree structure
  const buildTree = (categories, parentId = null) => {
    return categories
      .filter((cat) => String(cat.parent) === String(parentId))
      .map((cat) => ({
        ...cat.toObject(),
        children: buildTree(categories, cat._id),
      }));
  };

  const tree = buildTree(categories);

  res.status(200).json({
    success: true,
    data: tree,
  });
});
