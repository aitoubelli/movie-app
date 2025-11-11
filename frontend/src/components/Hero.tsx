import { motion } from 'motion/react';
import { Play, Info, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  movie: {
    id?: number;
    title: string;
    description: string;
    rating: number;
    poster: string;
    backdrop: string;
  };
}

export function Hero({ movie }: HeroProps) {
  return (
    <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src={movie.backdrop}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(5, 5, 16, 0.95) 0%, rgba(5, 5, 16, 0.7) 50%, rgba(5, 5, 16, 0.95) 100%), linear-gradient(to top, rgba(5, 5, 16, 1) 0%, rgba(5, 5, 16, 0) 50%)'
          }}
        />
        {/* Neon Glow Effect */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.15), transparent 60%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center">
        <div className="max-w-3xl pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Featured Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 backdrop-blur-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-cyan-100">Featured Today</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
              {movie.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-cyan-500/20">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-cyan-100">{movie.rating.toFixed(1)}</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-violet-500/20">
                <span className="text-violet-200">2024</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-cyan-500/20">
                <span className="text-cyan-200">Action • Sci-Fi</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-cyan-100/80 mb-8 leading-relaxed max-w-2xl">
              {movie.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.5)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2 text-white">
                  <Play className="w-5 h-5 fill-white" />
                  <span>Watch Trailer</span>
                </div>
              </motion.button>

              <Link href={`/movies/${movie.id || 1}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 rounded-xl bg-black/40 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
                  style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}
                >
                  <div className="flex items-center gap-2 text-cyan-100 group-hover:text-cyan-300 transition-colors">
                    <Info className="w-5 h-5" />
                    <span>More Info</span>
                  </div>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Poster with Glow */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <div
              className="absolute inset-0 blur-3xl bg-gradient-to-br from-cyan-400/30 to-violet-400/30 transform scale-105"
            />
            <Image
              src={movie.poster}
              alt={movie.title}
              width={320}
              height={480}
              className="relative w-80 h-[480px] object-cover rounded-2xl border-2 border-cyan-500/30"
              style={{ boxShadow: '0 0 60px rgba(6, 182, 212, 0.4)' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-20"
        style={{
          background: 'linear-gradient(to top, rgba(5, 5, 16, 1), transparent)'
        }}
      />
    </div>
  );
}
