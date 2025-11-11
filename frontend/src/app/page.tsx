"use client";

import useSWR from "swr";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieGrid } from "@/components/MovieGrid";
import { Footer } from "@/components/Footer";

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
  const { data: trendingData, error: trendingError, isLoading: trendingLoading } = useSWR(
    "http://localhost:8000/api/movies/trending",
    fetcher,
  );

  const { data: popularData, error: popularError, isLoading: popularLoading } = useSWR(
    "http://localhost:8000/api/movies/popular",
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
        <MovieGrid title="Trending Now" movies={trendingMovies} />
        <MovieGrid title="Popular This Week" movies={popularMovies} />
      </main>
      <Footer />
    </div>
  );
}
