import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const body = await request.json();
    const { businessId, reason, description } = body;

    if (!businessId || !reason) {
      return NextResponse.json({ error: 'Business ID and reason required' }, { status: 400 });
    }

    const reportData = {
      businessId,
      reportedBy: decodedToken.uid,
      reporterEmail: decodedToken.email,
      reason,
      description: description || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection('reports').add(reportData);

    return NextResponse.json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
