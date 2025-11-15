"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieGrid } from "@/components/MovieGrid";
import { MovieCard } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { Film, Tv, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Authenticated fetcher for continue watching
const authenticatedFetcher = async (url: string, user: any) => {
  const idToken = await user.getIdToken();
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch continue watching');
  return response.json();
};

interface ContentItem {
  id: number;
  title: string;
  name?: string; // For series/anime
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  progress?: number; // For continue watching
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'movies' | 'series' | 'anime'>('movies');
  const { user } = useAuth();

  const handleCategoryChange = (category: 'movies' | 'series' | 'anime') => {
    setActiveCategory(category);
  };

  const { data: trendingData, error: trendingError, isLoading: trendingLoading } = useSWR(
    activeCategory === 'movies' ? "/api/movies/trending?type=movie" :
    activeCategory === 'series' ? "/api/series/trending?type=tv" :
    "/api/anime/trending",
    fetcher,
  );

  const { data: popularData, error: popularError, isLoading: popularLoading } = useSWR(
    activeCategory === 'movies' ? "/api/movies/popular?type=movie" :
    activeCategory === 'series' ? "/api/series/popular?type=tv" :
    "/api/anime/popular",
    fetcher,
  );

  // Fetch featured movie IDs
  const { data: featuredIdsData, error: featuredIdsError, isLoading: featuredIdsLoading } = useSWR(
    "/api/featured",
    fetcher,
  );

  // Fetch full movie data for featured IDs in parallel
  const { data: featuredMoviesData, error: featuredMoviesError, isLoading: featuredMoviesLoading } = useSWR(
    featuredIdsData?.movieIds?.length > 0 ? featuredIdsData.movieIds.map((id: number) => `/api/movies/content/movie/${id}`) : null,
    async (urls: string[]) => {
      if (!urls) return [];
      const responses = await Promise.all(urls.map((url: string) => fetch(url).then(res => res.json())));
      return responses.filter((response: any) => response.success).map((response: any) => response.data);
    },
  );

  // Fetch continue watching data (only if user is authenticated)
  const { data: continueWatchingData, error: continueWatchingError, isLoading: continueWatchingLoading } = useSWR(
    user ? "/api/movies/continue-watching" : null,
    (url: string) => authenticatedFetcher(url, user),
  );

  // Fetch newest releases
  const { data: newestData, error: newestError, isLoading: newestLoading } = useSWR(
    "/api/movies/now-playing",
    fetcher,
  );

  // Get featured movie (first trending movie)
  const featuredMovie = trendingData?.data?.results?.[0];

  // Transform content data to match component interface
  const transformContent = (item: ContentItem) => ({
    id: item.id,
    title: item.title || item.name || 'Unknown Title',
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    rating: item.vote_average,
    year: item.release_date ? new Date(item.release_date).getFullYear().toString() :
          item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : '2024',
    genres: ['Action', 'Sci-Fi'], // TODO: Map genre_ids to actual genre names
  });

  // Transform continue watching data
  const continueWatchingMovies = continueWatchingData?.data?.results?.slice(0, 6).map((item: ContentItem) => ({
    id: item.id,
    title: item.title || item.name || 'Unknown Title',
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    rating: item.vote_average,
    year: item.release_date ? new Date(item.release_date).getFullYear().toString() :
          item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : '2024',
    genres: ['Action', 'Sci-Fi'], // TODO: Map genre_ids to actual genre names
    progress: item.progress,
  })) || [];





  // Transform newest releases data
  const newestMovies = newestData?.data?.results?.slice(0, 12).map(transformContent) || [];

  const trendingMovies = trendingData?.data?.results?.slice(1, 13).map(transformContent) || [];
  const popularMovies = popularData?.data?.results?.slice(0, 12).map(transformContent) || [];

  // Transform featured movies data
  const featuredMovies = featuredMoviesData?.map((movie: any) => ({
    id: movie.id,
    title: movie.title || 'Unknown Title',
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    rating: movie.vote_average || 0,
    year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '2024',
    genres: movie.genres?.slice(0, 2).map((genre: any) => genre.name) || ['Action', 'Drama'],
  })) || [];

  const featuredMovieData = featuredMovie ? {
    title: featuredMovie.title || featuredMovie.name || 'Unknown Title',
    description: featuredMovie.overview || 'No description available.',
    rating: featuredMovie.vote_average,
    poster: featuredMovie.poster_path
      ? `https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    backdrop: featuredMovie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`
      : 'https://via.placeholder.com/1920x1080?text=No+Image'
  } : null;

  if (trendingLoading || popularLoading || featuredIdsLoading) {
    return (
      <div className="min-h-screen bg-[#050510] dark overflow-x-hidden flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (trendingError || popularError) {
    return (
      <div className="min-h-screen bg-[#050510] dark overflow-x-hidden flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Content
          </h1>
          <p className="text-gray-600">
            Failed to fetch content. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] dark overflow-x-hidden">
      <StarfieldBackground />
      <Navbar />
      <main>
        {featuredMovieData && <Hero movie={featuredMovieData} />}

        {/* Mobile Category Switcher - Horizontal with text */}
        <div className="md:hidden px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="flex items-center gap-2 p-3 rounded-2xl backdrop-blur-md bg-black/40 border border-cyan-500/30 max-w-fit">
              {[
                { id: 'movies' as const, label: 'Movies', icon: Film },
                { id: 'series' as const, label: 'Series', icon: Tv },
                { id: 'anime' as const, label: 'Anime', icon: Sparkles }
              ].map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryChange(category.id)}
                    className="relative px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveCategory"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500"
                        style={{ boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-300'} transition-colors relative z-10`} />
                    <span className={`${isActive ? 'text-white' : 'text-cyan-100/80'} transition-colors text-sm font-medium relative z-10`}>
                      {category.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Desktop Category Switcher - Vertical icons only */}
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-4 hidden md:block">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start"
          >
            <div
              className="inline-flex flex-col items-center gap-2 p-2 rounded-2xl backdrop-blur-md bg-black/40 border border-cyan-500/30"
              style={{ boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)' }}
            >
              {[
                { id: 'movies' as const, label: 'Movies', icon: Film },
                { id: 'series' as const, label: 'Series', icon: Tv },
                { id: 'anime' as const, label: 'Anime', icon: Sparkles }
              ].map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryChange(category.id)}
                    className="relative px-6 py-3 rounded-xl transition-all"
                    title={category.label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktopActiveCategory"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500"
                        style={{ boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-300'} transition-colors`} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Continue Watching Section */}
        {user && continueWatchingMovies.length > 0 && (
          <MovieGrid title="Continue Watching" movies={continueWatchingMovies} category="movies" enableWatchlistToggle={true} showProgress={true} />
        )}

        {/* Newest Releases Section */}
        {newestMovies.length > 0 && (
          <MovieGrid title="Newest Releases" movies={newestMovies} category="movies" enableWatchlistToggle={true} />
        )}

        {/* Featured Now Section */}
        {featuredMovies.length > 0 && (
          <section className="py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-3xl md:text-4xl bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent inline-block relative">
                  Featured Now
                  <div
                    className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full"
                    style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)' }}
                  />
                </h2>
              </motion.div>

              {/* Mobile: Horizontal scroll */}
              <div className="md:hidden overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {featuredMovies.map((movie, index) => (
                    <div key={movie.id} className="flex-shrink-0 w-48">
                      <MovieCard movie={movie} index={index} category="movies" enableWatchlistToggle={true} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Grid */}
              <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {featuredMovies.map((movie, index) => (
                  <MovieCard key={movie.id} movie={movie} index={index} category="movies" enableWatchlistToggle={true} />
                ))}
              </div>
            </div>
          </section>
        )}

        <MovieGrid title="Trending Now" movies={trendingMovies} category={activeCategory} enableWatchlistToggle={true} />
        <MovieGrid title="Popular This Week" movies={popularMovies} category={activeCategory} enableWatchlistToggle={true} />
      </main>
      <Footer />
    </div>
  );
}
