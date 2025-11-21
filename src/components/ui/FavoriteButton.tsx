"use client";

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  businessId: string;
  className?: string;
}

export default function FavoriteButton({ businessId, className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(businessId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(businessId);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
        favorite 
          ? 'bg-red-100 text-red-600' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      } ${className}`}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`}
      />
    </button>
  );
}
