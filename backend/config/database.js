import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create default admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@shopverse.com' });

    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@shopverse.com',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('Default admin user created: admin@shopverse.com');
    }

    // Create default categories if not exist
    const categoriesCount = await Category.countDocuments();

    if (categoriesCount === 0) {
      const defaultCategories = [
        { name: 'Electronics', description: 'Electronic gadgets and devices' },
        { name: 'Fashion', description: 'Clothing, shoes, and accessories' },
        { name: 'Home & Kitchen', description: 'Home appliances and kitchenware' },
        { name: 'Sports', description: 'Sports equipment and accessories' },
        { name: 'Books', description: 'Books and educational materials' },
        { name: 'Beauty', description: 'Beauty and personal care products' },
      ];

      await Category.insertMany(defaultCategories);
      console.log('Default categories created');
    }
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
