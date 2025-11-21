import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const useFavorites = () => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setFavorites(userDoc.data()?.favorites || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (businessId: string) => {
    if (!user) {
      alert('Please login to save favorites');
      return false;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const isFavorite = favorites.includes(businessId);

      if (isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayRemove(businessId)
        });
        setFavorites(prev => prev.filter(id => id !== businessId));
      } else {
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, { favorites: [businessId] });
        } else {
          await updateDoc(userRef, {
            favorites: arrayUnion(businessId)
          });
        }
        setFavorites(prev => [...prev, businessId]);
      }

      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const isFavorite = (businessId: string) => favorites.includes(businessId);

  return { favorites, loading, toggleFavorite, isFavorite };
};
