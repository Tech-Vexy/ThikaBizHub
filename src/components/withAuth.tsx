"use client";

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

const withAuth = (Component: React.ComponentType<any>) => {
  const AuthenticatedComponent = (props: any) => {
    const { user, loading, isAdmin, isAdminLoading } = useAdminAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showRefreshOption, setShowRefreshOption] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const isAuthLoading = loading || isAdminLoading;
      if (isAuthLoading) {
        // Still loading, do nothing yet.
        return;
      }

      if (!user) {
        // If auth is done and there's no user, redirect to login.
        router.push('/login');
      } else if (!isAdmin) {
        // If auth is done and the user is not an admin, show option to refresh or redirect.
        setShowRefreshOption(true);
      } else {
        // User is authenticated and is an admin
        setShowRefreshOption(false);
      }
    }, [user, isAdmin, loading, isAdminLoading, router]);

    const handleForceRefresh = async () => {
      if (!user) return;
      
      setIsRefreshing(true);
      try {
        // Force refresh the ID token to get latest custom claims
        await user.getIdToken(true);
        // Reload the page to re-evaluate all auth hooks
        window.location.reload();
      } catch (error) {
        console.error('Error refreshing token:', error);
        alert('Error refreshing permissions. Please try logging out and logging back in.');
      } finally {
        setIsRefreshing(false);
      }
    };

    const handleGoHome = () => {
      router.push('/');
    };

    const isAuthLoading = loading || isAdminLoading;

    // While authentication is in progress, show loading
    if (isAuthLoading || isRefreshing) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold mb-4">
              {isRefreshing ? 'Refreshing Permissions' : 'Verifying Access'}
            </h1>
            <p>Please wait while we check your permissions...</p>
          </div>
        </div>
      );
    }

    // If user is not logged in, this will be handled by the useEffect redirect
    if (!user) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
            <p>Redirecting to login...</p>
          </div>
        </div>
      );
    }

    // If user is not admin, show refresh option or deny access
    if (!isAdmin) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h1 className="text-2xl font-semibold text-yellow-800 mb-4">Access Restricted</h1>
              <p className="text-yellow-700 mb-6">
                You don't have permission to view this page. If you were recently granted admin access, 
                you may need to refresh your session.
              </p>
              
              {showRefreshOption && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleForceRefresh}
                    disabled={isRefreshing}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Refresh Permissions
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Go to Homepage
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              If the problem persists, try logging out and logging back in.
            </p>
          </div>
        </div>
      );
    }

    // If all checks pass, render the protected component.
    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth;
