"use client";

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MapPin, Clock, Upload, X } from 'lucide-react';

const AddBusinessPage = () => {
  const [business, setBusiness] = useState({
    name: '',
    category: '',
    whatsapp: '',
    description: '',
    address: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
  });
  
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true },
  });
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBusiness(prev => ({ ...prev, [name]: value }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value }
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (error) => {
        setLocationError('Unable to get your location. Please try again.');
        setGettingLocation(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const image of images) {
        const storageRef = ref(storage, `businesses/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

      const businessData: any = {
        ...business,
        approved: false,
        createdAt: new Date().toISOString(),
        images: imageUrls,
        businessHours,
        socialMedia: {
          facebook: business.facebook,
          instagram: business.instagram,
          twitter: business.twitter,
        },
        stats: {
          views: 0,
          favorites: 0,
          clicks: 0,
        },
        isPremium: false,
      };

      // Add location coordinates if available
      if (location) {
        businessData.coordinates = {
          latitude: location.lat,
          longitude: location.lng,
        };
      }

      await addDoc(collection(db, "businesses"), businessData);
      alert('Your business has been submitted for review. Thank you!');
      
      // Reset form
      setBusiness({ name: '', category: '', whatsapp: '', description: '', address: '', website: '', facebook: '', instagram: '', twitter: '' });
      setLocation(null);
      setImages([]);
      setImagePreviews([]);
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
        <div className="mb-4">
          <label htmlFor="address" className="block text-gray-700 font-bold mb-2">Physical Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={business.address}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            placeholder="e.g., Kenyatta Avenue, Thika Town"
            required
          />
        </div>

        {/* Social Media Links */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-3">Social Media (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="facebook" className="block text-gray-600 font-medium mb-1">Facebook URL</label>
              <input
                type="url"
                id="facebook"
                name="facebook"
                value={business.facebook}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>
            <div>
              <label htmlFor="instagram" className="block text-gray-600 font-medium mb-1">Instagram URL</label>
              <input
                type="url"
                id="instagram"
                name="instagram"
                value={business.instagram}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                placeholder="https://instagram.com/yourbusiness"
              />
            </div>
            <div>
              <label htmlFor="twitter" className="block text-gray-600 font-medium mb-1">Twitter URL</label>
              <input
                type="url"
                id="twitter"
                name="twitter"
                value={business.twitter}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                placeholder="https://twitter.com/yourbusiness"
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-gray-600 font-medium mb-1">Website URL</label>
              <input
                type="url"
                id="website"
                name="website"
                value={business.website}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                placeholder="https://yourbusiness.com"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </h3>
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            {Object.entries(businessHours).map(([day, hours]) => (
              <div key={day} className="grid grid-cols-4 gap-2 items-center">
                <span className="capitalize font-medium text-gray-700">{day}</span>
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                  disabled={hours.closed}
                  className="px-2 py-1 border rounded text-sm disabled:bg-gray-200"
                />
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                  disabled={hours.closed}
                  className="px-2 py-1 border rounded text-sm disabled:bg-gray-200"
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                    className="rounded"
                  />
                  Closed
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Business Photos (Max 5)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload images</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</span>
            </label>
          </div>
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Pin Your Location (Optional but Recommended)</label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <p className="text-sm text-blue-800 mb-3">
              📍 Help customers find you easily by pinning your exact location. This will allow them to get directions via Google Maps.
            </p>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 transition-colors"
            >
              <MapPin className="h-5 w-5" />
              <span>{gettingLocation ? 'Getting Location...' : 'Pin Current Location'}</span>
            </button>
            {location && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800 font-medium">✓ Location pinned successfully!</p>
                <p className="text-xs text-green-700 mt-1">
                  Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            )}
            {locationError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">{locationError}</p>
              </div>
            )}
          </div>
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
