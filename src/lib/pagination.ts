import { 
  query, 
  orderBy, 
  limit as firestoreLimit, 
  startAfter, 
  endBefore,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
  Query,
  getDocs,
  where
} from 'firebase/firestore';

export interface PaginationOptions {
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  endBeforeDoc?: QueryDocumentSnapshot<DocumentData>;
  filters?: Array<{
    field: string;
    operator: any;
    value: any;
  }>;
}

export interface PaginatedResult<T> {
  data: T[];
  nextPageToken?: QueryDocumentSnapshot<DocumentData>;
  prevPageToken?: QueryDocumentSnapshot<DocumentData>;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount?: number;
}

export class PaginationHelper {
  static async paginate<T>(
    collection: CollectionReference<DocumentData>,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      pageSize = 10,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      startAfterDoc,
      endBeforeDoc,
      filters = []
    } = options;

    // Build the query
    let q: Query<DocumentData> = collection;

    // Apply filters
    for (const filter of filters) {
      q = query(q, where(filter.field, filter.operator, filter.value));
    }

    // Add ordering
    q = query(q, orderBy(orderByField, orderDirection));

    // Add pagination
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }
    if (endBeforeDoc) {
      q = query(q, endBefore(endBeforeDoc));
    }

    // Add limit (request one extra to check if there's a next page)
    q = query(q, firestoreLimit(pageSize + 1));

    // Execute query
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    // Check if we have more pages
    const hasNextPage = docs.length > pageSize;
    const hasPrevPage = !!startAfterDoc;

    // Remove the extra document if present
    const data = docs.slice(0, pageSize).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];

    // Get pagination tokens
    const nextPageToken = hasNextPage ? docs[pageSize - 1] : undefined;
    const prevPageToken = hasPrevPage ? docs[0] : undefined;

    return {
      data,
      nextPageToken,
      prevPageToken,
      hasNextPage,
      hasPrevPage
    };
  }

  // Get total count for a collection (cached)
  static async getTotalCount(
    collection: CollectionReference<DocumentData>,
    filters: Array<{ field: string; operator: any; value: any }> = []
  ): Promise<number> {
    let q: Query<DocumentData> = collection;

    // Apply filters
    for (const filter of filters) {
      q = query(q, where(filter.field, filter.operator, filter.value));
    }

    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Search with pagination
  static async search<T>(
    collection: CollectionReference<DocumentData>,
    searchField: string,
    searchTerm: string,
    options: Omit<PaginationOptions, 'filters'> = {}
  ): Promise<PaginatedResult<T>> {
    // For simple prefix search
    const searchFilters = [
      { field: searchField, operator: '>=', value: searchTerm },
      { field: searchField, operator: '<=', value: searchTerm + '\uf8ff' }
    ];

    return this.paginate<T>(collection, {
      ...options,
      filters: searchFilters
    });
  }
}