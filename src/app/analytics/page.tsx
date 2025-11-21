'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2, Users, Building, TrendingUp, Award, Calendar, BarChart3 } from 'lucide-react';

interface Analytics {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    approvedBusinesses: number;
    pendingBusinesses: number;
    totalInvites: number;
  };
  growth: {
    newUsersThisWeek: number;
    newBusinessesThisWeek: number;
    userGrowthRate: number;
    businessGrowthRate: number;
  };
  breakdown: {
    byCategory: { [key: string]: number };
    byCounty: { [key: string]: number };
  };
  recent: {
    users: any[];
    businesses: any[];
  };
  lastUpdated: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAdmin, isAdminLoading } = useAdminAuth();

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics();
    }
  }, [user, isAdmin]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking admin status
  if (isAdminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: any) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend} this week
            </p>
          )}
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Last updated: {new Date(analytics.lastUpdated).toLocaleDateString()}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={analytics.overview.totalUsers}
          icon={Users}
          trend={analytics.growth.newUsersThisWeek}
          color="blue"
        />
        <StatCard
          title="Total Businesses"
          value={analytics.overview.totalBusinesses}
          icon={Building}
          trend={analytics.growth.newBusinessesThisWeek}
          color="green"
        />
        <StatCard
          title="Approved Businesses"
          value={analytics.overview.approvedBusinesses}
          icon={Award}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Pending Approvals"
          value={analytics.overview.pendingBusinesses}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Total Invites"
          value={analytics.overview.totalInvites}
          icon={Users}
          color="pink"
        />
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Businesses by Category</h3>
          <div className="space-y-3">
            {Object.entries(analytics.breakdown.byCategory)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{category}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(analytics.breakdown.byCategory))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Businesses by County</h3>
          <div className="space-y-3">
            {Object.entries(analytics.breakdown.byCounty)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([county, count]) => (
                <div key={county} className="flex justify-between items-center">
                  <span className="text-gray-700">{county}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(analytics.breakdown.byCounty))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {analytics.recent.users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {user.displayName || user.email || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.role || 'user'} • {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  New
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Businesses</h3>
          <div className="space-y-3">
            {analytics.recent.businesses.slice(0, 5).map((business) => (
              <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{business.name}</p>
                  <p className="text-sm text-gray-600">
                    {business.category} • {business.location?.county}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  business.isApproved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {business.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={fetchAnalytics}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
}