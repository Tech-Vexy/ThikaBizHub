"use client";

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

interface Proof {
  id: string;
  name: string;
  businessName: string;
  imageUrl: string;
}

const ProofOfVisitPage = () => {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const q = query(collection(db, "proofs"), where("approved", "==", true), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const proofsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proof));
        setProofs(proofsData);
      } catch (error) {
        console.error("Error fetching proofs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProofs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image to upload.');
      return;
    }
    setSubmitting(true);

    try {
      const storageRef = ref(storage, `proofs/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "proofs"), {
        name,
        businessName,
        imageUrl,
        approved: false, // Admin must approve this
        createdAt: new Date(),
      });

      alert('Your proof has been submitted for review. Thank you!');
      setName('');
      setBusinessName('');
      setImageFile(null);
      // Optionally, you could refresh the list or just wait for a page reload
    } catch (error) {
      console.error("Error submitting proof: ", error);
      alert('There was an error submitting your proof.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Proof of Visit Wall</h1>
      <p className="mb-8">Share a selfie or a receipt from a local business and get featured!</p>

      <div className="mb-12">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Submit Your Proof</h2>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="businessName" className="block text-gray-700 font-bold mb-2">Business Name</label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="image" className="block text-gray-700 font-bold mb-2">Upload Image (Selfie/Receipt)</label>
            <input
              type="file"
              id="image"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              accept="image/*"
              required
            />
          </div>
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Community Posts</h2>
        {loading ? (
          <p>Loading posts...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proofs.length > 0 ? (
              proofs.map(proof => (
                <div key={proof.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-64 w-full">
                    <Image src={proof.imageUrl} alt={`Visit to ${proof.businessName}`} layout="fill" objectFit="cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-lg">{proof.businessName}</p>
                    <p className="text-gray-600">Posted by: {proof.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No posts to show yet. Be the first to submit one!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofOfVisitPage;
