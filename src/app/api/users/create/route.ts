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
                role: 'user'
            }, { status: 201 });
        }

        return NextResponse.json({ message: 'User document already exists' }, { status: 200 });

    } catch (error) {
        console.error('Error in create user endpoint:', error);
        return NextResponse.json({ error: 'Unauthorized: Invalid token or server error' }, { status: 401 });
    }
}
