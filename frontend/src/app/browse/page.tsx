"use client";

import { BrowsePage } from '@/components/BrowsePage';
import { Navbar } from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Browse() {
  const searchParams = useSearchParams();
  const [initialFilters, setInitialFilters] = useState<{
    category?: string;
    year?: string;
    genre?: string;
    search?: string;
    type?: 'all' | 'movie' | 'tv' | 'anime';
  }>({});

  useEffect(() => {
    // Read URL parameters and set initial filters
    const filters: {
      category?: string;
      year?: string;
      genre?: string;
      search?: string;
      type?: 'all' | 'movie' | 'tv' | 'anime';
    } = {};

    const sortBy = searchParams.get('sortBy');
    if (sortBy) {
      filters.category = sortBy; // BrowsePage expects 'category' for sortBy
    }

    const type = searchParams.get('type');
    if (type && ['all', 'movie', 'tv', 'anime'].includes(type)) {
      filters.type = type as 'all' | 'movie' | 'tv' | 'anime';
    }

    const genre = searchParams.get('genre');
    if (genre) {
      filters.genre = genre;
    }

    const year = searchParams.get('year');
    if (year) {
      filters.year = year;
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    setInitialFilters(filters);
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <BrowsePage initialFilters={initialFilters} />
    </>
  );
}
