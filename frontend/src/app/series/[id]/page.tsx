"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Plus, Share2, Star, Clock, Calendar, ThumbsUp, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { MovieCard } from "@/components/MovieCard";
import { TrailerModal } from "@/components/TrailerModal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { use } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Genre {
  id: number;
  name: string;
}

interface Series {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  genres: Genre[];
  credits: {
    cast: CastMember[];
  };
  production_companies?: Array<{
    id: number;
    name: string;
  }>;
}

export default function SeriesDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const { data, error, isLoading } = useSWR(
    `/api/series/${resolvedParams.id}`,
    fetcher,
  );

  const { data: recommendationsData } = useSWR(
    `/api/series/${resolvedParams.id}/recommendations`,
    fetcher,
  );

  if (error) {
    return (
      <div className="min-h-screen bg-[#050510]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400/60 transition-all text-cyan-100 hover:text-cyan-300"
              style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)' }}
            >
              <ArrowLeft className="w-5 h-5 text-cyan-300 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </motion.div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Error Loading Series
            </h1>
            <p className="text-cyan-100/60">
              Failed to fetch series details. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050510]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400/60 transition-all text-cyan-100 hover:text-cyan-300"
              style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)' }}
            >
              <ArrowLeft className="w-5 h-5 text-cyan-300 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </motion.div>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mb-16">
              <div className="w-full aspect-[2/3] bg-gray-700 rounded-2xl"></div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="h-12 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const series: Series = data?.data;

  if (!series) {
    return (
      <div className="min-h-screen bg-[#050510]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400/60 transition-all text-cyan-100 hover:text-cyan-300"
              style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)' }}
            >
              <ArrowLeft className="w-5 h-5 text-cyan-300 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </motion.div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Series Not Found
            </h1>
            <p className="text-cyan-100/60">
              The series you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const topCast = series.credits?.cast?.slice(0, 6) || [];
  const recommendedSeries = recommendationsData?.data?.results?.slice(0, 12).map((rec: any) => ({
    id: rec.id,
    title: rec.name || rec.title || 'Unknown Title',
    poster: rec.poster_path
      ? `https://image.tmdb.org/t/p/w500${rec.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    rating: rec.vote_average,
    year: rec.first_air_date ? new Date(rec.first_air_date).getFullYear().toString() :
          rec.release_date ? new Date(rec.release_date).getFullYear().toString() : '2024',
    genres: rec.genre_ids?.slice(0, 2).map((id: number) => {
      // Simple genre mapping - in production you'd want a proper genre lookup
      const genreMap: { [key: number]: string } = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      };
      return genreMap[id] || 'Unknown';
    }) || ['Action', 'Sci-Fi'],
  })) || [];

  return (
    <div className="min-h-screen bg-[#050510]">
      <Navbar />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-40 mb-8 mt-16"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400/60 transition-all text-cyan-100 hover:text-cyan-300"
            style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)' }}
          >
            <ArrowLeft className="w-5 h-5 text-cyan-300 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </motion.div>

        {/* Hero Section - Two Column Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mb-16"
        >
          {/* Left: Poster */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-cyan-400/30 to-violet-400/30" />
                <ImageWithFallback
                  src={series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={series.name}
                  className="relative w-full aspect-[2/3] object-cover rounded-2xl border-2 border-cyan-500/30"
                  style={{ boxShadow: '0 0 60px rgba(6, 182, 212, 0.4)' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsTrailerOpen(true)}
                  className="w-full group relative px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 overflow-hidden"
                  style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.5)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2 text-white">
                    <Play className="w-5 h-5 fill-white" />
                    <span>Watch Now</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsTrailerOpen(true)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-violet-500/30 hover:border-violet-400/60 transition-all text-violet-100 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Trailer</span>
                </motion.button>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/60 transition-all text-cyan-100 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>My List</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-violet-500/30 hover:border-violet-400/60 transition-all text-violet-100 flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Series Info */}
          <div className="space-y-8">
            {/* Title and Meta */}
            <div>
              <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
                {series.name}
              </h1>
              <p className="text-lg text-cyan-100/60 mb-4">
                {new Date(series.first_air_date).getFullYear()}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-yellow-500/30">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-100">{series.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-cyan-500/20">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-100 text-sm">{series.episode_run_time?.[0] ? `${series.episode_run_time[0]} min` : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-violet-500/20">
                  <Calendar className="w-4 h-4 text-violet-400" />
                  <span className="text-violet-200 text-sm">{new Date(series.first_air_date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {series.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-200 text-sm backdrop-blur-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div>
              <h2 className="text-2xl mb-4 bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Overview
              </h2>
              <p className="text-lg text-cyan-100/80 leading-relaxed">
                {series.overview}
              </p>
            </div>

            {/* Production Info */}
            {series.production_companies && series.production_companies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-cyan-500/20">
                  <p className="text-cyan-100/60 text-sm mb-1">Studio</p>
                  <p className="text-cyan-100">{series.production_companies[0].name}</p>
                </div>
                <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-cyan-500/20">
                  <p className="text-cyan-100/60 text-sm mb-1">Seasons</p>
                  <p className="text-cyan-100">{series.number_of_seasons}</p>
                </div>
                <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-cyan-500/20">
                  <p className="text-cyan-100/60 text-sm mb-1">Episodes</p>
                  <p className="text-cyan-100">{series.number_of_episodes}</p>
                </div>
              </div>
            )}

            {/* Top Cast */}
            {topCast.length > 0 && (
              <div>
                <h2 className="text-2xl mb-6 bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                  Top Cast
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {topCast.map((actor) => (
                    <motion.div
                      key={actor.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/40 transition-all cursor-pointer"
                    >
                      <div className="relative flex-shrink-0">
                        <ImageWithFallback
                          src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/150x150?text=No+Image'}
                          alt={actor.name}
                          className="w-12 h-12 rounded-full object-cover border border-cyan-500/30"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-cyan-100 truncate">{actor.name}</p>
                        <p className="text-cyan-100/60 text-sm truncate">{actor.character}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recommended Series */}
        {recommendedSeries.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl mb-8 bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
              Recommended For You
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {recommendedSeries.map((series: any, index: number) => (
                <MovieCard key={series.id} movie={series} index={index} category="series" />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        movieTitle={series.name}
      />
      <Footer />
    </div>
  );
}
