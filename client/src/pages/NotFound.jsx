import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[160px] font-extrabold leading-none bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full gradient-primary opacity-10 blur-xl animate-pulse"></div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8 leading-relaxed">
          Oops! Looks like this page got lost too. Don't worry – we're great at finding things.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn btn-primary px-6">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/browse" className="btn btn-secondary px-6">
            <Search className="w-4 h-4" /> Browse Items
          </Link>
        </div>
      </div>
    </div>
  );
}
