"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export const useAdminAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          // Force refresh the token to get the latest custom claims.
          const idTokenResult = await user.getIdTokenResult(true);
          if (idTokenResult.claims.role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsAdminLoading(false);
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  return { user, loading, error, isAdmin, isAdminLoading };
};
