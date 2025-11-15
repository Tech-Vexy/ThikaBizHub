import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';

// Helper function to verify the token and check for admin role
async function verifyTokenAndAdmin(req: NextRequest) {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { error: 'Unauthorized: No token provided', status: 401 };
    }
    const idToken = authorization.split('Bearer ')[1];

    try {
        const decodedToken = await getAuth(admin.app()).verifyIdToken(idToken);
        const user = await getAuth(admin.app()).getUser(decodedToken.uid);
        
        if (user.customClaims?.role !== 'admin') {
            return { error: 'Forbidden: User is not an admin', status: 403 };
        }
        return { error: null, status: 200 };
    } catch (error) {
        console.error('Error verifying token:', error);
        return { error: 'Unauthorized: Invalid token', status: 401 };
    }
}

export async function POST(req: NextRequest) {
    const { error, status } = await verifyTokenAndAdmin(req);
    if (error) {
        return NextResponse.json({ error }, { status });
    }

    const { uid, role } = await req.json();

    if (!uid || !role) {
        return NextResponse.json({ error: 'Bad Request: Missing uid or role' }, { status: 400 });
    }

    try {
        await getAuth(admin.app()).setCustomUserClaims(uid, { role });
        return NextResponse.json({ message: `Successfully set role '${role}' for user ${uid}` }, { status: 200 });
    } catch (error) {
        console.error('Error setting custom claims:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
