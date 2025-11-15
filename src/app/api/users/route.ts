import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';

// Helper function to verify the token and check for admin role
async function verifyTokenAndAdmin(req: NextRequest) {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { error: 'Unauthorized: No token provided', status: 401, admin: null };
    }
    const idToken = authorization.split('Bearer ')[1];

    try {
        const decodedToken = await getAuth(admin.app()).verifyIdToken(idToken);
        const user = await getAuth(admin.app()).getUser(decodedToken.uid);
        
        if (user.customClaims?.role !== 'admin') {
            return { error: 'Forbidden: User is not an admin', status: 403, admin: null };
        }
        return { admin: user, error: null, status: 200 };
    } catch (error) {
        console.error('Error verifying token:', error);
        return { error: 'Unauthorized: Invalid token', status: 401, admin: null };
    }
}


export async function GET(req: NextRequest) {
    const { admin: adminUser, error, status } = await verifyTokenAndAdmin(req);
    if (error) {
        return NextResponse.json({ error }, { status });
    }

    try {
        const userRecords = await getAuth(admin.app()).listUsers();
        const users = userRecords.users.map((user) => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: user.customClaims?.role || 'user',
            disabled: user.disabled,
            lastSignInTime: user.metadata.lastSignInTime,
            creationTime: user.metadata.creationTime,
        }));
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('Error listing users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
