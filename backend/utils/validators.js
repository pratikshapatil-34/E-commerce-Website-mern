import validator from 'validator';

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email');
  }

  if (!password) {
    errors.push('Please provide a password');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

export const validateProduct = (req, res, next) => {
  const { name, description, price, category, brand, stock } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Product name must be at least 3 characters');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!price || price < 0) {
    errors.push('Please provide a valid price');
  }

  if (!category) {
    errors.push('Please select a category');
  }

  if (!brand || brand.trim().length < 2) {
    errors.push('Brand name is required');
  }

  if (stock === undefined || stock < 0) {
    errors.push('Please provide a valid stock quantity');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

export const validateOrder = (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;
  const errors = [];

  if (!shippingAddress) {
    errors.push('Shipping address is required');
  } else {
    if (!shippingAddress.street) errors.push('Street address is required');
    if (!shippingAddress.city) errors.push('City is required');
    if (!shippingAddress.state) errors.push('State is required');
    if (!shippingAddress.zipCode) errors.push('Zip code is required');
    if (!shippingAddress.country) errors.push('Country is required');
  }

  if (!paymentMethod) {
    errors.push('Payment method is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

export const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;
  const errors = [];

  if (!rating || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (!comment || comment.trim().length < 3) {
    errors.push('Comment must be at least 3 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

export const validateAddress = (req, res, next) => {
  const { street, city, state, zipCode, country } = req.body;
  const errors = [];

  if (!street || street.trim().length < 3) {
    errors.push('Street address is required');
  }

  if (!city || city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!state || state.trim().length < 2) {
    errors.push('State is required');
  }

  if (!zipCode || !validator.isPostalCode(zipCode, 'any')) {
    errors.push('Valid zip code is required');
  }

  if (!country || country.trim().length < 2) {
    errors.push('Country is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};
