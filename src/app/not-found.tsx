import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="bg-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-300"
          >
            Go Home
          </Link>
          <Link 
            href="/directory" 
            className="border-2 border-purple-600 text-purple-600 font-medium py-3 px-6 rounded-lg hover:bg-purple-600 hover:text-white transition-colors duration-300"
          >
            Browse Directory
          </Link>
        </div>
        
        {/* Helpful links */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Pages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <Link href="/directory" className="text-purple-600 hover:underline">
              Business Directory
            </Link>
            <Link href="/deals" className="text-purple-600 hover:underline">
              Daily Deals
            </Link>
            <Link href="/proof-of-visit" className="text-purple-600 hover:underline">
              Proof of Visit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}