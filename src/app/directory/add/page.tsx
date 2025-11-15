"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddBusinessPage = () => {
  const [business, setBusiness] = useState({
    name: '',
    category: '',
    whatsapp: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBusiness(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "businesses"), {
        ...business,
        approved: false,
        createdAt: new Date(),
      });
      alert('Your business has been submitted for review. Thank you!');
      setBusiness({ name: '', category: '', whatsapp: '', description: '' });
    } catch (error) {
      console.error("Error submitting business: ", error);
      alert('There was an error submitting your business.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">List Your Business</h1>
      <p className="mb-8">Fill out the form below to get your business listed on ThikaBizHub.</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Business Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={business.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 font-bold mb-2">Category</label>
          <select
            id="category"
            name="category"
            value={business.category}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          >
            <option value="">Select a category</option>
            <option value="Salon">Salon</option>
            <option value="Cybercafe">Cybercafé</option>
            <option value="Food Joint">Food Joint</option>
            <option value="Boda Rider">Boda Rider</option>
            <option value="Tutor">Tutor</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="whatsapp" className="block text-gray-700 font-bold mb-2">WhatsApp Number</label>
          <input
            type="text"
            id="whatsapp"
            name="whatsapp"
            value={business.whatsapp}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            placeholder="+2547..."
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={business.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            rows={4}
            required
          />
        </div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
};

export default AddBusinessPage;
