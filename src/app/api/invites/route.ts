import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Generate invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// GET - Get user's invites
export async function GET(req: NextRequest) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth(admin.app()).verifyIdToken(idToken);
    const { uid } = decodedToken;

    const db = getFirestore(admin.app());
    
    // Get all invites for this user and sort in memory to avoid index requirements
    const sentInvitesSnapshot = await db.collection('invites')
      .where('inviterId', '==', uid)
      .get();
    
    const sentInvites = sentInvitesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get invites received by user
    const userEmail = (await getAuth(admin.app()).getUser(uid)).email;
    const receivedInvitesSnapshot = await db.collection('invites')
      .where('inviteeEmail', '==', userEmail)
      .get();
    
    const receivedInvites = receivedInvitesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      sentInvites,
      receivedInvites,
      stats: {
        totalSent: sentInvites.length,
        accepted: sentInvites.filter(i => i.status === 'accepted').length,
        pending: sentInvites.filter(i => i.status === 'pending').length,
      },
    });

  } catch (error) {
    console.error('Error getting invites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Send an invite
export async function POST(req: NextRequest) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const { email, type, message, businessName } = await req.json();
    
    if (!email || !type) {
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 });
    }

    const decodedToken = await getAuth(admin.app()).verifyIdToken(idToken);
    const { uid: inviterId } = decodedToken;
    const inviterUser = await getAuth(admin.app()).getUser(inviterId);

    const db = getFirestore(admin.app());
    
    // Check if invite already exists
    const existingInvite = await db.collection('invites')
      .where('inviterId', '==', inviterId)
      .where('inviteeEmail', '==', email)
      .where('type', '==', type)
      .where('status', '==', 'pending')
      .get();
    
    if (!existingInvite.empty) {
      return NextResponse.json({ error: 'Invite already sent to this email' }, { status: 400 });
    }
    
    // Create invite
    const inviteCode = generateInviteCode();
    const inviteData = {
      inviterId,
      inviterEmail: inviterUser.email,
      inviterName: inviterUser.displayName || inviterUser.email,
      inviteeEmail: email,
      type, // 'business', 'user', 'admin'
      businessName: businessName || null,
      message: message || '',
      inviteCode,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
    
    const inviteRef = await db.collection('invites').add(inviteData);
    
    // In a real app, you would send an email here
    // For now, we'll just return the invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${inviteCode}`;
    
    return NextResponse.json({
      message: 'Invite sent successfully',
      inviteId: inviteRef.id,
      inviteLink,
      inviteCode,
    });

  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}