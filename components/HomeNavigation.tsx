/**
 * Home Navigation Component
 * Navigation bar for unauthenticated users on the home page
 */

'use client';

import Link from 'next/link';

export default function HomeNavigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-10">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              B2BCompare
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="#features"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Testimonials
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

