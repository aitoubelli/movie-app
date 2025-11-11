import { motion } from 'motion/react';
import { Play, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster: string;
    rating: number;
    year: string;
    genres: string[];
  };
  index: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <Link href={`/movies/${movie.id}`}>
        <div className="relative overflow-hidden rounded-xl aspect-[2/3]">
          {/* Poster Image */}
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"
          />

          {/* Glow Effect on Hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 80px rgba(6, 182, 212, 0.4)',
              border: '2px solid rgba(6, 182, 212, 0.5)',
              borderRadius: '0.75rem'
            }}
          />

          {/* Outer Glow */}
          <div
            className="absolute -inset-2 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/30 group-hover:to-violet-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
          />

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-yellow-500/30">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-yellow-100">{movie.rating.toFixed(1)}</span>
          </div>

          {/* Content Overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col justify-end p-5"
          >
            {/* Play Button */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center"
                style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' }}
              >
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </motion.div>

            {/* Movie Info */}
            <div className="space-y-2">
              <h3 className="text-white line-clamp-2">{movie.title}</h3>
              <div className="flex items-center gap-2 text-sm text-cyan-200/80">
                <span>{movie.year}</span>
                <span>•</span>
                <span className="line-clamp-1">{movie.genres.join(', ')}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Glassmorphism Border Effect */}
        <div
          className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover:border-cyan-500/40 transition-all duration-500 pointer-events-none"
        />
      </Link>
    </motion.div>
  );
}
