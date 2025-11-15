'use client';

import { useState } from 'react';
import { 
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  endBefore
} from 'firebase/firestore';

// Minimal pagination types and helper inlined to avoid missing ./pagination module
export interface PaginationOptions {
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  endBeforeDoc?: QueryDocumentSnapshot<DocumentData>;
}

interface PaginationResult<T> {
  data: T[];
  nextPageToken?: QueryDocumentSnapshot<DocumentData>;
  prevPageToken?: QueryDocumentSnapshot<DocumentData>;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class PaginationHelper {
  static async paginate<T>(
    collection: CollectionReference<DocumentData>,
    options: PaginationOptions = {}
  ): Promise<PaginationResult<T>> {
    const pageSize = options.pageSize ?? 10;
    const constraints: any[] = [];

    const orderField = options.orderByField ?? '__name__';
    constraints.push(orderBy(orderField, options.orderDirection ?? 'asc'));

    if (options.startAfterDoc) {
      constraints.push(startAfter(options.startAfterDoc));
    }

    if (options.endBeforeDoc) {
      constraints.push(endBefore(options.endBeforeDoc));
    }

    // Fetch one extra doc to determine if there is a next page
    constraints.push(limit(pageSize + 1));

    const q = query(collection, ...constraints);
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    const hasNextPage = docs.length > pageSize;
    // hasPrevPage cannot be perfectly inferred without additional state; approximate from provided tokens
    const hasPrevPage = !!options.startAfterDoc || !!options.endBeforeDoc;

    const pageDocs = docs.slice(0, pageSize);
    const data = pageDocs.map(doc => doc.data() as T);
    const nextPageToken = pageDocs.length ? pageDocs[pageDocs.length - 1] : undefined;
    const prevPageToken = pageDocs.length ? pageDocs[0] : undefined;

    return {
      data,
      nextPageToken,
      prevPageToken,
      hasNextPage,
      hasPrevPage
    };
  }
}

// React hook for pagination
export function usePagination<T>() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [nextPageToken, setNextPageToken] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();
  const [prevPageToken, setPrevPageToken] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = async (
    collection: CollectionReference<DocumentData>,
    options: PaginationOptions = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await PaginationHelper.paginate<T>(collection, options);
      setData(result.data);
      setNextPageToken(result.nextPageToken);
      setPrevPageToken(result.prevPageToken);
      setHasNextPage(result.hasNextPage);
      setHasPrevPage(result.hasPrevPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const nextPage = async (
    collection: CollectionReference<DocumentData>,
    options: PaginationOptions = {}
  ) => {
    if (nextPageToken && hasNextPage) {
      await loadPage(collection, {
        ...options,
        startAfterDoc: nextPageToken
      });
    }
  };

  const prevPage = async (
    collection: CollectionReference<DocumentData>,
    options: PaginationOptions = {}
  ) => {
    if (prevPageToken && hasPrevPage) {
      await loadPage(collection, {
        ...options,
        endBeforeDoc: prevPageToken
      });
    }
  };

  return {
    data,
    loading,
    error,
    hasNextPage,
    hasPrevPage,
    loadPage,
    nextPage,
    prevPage
  };
}