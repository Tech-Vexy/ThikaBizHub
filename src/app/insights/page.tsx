"use client";

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { TrendingUp, BarChart3, Users, Award } from 'lucide-react';

interface CategoryStats {
  category: string;
  totalBusinesses: number;
  averageRating: number;
  totalReviews: number;
  topPerformer: string;
}

export default function CompetitorInsightsPage() {
  const { user, isAdmin, isAdminLoading } = useAdminAuth();
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin) {
      fetchInsights();
    }
  }, [user, isAdmin]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const token = await user!.getIdToken();
      const response = await fetch('/api/insights', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategoryStats(data.categoryStats || []);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isAdminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <BarChart3 className="h-10 w-10 text-purple-600" />
          Competitor Insights
        </h1>
        <p className="text-gray-600">Industry benchmarks and category performance data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryStats.map((stat) => (
          <div key={stat.category} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{stat.category}</h3>
              <Award className="h-6 w-6 text-yellow-500" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-purple-700 font-medium mb-1">
                  <Users className="h-4 w-4" />
                  Total Businesses
                </div>
                <div className="text-2xl font-bold text-purple-900">{stat.totalBusinesses}</div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-blue-700 font-medium mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Avg Rating
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {stat.averageRating.toFixed(1)} ⭐
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium mb-1">
                  <BarChart3 className="h-4 w-4" />
                  Total Reviews
                </div>
                <div className="text-2xl font-bold text-green-900">{stat.totalReviews}</div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-700 font-medium mb-1">
                  Top Performer
                </div>
                <div className="text-sm font-bold text-yellow-900 truncate">
                  {stat.topPerformer || 'N/A'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Market Share</span>
                <span className="font-semibold">
                  {((stat.totalBusinesses / categoryStats.reduce((sum, s) => sum + s.totalBusinesses, 0)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categoryStats.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No insights available</h3>
          <p className="text-gray-500">More data needed to generate insights</p>
        </div>
      )}
    </div>
  );
}
