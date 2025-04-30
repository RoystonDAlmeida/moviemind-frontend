import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      {/* Adjust min-h value based on your header/footer height if needed */}
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-4xl font-bold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-slate-400 mb-6">
        Oops! The page you're looking for doesn't seem to exist.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;
