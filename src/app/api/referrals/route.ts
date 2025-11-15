import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - Get user's referral information
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
    
    // Get user's referral info
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // If user doesn't have a referral code, generate one
    if (!userData?.referralCode) {
      let referralCode;
      let isUnique = false;
      
      // Ensure referral code is unique
      while (!isUnique) {
        referralCode = generateReferralCode();
        const existingCode = await db.collection('users')
          .where('referralCode', '==', referralCode)
          .get();
        isUnique = existingCode.empty;
      }
      
      // Update user with referral code
      await userRef.update({ referralCode });
      userData!.referralCode = referralCode;
    }

    // Get referral stats
        const referralsSnapshot = await db.collection('referrals')
          .where('referrerId', '==', uid)
          .get();
        
        const referrals = referralsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as { status?: string; rewardAmount?: number; [key: string]: any }),
        }));
    
        const stats = {
          totalReferrals: referrals.length,
          successfulReferrals: referrals.filter(r => r.status === 'completed').length,
          pendingReferrals: referrals.filter(r => r.status === 'pending').length,
          totalRewards: referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
        };

    return NextResponse.json({
      referralCode: userData?.referralCode,
      stats,
      referrals,
    });

  } catch (error) {
    console.error('Error getting referral data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Process a referral signup
export async function POST(req: NextRequest) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const { referralCode } = await req.json();
    
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const decodedToken = await getAuth(admin.app()).verifyIdToken(idToken);
    const { uid: referredUserId, email: referredEmail } = decodedToken;

    const db = getFirestore(admin.app());
    
    // Find the referrer by referral code
    const referrerSnapshot = await db.collection('users')
      .where('referralCode', '==', referralCode.toUpperCase())
      .get();
    
    if (referrerSnapshot.empty) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }
    
    const referrerDoc = referrerSnapshot.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data();
    
    // Check if user already used a referral
    const existingReferral = await db.collection('referrals')
      .where('referredUserId', '==', referredUserId)
      .get();
    
    if (!existingReferral.empty) {
      return NextResponse.json({ error: 'User already used a referral code' }, { status: 400 });
    }
    
    // Can't refer yourself
    if (referrerId === referredUserId) {
      return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 });
    }
    
    // Create referral record
    const referralData = {
      referrerId,
      referrerEmail: referrerData?.email,
      referredUserId,
      referredEmail,
      referralCode: referralCode.toUpperCase(),
      status: 'completed',
      rewardAmount: 10, // $10 reward for successful referral
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    
    await db.collection('referrals').add(referralData);
    
    // Update user to mark they used a referral
    await db.collection('users').doc(referredUserId).update({
      usedReferralCode: referralCode.toUpperCase(),
      referredBy: referrerId,
    });
    
    return NextResponse.json({
      message: 'Referral processed successfully',
      reward: 10,
      referrer: {
        email: referrerData?.email,
      },
    });

  } catch (error) {
    console.error('Error processing referral:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}