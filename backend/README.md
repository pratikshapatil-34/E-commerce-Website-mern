# ShopVerse Backend

A complete E-commerce REST API built with Node.js, Express, and MongoDB using modern ES Modules.

## Features

- **Authentication**: JWT-based authentication with token refresh
- **User Management**: Registration, login, profile management, password reset
- **Products**: CRUD operations, search, filter, sort, categories, brands
- **Categories**: Hierarchical category structure
- **Cart**: Add/remove items, quantity management, coupon system
- **Wishlist**: Save favorite products
- **Orders**: Order creation, tracking, status management
- **Reviews**: Product reviews with ratings, helpful votes
- **Admin Panel**: User, product, order management, dashboard stats
- **Image Upload**: Cloudinary integration for image management
- **Security**: Helmet, rate limiting, XSS protection, HPP

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- Nodemailer for emails

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopverse
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

CLIENT_URL=http://localhost:5173
```

5. Start MongoDB (if using local):
```bash
mongod
```

6. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `PUT /api/auth/password` - Update password
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword/:token` - Reset password

### Products
- `GET /api/products` - Get all products (supports query params)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products
- `GET /api/products/:id` - Get single product
- `GET /api/products/:id/related` - Get related products
- `GET /api/products/category/:categoryId` - Products by category

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree
- `GET /api/categories/:id` - Get single category

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:productId` - Update quantity
- `DELETE /api/cart/:productId` - Remove from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/coupon` - Apply coupon
- `DELETE /api/cart/coupon` - Remove coupon

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist
- `DELETE /api/wishlist` - Clear wishlist
- `POST /api/wishlist/:productId/move-to-cart` - Move to cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `PUT /api/reviews/:id/helpful` - Mark as helpful

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/products` - All products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/orders/:id` - Update order status

## Query Parameters

### Products
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `category` - Filter by category ID
- `brand` - Filter by brand
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `rating` - Minimum rating
- `featured` - Featured only
- `sort` - Sort field (-price for descending)

Example: `GET /api/products?page=1&limit=10&brand=Apple&minPrice=100&sort=-price`

## Default Admin Account

After first run, a default admin is created:
- Email: `admin@shopverse.com`
- Password: `Admin@123`

## Project Structure

```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── categoryController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── reviewController.js
│   ├── wishlistController.js
│   └── adminController.js
├── middleware/
│   ├── async.js
│   ├── auth.js
│   ├── error.js
│   └── upload.js
├── models/
│   ├── Cart.js
│   ├── Category.js
│   ├── Coupon.js
│   ├── Order.js
│   ├── Product.js
│   ├── Review.js
│   ├── User.js
│   └── Wishlist.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── cart.js
│   ├── categories.js
│   ├── index.js
│   ├── orders.js
│   ├── products.js
│   ├── reviews.js
│   └── wishlist.js
├── utils/
│   ├── ApiFeatures.js
│   ├── ApiResponse.js
│   ├── errorResponse.js
│   ├── sendEmail.js
│   └── validators.js
├── data/
│   └── seeder.js
├── server.js
├── package.json
└── .env.example
```

## ES Modules

This project uses native ES Modules (`import`/`export`) instead of CommonJS (`require`/`module.exports`).

Key implementation details:
- `"type": "module"` in package.json
- All imports include `.js` extension for local files
- `__dirname` is reconstructed using `fileURLToPath` from the `url` module
- Named exports for better tree-shaking

## License

MIT
