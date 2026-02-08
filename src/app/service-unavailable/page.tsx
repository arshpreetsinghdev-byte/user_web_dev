import Link from 'next/link';

export default function ServiceUnavailablePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Service Unavailable
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          We're sorry, but our service is currently unavailable. 
          Our team is working to restore it as quickly as possible.
        </p>

        {/* Error Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-md mx-auto border border-gray-200">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-1">What happened?</h3>
              <p className="text-sm text-gray-600">
                Our backend service is not responding. This could be due to:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                <li>Scheduled maintenance</li>
                <li>Temporary network issues</li>
                <li>High traffic load</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/service-unavailable"
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </Link>
          
          <Link
            href="/"
            className="px-8 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm hover:shadow transform hover:-translate-y-0.5 duration-200"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Status Updates */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            For real-time updates, check our{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              status page
            </a>
            {' '}or contact{' '}
            <a href="mailto:support@example.com" className="text-primary hover:underline font-medium">
              support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
