"use client";

import { useState, useEffect } from 'react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  onLocationFilter: (location: string) => void;
  categories: string[];
  locations: string[];
  className?: string;
}

const SearchFilter = ({ 
  onSearch, 
  onCategoryFilter, 
  onLocationFilter, 
  categories, 
  locations,
  className = ""
}: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryFilter(category);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    onLocationFilter(location);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    onSearch('');
    onCategoryFilter('');
    onLocationFilter('');
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="space-y-4">
        {/* Main Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search businesses, services, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">Quick filters:</span>
          <button
            onClick={() => handleCategoryChange('restaurant')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'restaurant' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => handleCategoryChange('retail')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'retail' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Retail
          </button>
          <button
            onClick={() => handleCategoryChange('services')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'services' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Services
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center"
          >
            <span>Advanced Filters</span>
            <svg 
              className={`ml-1 h-4 w-4 transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {(selectedCategory || selectedLocation || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {isAdvancedOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(selectedCategory || selectedLocation) && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-gray-600">Active filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedLocation && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {selectedLocation}
                <button
                  onClick={() => handleLocationChange('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;