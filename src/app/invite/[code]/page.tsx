"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/ui/NotificationSystem';

interface InviteDetails {
  id: string;
  inviterEmail: string;
  inviterName: string;
  inviteeEmail: string;
  type: string;
  businessName?: string;
  message: string;
  createdAt: string;
  expiresAt: string;
}

interface InvitePageProps {
  params: {
    code: string;
  };
}

const InvitePage = ({ params }: InvitePageProps) => {
  const { code } = params;
  const [user, loading] = useAuthState(auth);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchInviteDetails();
  }, [code]);

  const fetchInviteDetails = async () => {
    try {
      const response = await fetch(`/api/invites/${code}`);
      const data = await response.json();

      if (response.ok) {
        setInvite(data.invite);
      } else {
        setError(data.error || 'Failed to load invite');
      }
    } catch (error) {
      setError('Failed to load invite details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsAccepting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/invites/${code}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Invite Accepted!',
          message: `Welcome! You've successfully joined via ${data.inviter.name}'s invitation.`,
        });
        
        // Redirect based on invite type
        switch (data.type) {
          case 'admin':
            router.push('/admin');
            break;
          case 'business':
            router.push('/directory');
            break;
          default:
            router.push('/');
            break;
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to accept invite',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to accept invite',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const getInviteTypeDescription = (type: string) => {
    switch (type) {
      case 'admin':
        return {
          title: 'Admin Invitation',
          description: 'You\'ve been invited to become an administrator with special privileges.',
          icon: '👑',
          color: 'purple',
        };
      case 'business':
        return {
          title: 'Business Team Invitation',
          description: 'You\'ve been invited to join a business team.',
          icon: '🏢',
          color: 'blue',
        };
      default:
        return {
          title: 'Platform Invitation',
          description: 'You\'ve been invited to join ThikaBizHub.',
          icon: '🎉',
          color: 'green',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Invalid Invitation</h1>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inviteType = getInviteTypeDescription(invite.type);
  const isExpired = new Date(invite.expiresAt) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-yellow-800 mb-4">Invitation Expired</h1>
            <p className="text-yellow-700 mb-6">
              This invitation from {invite.inviterName} expired on {new Date(invite.expiresAt).toLocaleDateString()}.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-4 w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{inviteType.icon}</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{inviteType.title}</h1>
            <p className="text-gray-600">{inviteType.description}</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">From:</span>
                <p className="font-medium">{invite.inviterName}</p>
                <p className="text-sm text-gray-600">{invite.inviterEmail}</p>
              </div>
              
              {invite.businessName && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Business:</span>
                  <p className="font-medium">{invite.businessName}</p>
                </div>
              )}
              
              {invite.message && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Message:</span>
                  <p className="italic text-gray-700">"{invite.message}"</p>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-500">Expires:</span>
                <p className="text-sm">{new Date(invite.expiresAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                You need to be logged in to accept this invitation. 
                You'll be redirected to login and then back here.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleAcceptInvite}
              disabled={isAccepting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                inviteType.color === 'purple'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : inviteType.color === 'blue'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isAccepting 
                ? 'Accepting...' 
                : user 
                ? 'Accept Invitation' 
                : 'Login & Accept Invitation'
              }
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By accepting this invitation, you agree to ThikaBizHub's terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;