"use client";

import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export default function Home() {
  const [user] = useAuthState(auth);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white py-20 -mt-8 -mx-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="text-yellow-300">ThikaBizHub</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Your premier platform for discovering, connecting, and thriving with local businesses in Thika, Kenya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/directory" className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 text-lg">
              Explore Directory
            </Link>
            <Link href="/deals" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-purple-600 transition-colors duration-300 text-lg">
              View Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Discover What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Smart Directory</h3>
              <p className="text-gray-600 mb-4">Find verified businesses with detailed contact information, operating hours, and customer reviews.</p>
              <Link href="/directory" className="text-purple-600 font-semibold hover:underline">
                Browse Directory →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Daily Deals</h3>
              <p className="text-gray-600 mb-4">Discover exclusive discounts and special offers from your favorite local businesses.</p>
              <Link href="/deals" className="text-blue-600 font-semibold hover:underline">
                View Deals →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-teal-500">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Proof of Visit</h3>
              <p className="text-gray-600 mb-4">Share your business experiences and discover where the community is going.</p>
              <Link href="/proof-of-visit" className="text-teal-600 font-semibold hover:underline">
                Share Experience →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing community of local businesses and customers in Thika
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-4">Welcome back, {user.email}!</p>
                <Link href="/directory/add" className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-colors duration-300">
                  Add Your Business
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-colors duration-300">
                  Sign Up Now
                </Link>
                <Link href="/directory/add" className="border-2 border-purple-600 text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-purple-600 hover:text-white transition-colors duration-300">
                  List Your Business
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Verified Businesses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">50+</div>
              <div className="text-gray-600">Daily Deals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
