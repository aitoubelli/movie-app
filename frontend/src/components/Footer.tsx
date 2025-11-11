import { Film, Github } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export function Footer() {
  const links = {
    'My Other Work': [
      { name: 'About Me', href: '/about' },
      { name: 'Portfolio', href: '#' },
      { name: 'Blog', href: '#' },
    ]
  };

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: 'https://github.com/aitoubelli/movie-app' }
  ];

  return (
    <footer className="relative mt-20 px-4 md:px-8 py-12 border-t border-cyan-500/20">
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.03))'
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 mb-4 cursor-pointer"
              >
                <div className="relative">
                  <Film className="w-8 h-8 text-cyan-400" />
                  <div className="absolute inset-0 blur-xl bg-cyan-400/50" />
                </div>
                <span className="text-xl bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  CineStream
                </span>
              </motion.div>
            </Link>
            <p className="text-cyan-100/60 mb-6 max-w-sm">
              This project is for demonstration purposes only and does not host any content.
              if you enjoy it, consider starring the repository on GitHub!
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
                  style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-cyan-300" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-4 bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                {category}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <motion.a
                        href={item.href}
                        whileHover={{ x: 4 }}
                        className="text-cyan-100/60 hover:text-cyan-300 transition-colors inline-block"
                      >
                        {item.name}
                      </motion.a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cyan-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cyan-100/50 text-sm">
            © 2024 CineStream. Made by Salah. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-cyan-100/50">
            <span>Powered by</span>
            <span className="px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              TMDB
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
