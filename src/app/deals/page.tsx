"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Deal {
  id: string;
  title: string;
  description: string;
  businessName: string;
  expiryDate?: any;
}

const DealsPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const q = query(collection(db, "deals"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const dealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal));
        setDeals(dealsData);
      } catch (error) {
        console.error("Error fetching deals: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) {
    return <p>Loading deals...</p>;
  }

  // filter out expired deals
  const now = new Date();
  const activeDeals = deals.filter(d => {
    if (!d.expiryDate) return true;
    const expiry = d.expiryDate?.toDate ? d.expiryDate.toDate() : new Date(d.expiryDate);
    return expiry >= now;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Daily Deals</h1>
      <p className="mb-8">Check out the latest discounts from local businesses.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeDeals.length > 0 ? (
          activeDeals.map(deal => (
            <div key={deal.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-2">{deal.title}</h2>
              <p className="text-gray-700 mb-4">{deal.description}</p>
              <p className="text-sm font-semibold text-purple-600">{deal.businessName}</p>
              {deal.expiryDate && (
                <p className="text-sm text-red-500 mt-2">Expires: {deal.expiryDate?.toDate ? deal.expiryDate.toDate().toLocaleDateString() : new Date(deal.expiryDate).toLocaleDateString()}</p>
              )}
            </div>
          ))
        ) : (
          <p>No deals available at the moment. Check back later!</p>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
