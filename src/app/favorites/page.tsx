"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Heart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  rating: number;
}

export default function FavoritesPage() {
  const [user, loading] = useAuthState(auth);
  const { favorites, toggleFavorite } = useFavorites();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (favorites.length > 0) {
      fetchFavoriteBusinesses();
    } else {
      setLoadingBusinesses(false);
    }
  }, [user, loading, favorites, router]);

  const fetchFavoriteBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      const businessesData: Business[] = [];
      
      for (const businessId of favorites) {
        const q = query(collection(db, 'businesses'), where('__name__', '==', businessId));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(doc => {
          businessesData.push({ id: doc.id, ...doc.data() } as Business);
        });
      }
      
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error fetching favorite businesses:', error);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  if (loading || loadingBusinesses) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Heart className="h-10 w-10 text-red-600 fill-current" />
          My Favorites
        </h1>
        <p className="text-gray-600">
          {businesses.length} saved {businesses.length === 1 ? 'business' : 'businesses'}
        </p>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">Start exploring and save your favorite businesses</p>
          <a
            href="/directory"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Browse Directory
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-200">
                {business.images && business.images.length > 0 ? (
                  <img
                    src={business.images[0]}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{business.name}</h3>
                  <button
                    onClick={() => toggleFavorite(business.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mb-2">{business.category}</p>
                <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    ⭐ {business.rating ? business.rating.toFixed(1) : '0.0'}
                  </div>
                  <a
                    href={`/business/${business.id}`}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
