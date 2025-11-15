import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// GET - Get invite details by code
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const db = getFirestore(admin.app());
    
    // Find invite by code
    const inviteSnapshot = await db.collection('invites')
      .where('inviteCode', '==', code)
      .get();
    
    if (inviteSnapshot.empty) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }
    
    const inviteDoc = inviteSnapshot.docs[0];
    const inviteData = inviteDoc.data();
    
    // Check if invite is expired
    if (new Date(inviteData.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }
    
    // Check if already accepted
    if (inviteData.status !== 'pending') {
      return NextResponse.json({ error: 'Invite already processed' }, { status: 400 });
    }
    
    return NextResponse.json({
      invite: {
        id: inviteDoc.id,
        ...inviteData,
      },
    });

  } catch (error) {
    console.error('Error getting invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Accept invite
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const { code } = await params;
    const decodedToken = await getAuth(admin.app()).verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    const db = getFirestore(admin.app());
    
    // Find invite
    const inviteSnapshot = await db.collection('invites')
      .where('inviteCode', '==', code)
      .get();
    
    if (inviteSnapshot.empty) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }
    
    const inviteDoc = inviteSnapshot.docs[0];
    const inviteData = inviteDoc.data();
    
    // Validate invite
    if (new Date(inviteData.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }
    
    if (inviteData.status !== 'pending') {
      return NextResponse.json({ error: 'Invite already processed' }, { status: 400 });
    }
    
    if (inviteData.inviteeEmail !== email) {
      return NextResponse.json({ error: 'Invite not intended for this email address' }, { status: 400 });
    }
    
    // Accept invite
    await db.collection('invites').doc(inviteDoc.id).update({
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      acceptedBy: uid,
    });
    
    // Process based on invite type
    const userRef = db.collection('users').doc(uid);
    
    switch (inviteData.type) {
      case 'business':
        // Add user to a business team or grant business privileges
        await userRef.update({
          businessRole: 'member',
          invitedToBusiness: inviteData.businessName,
          joinedBusinessAt: new Date().toISOString(),
        });
        break;
        
      case 'admin':
        // Grant admin privileges (only if inviter is admin)
        const inviter = await getAuth(admin.app()).getUser(inviteData.inviterId);
        if (inviter.customClaims?.role === 'admin') {
          await getAuth(admin.app()).setCustomUserClaims(uid, { role: 'admin' });
          await userRef.update({ role: 'admin' });
        }
        break;
        
      case 'user':
      default:
        // Regular user invite - maybe give some bonus or special access
        await userRef.update({
          invitedBy: inviteData.inviterId,
          joinedViaInvite: true,
        });
        break;
    }
    
    return NextResponse.json({
      message: 'Invite accepted successfully',
      type: inviteData.type,
      inviter: {
        name: inviteData.inviterName,
        email: inviteData.inviterEmail,
      },
    });

  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}