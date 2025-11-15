"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/ui/NotificationSystem';

interface Invite {
  id: string;
  inviteeEmail: string;
  type: string;
  businessName?: string;
  message: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface InviteData {
  sentInvites: Invite[];
  receivedInvites: Invite[];
  stats: {
    totalSent: number;
    accepted: number;
    pending: number;
  };
}

const InvitesPage = () => {
  const [user, loading] = useAuthState(auth);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    type: 'user',
    message: '',
    businessName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchInviteData();
    }
  }, [user, loading, router]);

  const fetchInviteData = async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/invites', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInviteData(data);
      } else {
        throw new Error('Failed to fetch invite data');
      }
    } catch (error) {
      console.error('Error fetching invite data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load invite data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    setIsSubmitting(true);
    try {
      const idToken = await user!.getIdToken();
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(inviteForm),
      });

      const data = await response.json();

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Invite Sent!',
          message: `Invitation sent to ${inviteForm.email}`,
        });
        setInviteForm({ email: '', type: 'user', message: '', businessName: '' });
        setShowInviteForm(false);
        fetchInviteData(); // Refresh data
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to send invite',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send invite',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(link);
    addNotification({
      type: 'success',
      title: 'Copied!',
      message: 'Invite link copied to clipboard',
    });
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invite data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !inviteData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unable to load invite data</h1>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Invitations</h1>
          <button
            onClick={() => setShowInviteForm(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Send Invite
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Sent</h3>
            <p className="text-3xl font-bold text-blue-600">{inviteData.stats.totalSent}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Accepted</h3>
            <p className="text-3xl font-bold text-green-600">{inviteData.stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{inviteData.stats.pending}</p>
          </div>
        </div>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Send Invitation</h2>
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Type
                  </label>
                  <select
                    value={inviteForm.type}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="user">Regular User</option>
                    <option value="business">Business Member</option>
                    <option value="admin">Admin (requires admin privileges)</option>
                  </select>
                </div>

                {inviteForm.type === 'business' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={inviteForm.businessName}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Enter business name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sent Invites */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Sent Invitations</h2>
            {inviteData.sentInvites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No invitations sent yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inviteData.sentInvites.map((invite) => (
                  <div key={invite.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{invite.inviteeEmail}</p>
                        <p className="text-sm text-gray-600 capitalize">{invite.type} invitation</p>
                        {invite.businessName && (
                          <p className="text-sm text-blue-600">Business: {invite.businessName}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invite.status === 'accepted' 
                          ? 'bg-green-100 text-green-800'
                          : invite.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invite.status}
                      </span>
                    </div>
                    {invite.message && (
                      <p className="text-sm text-gray-600 mb-2">"{invite.message}"</p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Sent: {new Date(invite.createdAt).toLocaleDateString()}</span>
                      <span>Expires: {new Date(invite.expiresAt).toLocaleDateString()}</span>
                    </div>
                    {invite.status === 'pending' && (
                      <button
                        onClick={() => copyInviteLink(invite.id)}
                        className="mt-2 text-purple-600 text-sm hover:underline"
                      >
                        Copy invite link
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Received Invites */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Received Invitations</h2>
            {inviteData.receivedInvites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No invitations received.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inviteData.receivedInvites.map((invite) => (
                  <div key={invite.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">From: {invite.inviteeEmail}</p>
                        <p className="text-sm text-gray-600 capitalize">{invite.type} invitation</p>
                        {invite.businessName && (
                          <p className="text-sm text-blue-600">Business: {invite.businessName}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invite.status === 'accepted' 
                          ? 'bg-green-100 text-green-800'
                          : invite.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invite.status}
                      </span>
                    </div>
                    {invite.message && (
                      <p className="text-sm text-gray-600 mb-2">"{invite.message}"</p>
                    )}
                    <div className="text-xs text-gray-500">
                      Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitesPage;