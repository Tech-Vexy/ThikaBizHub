import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all businesses
    const businessesSnapshot = await adminDb.collection('businesses').get();
    const businesses = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all reviews
    const reviewsSnapshot = await adminDb.collection('reviews').get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());

    // Calculate category stats
    const categoryMap = new Map();

    businesses.forEach((business: any) => {
      const category = business.category || 'Other';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          totalBusinesses: 0,
          totalRating: 0,
          ratedBusinesses: 0,
          totalReviews: 0,
          topPerformer: null,
          topRating: 0,
        });
      }

      const stats = categoryMap.get(category);
      stats.totalBusinesses++;

      if (business.rating) {
        stats.totalRating += business.rating;
        stats.ratedBusinesses++;

        if (business.rating > stats.topRating) {
          stats.topRating = business.rating;
          stats.topPerformer = business.name;
        }
      }

      stats.totalReviews += business.reviewCount || 0;
    });

    const categoryStats = Array.from(categoryMap.values()).map(stats => ({
      category: stats.category,
      totalBusinesses: stats.totalBusinesses,
      averageRating: stats.ratedBusinesses > 0 ? stats.totalRating / stats.ratedBusinesses : 0,
      totalReviews: stats.totalReviews,
      topPerformer: stats.topPerformer,
    }));

    // Sort by total businesses
    categoryStats.sort((a, b) => b.totalBusinesses - a.totalBusinesses);

    return NextResponse.json({ categoryStats });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
