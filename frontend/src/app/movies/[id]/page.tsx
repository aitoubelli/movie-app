"use client";

import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  credits: {
    cast: CastMember[];
  };
}

export default function MovieDetail({ params }: { params: { id: string } }) {
  const { data, error, isLoading } = useSWR(
    `http://localhost:8000/api/movies/${params.id}`,
    fetcher,
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Movie
          </h1>
          <p className="text-gray-600">
            Failed to fetch movie details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="aspect-[2/3] bg-gray-300 rounded-lg"></div>
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const movie: Movie = data?.data;

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Movie Not Found
          </h1>
          <p className="text-gray-600">
            The movie you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const topCast = movie.credits?.cast?.slice(0, 5) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg">
            {movie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-lg">No Image</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            <p className="text-lg text-gray-600 mb-4">
              {new Date(movie.release_date).getFullYear()}
            </p>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              ⭐ {movie.vote_average.toFixed(1)}
            </Badge>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">{movie.overview}</p>
          </div>

          {topCast.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-2xl font-semibold mb-4">Top Cast</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topCast.map((actor) => (
                    <div key={actor.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                        {actor.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-500">N/A</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{actor.name}</p>
                        <p className="text-sm text-gray-600">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
