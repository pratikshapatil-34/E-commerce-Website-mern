import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <span className="text-[200px] font-bold text-gray-100 dark:text-gray-800 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-32 h-32 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have gone on a shopping spree.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" leftIcon={<Home className="w-5 h-5" />}>
              Go Home
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" size="lg" leftIcon={<Search className="w-5 h-5" />}>
              Browse Products
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-400 dark:text-gray-500">
          If you believe this is an error, please{' '}
          <a href="mailto:support@shopverse.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
