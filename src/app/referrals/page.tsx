"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/ui/NotificationSystem';

interface ReferralData {
  referralCode: string;
  stats: {
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalRewards: number;
  };
  referrals: Array<{
    id: string;
    referredEmail: string;
    status: string;
    rewardAmount: number;
    createdAt: string;
  }>;
}

const ReferralPage = () => {
  const [user, loading] = useAuthState(auth);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchReferralData();
    }
  }, [user, loading, router]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/referrals', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      } else {
        throw new Error('Failed to fetch referral data');
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load referral data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) return;

    setIsSubmitting(true);
    try {
      const idToken = await user!.getIdToken();
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ referralCode: referralCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Referral Applied!',
          message: `You've earned $${data.reward} from ${data.referrer.email}`,
        });
        setReferralCode('');
        fetchReferralData(); // Refresh data
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to apply referral code',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to apply referral code',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      addNotification({
        type: 'success',
        title: 'Copied!',
        message: 'Referral code copied to clipboard',
      });
    }
  };

  const shareReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralData?.referralCode}`;
    navigator.clipboard.writeText(link);
    addNotification({
      type: 'success',
      title: 'Copied!',
      message: 'Referral link copied to clipboard',
    });
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading referral data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !referralData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unable to load referral data</h1>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Referral Program</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Referrals</h3>
            <p className="text-3xl font-bold text-purple-600">{referralData.stats.totalReferrals}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Successful</h3>
            <p className="text-3xl font-bold text-green-600">{referralData.stats.successfulReferrals}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{referralData.stats.pendingReferrals}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Rewards</h3>
            <p className="text-3xl font-bold text-blue-600">${referralData.stats.totalRewards}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Referral Code */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Your Referral Code</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Share this code with friends</p>
                <p className="text-2xl font-mono font-bold text-purple-600 mb-4">{referralData.referralCode}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={copyReferralCode}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex-1"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={shareReferralLink}
                    className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors flex-1"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>• Earn $10 for each successful referral</p>
              <p>• Friends get $5 bonus when they sign up</p>
              <p>• No limit on referrals</p>
            </div>
          </div>

          {/* Use Referral Code */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Have a Referral Code?</h2>
            <form onSubmit={handleUseReferralCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Referral Code
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="ABCD1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  maxLength={8}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !referralCode.trim()}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Applying...' : 'Apply Referral Code'}
              </button>
            </form>
            <div className="mt-4 text-sm text-gray-600">
              <p>Get $5 bonus when you use someone's referral code!</p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Referrals</h2>
          {referralData.referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No referrals yet. Share your code to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Reward</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.referrals.map((referral) => (
                    <tr key={referral.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{referral.referredEmail}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">${referral.rewardAmount}</td>
                      <td className="py-3 px-4">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;