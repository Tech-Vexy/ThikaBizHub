import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const reviewsSnapshot = await adminDb
      .collection('reviews')
      .where('businessId', '==', businessId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review: any) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: averageRating.toFixed(1),
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const body = await request.json();
    const { businessId, rating, comment, images } = body;

    if (!businessId || !rating) {
      return NextResponse.json({ error: 'Business ID and rating required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this business
    const existingReview = await adminDb
      .collection('reviews')
      .where('businessId', '==', businessId)
      .where('userId', '==', decodedToken.uid)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json({ error: 'You have already reviewed this business' }, { status: 400 });
    }

    const reviewData = {
      businessId,
      userId: decodedToken.uid,
      userEmail: decodedToken.email,
      rating,
      comment: comment || '',
      images: images || [],
      createdAt: new Date().toISOString(),
      helpful: 0,
    };

    const reviewRef = await adminDb.collection('reviews').add(reviewData);

    // Update business rating
    const reviewsSnapshot = await adminDb
      .collection('reviews')
      .where('businessId', '==', businessId)
      .get();

    const allReviews = reviewsSnapshot.docs.map(doc => doc.data());
    const totalRating = allReviews.reduce((sum, review: any) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    await adminDb.collection('businesses').doc(businessId).update({
      rating: averageRating,
      reviewCount: allReviews.length
    });

    return NextResponse.json({ 
      success: true, 
      reviewId: reviewRef.id,
      averageRating: averageRating.toFixed(1)
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
