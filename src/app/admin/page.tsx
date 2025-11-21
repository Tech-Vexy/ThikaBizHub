"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import withAuth from '@/components/withAuth';

interface Deal {
  title: string;
  description: string;
  businessName: string;
  expiryDate: string;
}

interface Proof {
  id: string;
  name: string;
  businessName: string;
  imageUrl: string;
  approved: boolean;
}

interface Business {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  description: string;
  approved: boolean;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const AdminPage = () => {
  const [deal, setDeal] = useState<Deal>({
    title: '',
    description: '',
    businessName: '',
    expiryDate: '',
  });
  const [unapprovedProofs, setUnapprovedProofs] = useState<Proof[]>([]);
  const [loadingProofs, setLoadingProofs] = useState(true);
  const [unapprovedBusinesses, setUnapprovedBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  useEffect(() => {
    const fetchUnapproved = async () => {
      setLoadingProofs(true);
      setLoadingBusinesses(true);
      try {
        // Fetch unapproved proofs
        const proofsQuery = query(collection(db, "proofs"), where("approved", "==", false), orderBy("createdAt", "desc"));
        const proofsSnapshot = await getDocs(proofsQuery);
        const proofsData = proofsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proof));
        setUnapprovedProofs(proofsData);

        // Fetch unapproved businesses
        const businessesQuery = query(collection(db, "businesses"), where("approved", "==", false), orderBy("createdAt", "desc"));
        const businessesSnapshot = await getDocs(businessesQuery);
        const businessesData = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        setUnapprovedBusinesses(businessesData);

      } catch (error) {
        console.error("Error fetching unapproved items: ", error);
      } finally {
        setLoadingProofs(false);
        setLoadingBusinesses(false);
      }
    };

    fetchUnapproved();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeal((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert expiryDate (YYYY-MM-DD string) to a Date object so Firestore stores a timestamp
      const expiry = deal.expiryDate ? new Date(deal.expiryDate) : null;
      await addDoc(collection(db, "deals"), {
        title: deal.title,
        description: deal.description,
        businessName: deal.businessName,
        expiryDate: expiry,
        createdAt: new Date(),
      });
      alert('Deal submitted successfully!');
      setDeal({ title: '', description: '', businessName: '', expiryDate: '' }); // Clear form
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Error submitting deal.');
    }
  };

  const handleApprove = async (collectionName: string, id: string) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await updateDoc(itemRef, { approved: true });
      if (collectionName === 'proofs') {
        setUnapprovedProofs(prev => prev.filter(p => p.id !== id));
      } else {
        setUnapprovedBusinesses(prev => prev.filter(b => b.id !== id));
      }
      alert('Item approved!');
    } catch (error) {
      console.error("Error approving item: ", error);
      alert('Error approving item.');
    }
  };

  const handleReject = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      if (collectionName === 'proofs') {
        setUnapprovedProofs(prev => prev.filter(p => p.id !== id));
      } else {
        setUnapprovedBusinesses(prev => prev.filter(b => b.id !== id));
      }
      alert('Item rejected and deleted.');
    } catch (error) {
      console.error("Error rejecting item: ", error);
      alert('Error rejecting item.');
    }
  };

  const shareOnSocialMedia = (platform: 'whatsapp' | 'facebook' | 'instagram' | 'tiktok') => {
    const text = `Check out this deal from ${deal.businessName}: ${deal.title} - ${deal.description}`;
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        alert('Instagram sharing is not supported via web. Please share manually from the app.');
        return;
      case 'tiktok':
        alert('TikTok sharing is not supported via web. Please share manually from the app.');
        return;
    }
    window.open(url, '_blank');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Deals Management */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Manage Deals</h2>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Deal Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={deal.title}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="businessName" className="block text-gray-700 font-bold mb-2">Business Name</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={deal.businessName}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="expiryDate" className="block text-gray-700 font-bold mb-2">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={deal.expiryDate}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={deal.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                Submit Deal
              </button>
            </div>
          </form>
          <div>
            <h3 className="text-xl font-bold mb-2">Share Last Deal</h3>
            <div className="flex space-x-2">
              <button onClick={() => shareOnSocialMedia('whatsapp')} className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded">
                Share on WhatsApp
              </button>
              <button onClick={() => shareOnSocialMedia('facebook')} className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Share on Facebook
              </button>
              <button onClick={() => shareOnSocialMedia('instagram')} className="flex-1 bg-pink-500 text-white font-bold py-2 px-4 rounded">
                Share on Instagram
              </button>
              <button onClick={() => shareOnSocialMedia('tiktok')} className="flex-1 bg-black text-white font-bold py-2 px-4 rounded">
                Share on TikTok
              </button>
            </div>
          </div>
        </div>

        {/* Approval Columns */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Business Approval */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Approve Businesses</h2>
            {loadingBusinesses ? (
              <p>Loading submissions...</p>
            ) : (
              <div className="space-y-6">
                {unapprovedBusinesses.length > 0 ? (
                  unapprovedBusinesses.map(business => (
                    <div key={business.id} className="bg-white p-4 rounded-lg shadow-md">
                      <h3 className="font-bold text-lg">{business.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{business.category}</p>
                      <p className="text-sm">{business.description}</p>
                      <p className="text-sm mt-2">WhatsApp: {business.whatsapp}</p>
                      {business.address && (
                        <p className="text-sm mt-1">Address: {business.address}</p>
                      )}
                      {business.coordinates && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs text-green-800 font-medium">📍 Location Pinned</p>
                          <a 
                            href={`https://www.google.com/maps?q=${business.coordinates.latitude},${business.coordinates.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                      <div className="flex justify-end space-x-2 mt-4">
                        <button onClick={() => handleReject('businesses', business.id)} className="bg-red-500 text-white font-bold py-1 px-3 rounded text-sm">Reject</button>
                        <button onClick={() => handleApprove('businesses', business.id)} className="bg-green-500 text-white font-bold py-1 px-3 rounded text-sm">Approve</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No new business submissions.</p>
                )}
              </div>
            )}
          </div>

          {/* Proof of Visit Approval */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Approve Proof of Visits</h2>
            {loadingProofs ? (
              <p>Loading submissions...</p>
            ) : (
              <div className="space-y-6">
                {unapprovedProofs.length > 0 ? (
                  unapprovedProofs.map(proof => (
                    <div key={proof.id} className="bg-white p-4 rounded-lg shadow-md">
                      <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                        <Image src={proof.imageUrl} alt={`Visit to ${proof.businessName}`} layout="fill" objectFit="cover" />
                      </div>
                      <p className="font-bold">{proof.businessName}</p>
                      <p className="text-sm text-gray-600">By: {proof.name}</p>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button onClick={() => handleReject('proofs', proof.id)} className="bg-red-500 text-white font-bold py-1 px-3 rounded text-sm">Reject</button>
                        <button onClick={() => handleApprove('proofs', proof.id)} className="bg-green-500 text-white font-bold py-1 px-3 rounded text-sm">Approve</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No new proof submissions.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminPage);
