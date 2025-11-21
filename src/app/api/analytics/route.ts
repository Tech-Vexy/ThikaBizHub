import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const cacheKey = 'dashboard_analytics';
    
    // Check cache first (cache for 10 minutes)
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Get total counts using Admin SDK
    const [usersSnapshot, businessesSnapshot, invitesSnapshot] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('businesses').get(),
      adminDb.collection('invites').get()
    ]);

    // Get approved businesses count
    const approvedBusinessesSnapshot = await adminDb.collection('businesses')
      .where('isApproved', '==', true)
      .get();

    // Get pending businesses count
    const pendingBusinessesSnapshot = await adminDb.collection('businesses')
      .where('isApproved', '==', false)
      .get();

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsersSnapshot = await adminDb.collection('users')
      .where('createdAt', '>=', thirtyDaysAgo.toISOString())
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentBusinessesSnapshot = await adminDb.collection('businesses')
      .where('createdAt', '>=', thirtyDaysAgo.toISOString())
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    // Calculate growth rates
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsersCount = await adminDb.collection('users')
      .where('createdAt', '>=', sevenDaysAgo.toISOString())
      .get();

    const recentBusinessesCount = await adminDb.collection('businesses')
      .where('createdAt', '>=', sevenDaysAgo.toISOString())
      .get();

    // Get category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    businessesSnapshot.docs.forEach(doc => {
      const category = doc.data().category;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    // Get county breakdown
    const countyBreakdown: { [key: string]: number } = {};
    businessesSnapshot.docs.forEach(doc => {
      const county = doc.data().location?.county;
      if (county) {
        countyBreakdown[county] = (countyBreakdown[county] || 0) + 1;
      }
    });

    const analytics = {
      overview: {
        totalUsers: usersSnapshot.size,
        totalBusinesses: businessesSnapshot.size,
        approvedBusinesses: approvedBusinessesSnapshot.size,
        pendingBusinesses: pendingBusinessesSnapshot.size,
        totalInvites: invitesSnapshot.size
      },
      growth: {
        newUsersThisWeek: recentUsersCount.size,
        newBusinessesThisWeek: recentBusinessesCount.size,
        userGrowthRate: recentUsersCount.size, // Simplified - in production, calculate percentage
        businessGrowthRate: recentBusinessesCount.size
      },
      breakdown: {
        byCategory: categoryBreakdown,
        byCounty: countyBreakdown
      },
      recent: {
        users: recentUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })),
        businesses: recentBusinessesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      },
      lastUpdated: new Date().toISOString()
    };

    // Cache for 10 minutes
    cache.set(cacheKey, analytics, 600);

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}