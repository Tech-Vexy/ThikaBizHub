"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { useRouter } from 'next/navigation';

// Function to call the backend API to create a user document
const createUserDocument = async (user: UserCredential['user']) => {
  if (!user) return;

  const idToken = await user.getIdToken();
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({}),
  });
  
  return response.json();
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Create user document
      await createUserDocument(userCredential.user);
      
      router.push('/admin');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Create user document
      await createUserDocument(userCredential.user);
      
      router.push('/admin');
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h1>
          
          {error && <p className="text-red-500 text-xs italic mb-4 bg-red-100 p-3 rounded">{error}</p>}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col space-y-4">
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-400"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded flex items-center justify-center space-x-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-gray-200"
              aria-label="Sign in with Google"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.3l6.8-6.8C35.5 2.1 30.1 0 24 0 14.8 0 6.9 5.2 2.8 12.7l7.9 6.1C12.9 13.2 18 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.3-4H24v8h12.9c-.6 3.5-3.1 6.4-6.6 8.1l7.9 6.1C42.9 38.6 46.5 31.9 46.5 24.5z" />
                <path fill="#FBBC05" d="M10.7 29.8c-.8-2.4-1.3-4.9-1.3-7.8s.5-5.4 1.3-7.8L2.8 7.6C1 11.3 0 15.5 0 20c0 4.6 1 8.7 2.8 12.4l7.9-2.6z" />
                <path fill="#34A853" d="M24 48c6.1 0 11.5-2 15.4-5.4l-7.3-5.6C29.8 37.5 27.1 38.6 24 38.6c-6 0-11.1-3.7-13.5-9.1l-7.9 6.1C6.9 42.8 14.8 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>New users are assigned a 'user' role by default. Contact an admin for elevated privileges.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
