import User from '../models/User.js';
import Category from '../models/Category.js';

// Create default admin user
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@shopverse.com' });

    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@shopverse.com',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
      });
      console.log('Default admin user created: admin@shopverse.com / Admin@123');
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

// Create default categories
const createCategories = async () => {
  try {
    const count = await Category.countDocuments();

    if (count === 0) {
      const defaultCategories = [
        { name: 'Electronics', description: 'Electronic gadgets and devices', image: { url: 'https://images.pexels.com/photos/3560564/pexels-photo-3560564.jpeg?auto=compress&cs=tinysrgb&w=400' } },
        { name: 'Fashion', description: 'Clothing, shoes, and accessories', image: { url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400' } },
        { name: 'Home & Kitchen', description: 'Home appliances and kitchenware', image: { url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400' } },
        { name: 'Sports', description: 'Sports equipment and accessories', image: { url: 'https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=400' } },
        { name: 'Books', description: 'Books and educational materials', image: { url: 'https://images.pexels.com/photos/2098490/pexels-photo-2098490.jpeg?auto=compress&cs=tinysrgb&w=400' } },
        { name: 'Beauty', description: 'Beauty and personal care products', image: { url: 'https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg?auto=compress&cs=tinysrgb&w=400' } },
      ];

      await Category.insertMany(defaultCategories);
      console.log('Default categories created');
    }
  } catch (error) {
    console.error('Error creating categories:', error.message);
  }
};

// Initialize database
const initDatabase = async () => {
  await createAdminUser();
  await createCategories();
};

export {
  createAdminUser,
  createCategories,
  initDatabase,
};
