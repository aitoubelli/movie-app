import { useState } from 'react';
import { Search, Film, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { LoginModal } from './LoginModal';

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Trending', href: '/' },
    { name: 'Popular', href: '/popular' },
    { name: 'Upcoming', href: '/upcoming' },
    { name: 'Top Rated', href: '/top-rated' },
    { name: 'Genres', href: '/genres' }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4"
    >
      <div
        className="max-w-7xl mx-auto rounded-2xl px-4 md:px-6 py-3 backdrop-blur-md bg-black/30 border border-cyan-500/20"
        style={{
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.1), inset 0 0 30px rgba(6, 182, 212, 0.05)'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Film className="w-8 h-8 text-cyan-400" />
                <div
                  className="absolute inset-0 blur-xl bg-cyan-400/50"
                  style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                />
              </div>
              <span className="text-xl bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                CineStream
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-4 py-2 text-cyan-100/80 hover:text-cyan-300 transition-colors group"
                >
                  {category.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-400 group-hover:w-full transition-all duration-300" />
                </motion.button>
              </Link>
            ))}
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
              style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
            >
              <Search className="w-5 h-5 text-cyan-300" />
            </motion.button>

            {/* Login Avatar Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLoginModalOpen(true)}
              className="p-2 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 hover:border-violet-400/60 transition-all"
              style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
            >
              <User className="w-5 h-5 text-violet-300" />
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-cyan-300" />
              ) : (
                <Menu className="w-5 h-5 text-cyan-300" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, TV shows..."
                  className="w-full px-6 py-3 bg-black/40 border border-cyan-500/30 rounded-xl text-cyan-100 placeholder:text-cyan-100/40 focus:outline-none focus:border-cyan-400/60 backdrop-blur-sm"
                  style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}
                  autoFocus
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden"
            >
              <div className="flex flex-col gap-2">
                {categories.map((category) => (
                  <Link key={category.name} href={category.href}>
                    <button
                      className="px-4 py-2 text-left text-cyan-100/80 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all w-full"
                    >
                      {category.name}
                    </button>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </motion.nav>
  );
}
