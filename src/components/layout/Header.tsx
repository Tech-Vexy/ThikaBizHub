"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Header = () => {
  const [user, loading] = useAuthState(auth);
  const { isAdmin } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            <Link href="/" onClick={closeMobileMenu}>
              ThikaBizHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex space-x-8 items-center">
              <li>
                <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/directory" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                  Directory
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                  Deals
                </Link>
              </li>
              <li>
                <Link href="/proof-of-visit" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                  Proof of Visit
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/invites" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                  Invites
                </Link>
              </li>
              {user && isAdmin && (
                <>
                  <li>
                    <Link href="/admin" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                      Admin
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/users" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                      User Management
                    </Link>
                  </li>
                  <li>
                    <Link href="/analytics" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                      Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/insights" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                      Insights
                    </Link>
                  </li>
                </>
              )}
              {user && (
                <li>
                  <Link href="/favorites" className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300">
                    Favorites
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors duration-300">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 max-w-32 truncate">
                      {user.displayName || user.email}
                    </span>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300"
                >
                  Login
                </Link>
                <Link 
                  href="/login" 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-6 h-6"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium py-2" onClick={closeMobileMenu}>
                Home
              </Link>
              <Link href="/directory" className="text-gray-700 hover:text-purple-600 font-medium py-2" onClick={closeMobileMenu}>
                Directory
              </Link>
              <Link href="/deals" className="text-gray-700 hover:text-purple-600 font-medium py-2" onClick={closeMobileMenu}>
                Deals
              </Link>
              <Link href="/proof-of-visit" className="text-gray-700 hover:text-purple-600 font-medium py-2" onClick={closeMobileMenu}>
                Proof of Visit
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium py-2" onClick={closeMobileMenu}>
                Events
              </Link>
              <Link href="/invites" className="text-gray-700 hover:text-purple-600 font-medium py-2" onClick={closeMobileMenu}>
                Invites
              </Link>
              {user && isAdmin && (
                <>
                  <Link href="/admin" className="text-gray-700 hover:text-purple-600 font-medium py-2" onClick={closeMobileMenu}>
                    Admin
                  </Link>
                  <Link href="/admin/users" className="text-gray-700 hover:text-purple-600 font-medium py-2" onClick={closeMobileMenu}>
                    User Management
                  </Link>
                </>
              )}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {loading ? (
                  <div className="flex items-center space-x-2 py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : user ? (
                  <div className="flex flex-col space-y-2">
                    <Link href="/profile" className="flex items-center space-x-2 py-2" onClick={closeMobileMenu}>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700">
                        {user.displayName || user.email}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-300 w-full"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/login" 
                      className="text-gray-700 hover:text-purple-600 font-medium py-2"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/login" 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 text-center"
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
