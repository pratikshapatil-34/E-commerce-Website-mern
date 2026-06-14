import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Truck, Shield, HeadphonesIcon, Star } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Loading';
import { products, categories } from '../data/dummyData';

export default function HomePage() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const newArrivals = products.slice(-4).reverse();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
              <TrendingUp className="w-4 h-4" />
              <span>Flash Sale - Up to 50% Off</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Discover Premium
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Quality Products
              </span>
            </h1>

            <p className="text-lg text-blue-100 mb-8 max-w-xl">
              Shop the latest trends in electronics, fashion, and home essentials. Free shipping on orders over $50.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/products?featured=true"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Free Shipping</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Orders over $50</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Secure Payment</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">100% Protected</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <HeadphonesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">24/7 Support</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Always Here</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Top Quality</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Curated Products</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Find what you're looking for</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-center">{category.name}</h3>
                <p className="text-xs text-gray-300 text-center">{category.productCount} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Handpicked for you</p>
          </div>
          <Link
            to="/products?featured=true"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.length > 0
            ? featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            : Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-6">
          <Link
            to="/products?category=Electronics"
            className="relative group overflow-hidden rounded-2xl shadow-lg"
          >
            <img
              src="https://images.pexels.com/photos/3560564/pexels-photo-3560564.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Electronics"
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent flex items-center">
              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full mb-3">
                  Up to 30% Off
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">Electronics Sale</h3>
                <p className="text-gray-200 mb-4">Latest gadgets at unbeatable prices</p>
                <span className="inline-flex items-center text-white font-medium group-hover:underline">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          <Link
            to="/products?category=Fashion"
            className="relative group overflow-hidden rounded-2xl shadow-lg"
          >
            <img
              src="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Fashion"
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-transparent flex items-center">
              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-pink-500 text-white text-sm font-medium rounded-full mb-3">
                  New Arrivals
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">Fashion Forward</h3>
                <p className="text-gray-200 mb-4">Discover the latest styles</p>
                <span className="inline-flex items-center text-white font-medium group-hover:underline">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Just landed in store</p>
          </div>
          <Link
            to="/products?sort=newest"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Newsletter</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Subscribe to get special offers, free giveaways, and amazing deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
