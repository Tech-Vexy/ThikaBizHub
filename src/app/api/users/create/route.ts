import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];

    try {
        // Verify the ID token
        const decodedToken = await getAuth(admin.app()).verifyIdToken(idToken);
        const { uid, email } = decodedToken;

        // Get referral code from request body if provided
        const body = await req.json().catch(() => ({}));
        const { referralCode } = body;

        const db = getFirestore(admin.app());
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        // If the user document does not exist, create it
        if (!userDoc.exists) {
            // Check if this is the first user by counting existing users
            const usersSnapshot = await db.collection('users').get();
            const isFirstUser = usersSnapshot.empty;
            
            const role = isFirstUser ? 'admin' : 'user';
            
            // Create user document
            const userData: any = {
                email: email,
                role: role,
                createdAt: new Date().toISOString(),
            };

            // Handle referral code if provided
            if (referralCode && !isFirstUser) {
                try {
                    // Find the referrer by referral code
                    const referrerSnapshot = await db.collection('users')
                        .where('referralCode', '==', referralCode.toUpperCase())
                        .get();
                    
                    if (!referrerSnapshot.empty) {
                        const referrerDoc = referrerSnapshot.docs[0];
                        const referrerId = referrerDoc.id;
                        const referrerData = referrerDoc.data();
                        
                        // Add referral info to user
                        userData.usedReferralCode = referralCode.toUpperCase();
                        userData.referredBy = referrerId;
                        
                        // Create referral record
                        const referralData = {
                            referrerId,
                            referrerEmail: referrerData?.email,
                            referredUserId: uid,
                            referredEmail: email,
                            referralCode: referralCode.toUpperCase(),
                            status: 'completed',
                            rewardAmount: 10, // $10 reward for successful referral
                            createdAt: new Date().toISOString(),
                            completedAt: new Date().toISOString(),
                        };
                        
                        await db.collection('referrals').add(referralData);
                    }
                } catch (referralError) {
                    console.error('Error processing referral:', referralError);
                    // Don't fail user creation if referral processing fails
                }
            }

            await userRef.set(userData);

            // If this is the first user (admin), also set custom claims
            if (isFirstUser) {
                await getAuth(admin.app()).setCustomUserClaims(uid, { role: 'admin' });
                console.log(`First user ${email} created with admin role`);
                return NextResponse.json({ 
                    message: 'First user created with admin privileges',
                    role: 'admin'
                }, { status: 201 });
            }

            return NextResponse.json({ 
                message: 'User document created successfully',
                role: 'user',
                referralApplied: !!userData.usedReferralCode
            }, { status: 201 });
        }

        return NextResponse.json({ message: 'User document already exists' }, { status: 200 });

    } catch (error) {
        console.error('Error in create user endpoint:', error);
        return NextResponse.json({ error: 'Unauthorized: Invalid token or server error' }, { status: 401 });
    }
}
