"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieGrid } from "@/components/MovieGrid";
import { Footer } from "@/components/Footer";
import { Film, Tv, Sparkles } from 'lucide-react';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'movies' | 'series' | 'anime'>('movies');

  const handleCategoryChange = (category: 'movies' | 'series' | 'anime') => {
    setActiveCategory(category);
  };

  const { data: trendingData, error: trendingError, isLoading: trendingLoading } = useSWR(
    "/api/movies/trending",
    fetcher,
  );

  const { data: popularData, error: popularError, isLoading: popularLoading } = useSWR(
    "/api/movies/popular",
    fetcher,
  );

  // Get featured movie (first trending movie)
  const featuredMovie = trendingData?.data?.results?.[0];

  // Transform movie data to match component interface
  const transformMovie = (movie: Movie) => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    rating: movie.vote_average,
    year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '2024',
    genres: ['Action', 'Sci-Fi'], // TODO: Map genre_ids to actual genre names
  });

  const trendingMovies = trendingData?.data?.results?.slice(1, 13).map(transformMovie) || [];
  const popularMovies = popularData?.data?.results?.slice(0, 12).map(transformMovie) || [];

  const featuredMovieData = featuredMovie ? {
    title: featuredMovie.title,
    description: featuredMovie.overview || 'No description available.',
    rating: featuredMovie.vote_average,
    poster: featuredMovie.poster_path
      ? `https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    backdrop: featuredMovie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`
      : 'https://via.placeholder.com/1920x1080?text=No+Image'
  } : null;

  if (trendingLoading || popularLoading) {
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
            Error Loading Movies
          </h1>
          <p className="text-gray-600">
            Failed to fetch movies. Please try again later.
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

        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-4">
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
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500"
                        style={{ boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-300'} transition-colors`} />
                      <span className={`${isActive ? 'text-white' : 'text-cyan-100/80'} transition-colors`}>
                        {category.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        <MovieGrid title="Trending Now" movies={trendingMovies} />
        <MovieGrid title="Popular This Week" movies={popularMovies} />
      </main>
      <Footer />
    </div>
  );
}
