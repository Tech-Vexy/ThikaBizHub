'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, MapPin, Phone, Globe, Star, MessageCircle, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';
import SearchFilter from '@/components/ui/SearchFilter';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  location: {
    county: string;
    town: string;
    address: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  stats?: {
    views: number;
    favorites: number;
    clicks: number;
  };
  businessHours?: any;
}

interface PaginationInfo {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

const ITEMS_PER_PAGE = 12;

const categories = [
  'All Categories',
  'Retail & Shopping',
  'Food & Restaurants',
  'Services',
  'Technology',
  'Healthcare',
  'Education',
  'Entertainment',
  'Agriculture',
  'Manufacturing',
  'Other'
];

const counties = [
  'All Counties',
  'Kiambu',
  'Murang\'a',
  'Nyeri',
  'Nyandarua',
  'Kirinyaga',
  'Embu',
  'Tharaka Nithi',
  'Meru',
  'Isiolo',
  'Marsabit',
  'Samburu',
  'Baringo',
  'Laikipia'
];

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalPages: 1
  });

  useEffect(() => {
    fetchBusinesses();
  }, [searchQuery, selectedCategory, selectedCounty, pagination.currentPage]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'All Categories' && { category: selectedCategory }),
        ...(selectedCounty !== 'All Counties' && { county: selectedCounty })
      });

      const response = await fetch(`/api/businesses?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      setBusinesses(data.businesses);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string, category: string, county: string) => {
    setSearchQuery(query);
    setSelectedCategory(category);
    setSelectedCounty(county);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const BusinessCard = ({ business }: { business: Business }) => {
    const getWhatsAppLink = () => {
      const phone = business.contact.whatsapp || business.contact.phone;
      const message = `Hi! I found your business "${business.name}" on ThikaBizHub. I'd like to know more.`;
      return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    };

    const isTrending = business.stats && business.stats.views > 100;

    return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative ${business.isPremium ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="absolute top-2 left-2 z-10">
        <FavoriteButton businessId={business.id} />
      </div>
      
      {business.isPremium && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold py-1 px-3 flex items-center justify-between">
          <span>PREMIUM</span>
          {isTrending && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending
            </span>
          )}
        </div>
      )}
      
      <div className="relative h-48 bg-gray-200">
        {business.images && business.images.length > 0 ? (
          <img
            src={business.images[0]}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Grid className="h-12 w-12" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-700">
          {business.category}
        </div>
        {business.stats && business.stats.views > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white rounded-full px-2 py-1 text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {business.stats.views} views
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{business.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>

        <div className="space-y-2 mb-4">
          {business.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {business.location.town && business.location.county ? 
                `${business.location.town}, ${business.location.county}` : 
                'Location not specified'}
            </div>
          )}
          {business.contact && business.contact.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {business.contact.phone}
            </div>
          )}
          {business.website && (
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="h-4 w-4 mr-2" />
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                Website
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {business.rating ? business.rating.toFixed(1) : '0.0'} ({business.reviewCount || 0} reviews)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(business.contact.whatsapp || business.contact.phone) && (
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {business.coordinates && (
            <a
              href={`https://www.google.com/maps?q=${business.coordinates.latitude},${business.coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <MapPin className="h-4 w-4" />
              Directions
            </a>
          )}
        </div>
        
        <Link
          href={`/business/${business.id}`}
          className="block mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

  const BusinessListItem = ({ business }: { business: Business }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${business.isPremium ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex items-start space-x-6">
        <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {business.images && business.images.length > 0 ? (
            <img
              src={business.images[0]}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Grid className="h-8 w-8" />
            </div>
          )}
          {business.isPremium && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-1">
              PREMIUM
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{business.name}</h3>
              <p className="text-sm text-blue-600 mb-2">{business.category}</p>
              <p className="text-gray-600 mb-3 line-clamp-2">{business.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {business.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {business.location.town && business.location.county ? 
                      `${business.location.town}, ${business.location.county}` : 
                      'Location not specified'}
                  </div>
                )}
                {business.contact && business.contact.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {business.contact.phone}
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {business.rating ? business.rating.toFixed(1) : '0.0'} ({business.reviewCount || 0})
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {business.coordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${business.coordinates.latitude},${business.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1 justify-center"
                  >
                    <MapPin className="h-4 w-4" />
                    Directions
                  </a>
                )}
                <Link
                  href={`/business/${business.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      <div className="flex space-x-1">
        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          const pageNum = Math.max(1, pagination.currentPage - 2) + i;
          if (pageNum > pagination.totalPages) return null;
          
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-2 rounded-lg ${
                pageNum === pagination.currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      
      <button
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Directory</h1>
        <p className="text-xl text-gray-600">
          Discover amazing businesses in your area
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <SearchFilter
          onSearch={(query: string) => {
            setSearchQuery(query);
            setPagination(prev => ({ ...prev, currentPage: 1 }));
          }}
          onCategoryFilter={(category: string) => {
            setSelectedCategory(category);
            setPagination(prev => ({ ...prev, currentPage: 1 }));
          }}
          onLocationFilter={(county: string) => {
            setSelectedCounty(county);
            setPagination(prev => ({ ...prev, currentPage: 1 }));
          }}
          categories={categories}
          locations={counties}
        />
      </div>

      {/* View Toggle and Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing {businesses.length} businesses
          {searchQuery && ` for "${searchQuery}"`}
          {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
          {selectedCounty !== 'All Counties' && ` in ${selectedCounty}`}
        </p>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Businesses Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
          ))}
        </div>
      ) : businesses.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {businesses.map((business) => (
            viewMode === 'grid' ? (
              <BusinessCard key={business.id} business={business} />
            ) : (
              <BusinessListItem key={business.id} business={business} />
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or{' '}
            <Link href="/directory/add" className="text-blue-600 hover:text-blue-700">
              add a new business
            </Link>
          </p>
        </div>
      )}

      {/* Pagination */}
      {businesses.length > 0 && <Pagination />}

      {/* Add Business CTA */}
      <div className="text-center mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Don't see your business?
        </h3>
        <p className="text-gray-600 mb-6">
          Join our directory and connect with local customers
        </p>
        <Link
          href="/directory/add"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Add Your Business
        </Link>
      </div>
    </div>
  );
}
