import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { adminAuth } from '@/lib/firebaseAdmin';
import admin from '@/lib/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const county = searchParams.get('county');
    const search = searchParams.get('search');
    
    // Build cache key
    const cacheKey = `businesses_${page}_${limit}_${category || ''}_${county || ''}_${search || ''}`;
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // For development, use simpler queries to avoid index requirements
    // Get all approved businesses and filter in memory
    const db = getFirestore(admin.app());
    const businessesSnapshot = await db.collection('businesses')
      .where('isApproved', '==', true)
      .get();

    let allBusinesses = businessesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Apply filters in memory
    if (category && category !== 'all') {
      allBusinesses = allBusinesses.filter(b => b.category === category);
    }

    if (county && county !== 'all') {
      allBusinesses = allBusinesses.filter(b => b.location?.county === county);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allBusinesses = allBusinesses.filter(business => 
        business.name?.toLowerCase().includes(searchLower) ||
        business.description?.toLowerCase().includes(searchLower) ||
        business.category?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    allBusinesses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination manually
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBusinesses = allBusinesses.slice(startIndex, endIndex);

    const response = {
      businesses: paginatedBusinesses,
      pagination: {
        currentPage: page,
        hasNextPage: endIndex < allBusinesses.length,
        hasPrevPage: page > 1,
        totalPages: Math.ceil(allBusinesses.length / limit)
      }
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, response, 300);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const body = await request.json();
    const {
      name,
      description,
      category,
      location,
      contact,
      website,
      images
    } = body;

    // Validate required fields
    if (!name || !description || !category || !location || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create business document
    const businessData = {
      name,
      description,
      category,
      location: {
        county: location.county,
        town: location.town,
        address: location.address,
        coordinates: location.coordinates || null
      },
      contact: {
        phone: contact.phone,
        email: contact.email,
        whatsapp: contact.whatsapp || null
      },
      website: website || null,
      images: images || [],
      ownerId: decodedToken.uid,
      isApproved: false,
      isPremium: false,
      views: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to Firestore using Admin SDK
    const db = getFirestore(admin.app());
    const docRef = await db.collection('businesses').add(businessData);
    
    // Clear relevant caches
    cache.delete('businesses_stats');
    
    return NextResponse.json({
      message: 'Business submitted successfully',
      businessId: docRef.id,
      status: 'pending_approval'
    });

  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}