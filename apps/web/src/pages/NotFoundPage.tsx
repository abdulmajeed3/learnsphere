import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-8xl font-bold text-primary-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
