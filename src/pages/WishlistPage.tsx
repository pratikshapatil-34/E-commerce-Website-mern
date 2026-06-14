import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import Button from '../components/common/Button';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleAddAllToCart = () => {
    items.forEach((product) => addToCart(product, 1));
    toast.success('All items added to cart!');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Heart className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Save items you love by clicking the heart icon on products.
          </p>
          <Link to="/products">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Explore Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Wishlist
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleAddAllToCart}
              leftIcon={<ShoppingCart className="w-4 h-4" />}
            >
              Add All to Cart
            </Button>
            <Button
              variant="ghost"
              onClick={clearWishlist}
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
