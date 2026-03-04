'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { client } from '@/sanity';
import HeroNew from '@/components/HeroNew';
import MarqueeBanner from '@/components/MarqueeBanner';
import TrendingProducts from '@/components/TrendingProducts';
import Categories from '@/components/Categories';
import PromoCountdown from '@/components/PromoCountdown';
import EditorialSection from '@/components/EditorialSection';
import Newsletter from '@/components/Newsletter';
import PromoGameSelector from '@/components/PromoGameSelector';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function HomePage() {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState(null);

  // Fetch game settings and show game after configured delay on first load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "siteSettings"][0] {
            promotionalGames {
              enabled,
              activeGame,
              autoOpenDelay,
              showFloatingButton
            }
          }`
        );
        setGameSettings(data);

        if (data?.promotionalGames?.enabled && data.promotionalGames.autoOpenDelay > 0) {
          const timer = setTimeout(() => {
            setIsGameOpen(true);
          }, data.promotionalGames.autoOpenDelay * 1000);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error fetching game settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black selection:bg-white/30 text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <main>
          {/* Hero Section */}
          <motion.div variants={itemVariants}>
            <HeroNew />
          </motion.div>

          {/* Marquee Banner */}
          <motion.div variants={itemVariants}>
            <MarqueeBanner />
          </motion.div>

          {/* Latest Drop / Trending Products */}
          <motion.section
            variants={itemVariants}
            className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-20 bg-black"
          >
            <TrendingProducts />
          </motion.section>

          {/* Shop by Category */}
          <motion.section
            variants={itemVariants}
            className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-20 bg-black"
          >
            <Categories />
          </motion.section>

          {/* Promo / Countdown Section - Only shows if promo is active */}
          <motion.div variants={itemVariants}>
            <PromoCountdown />
          </motion.div>

          {/* Editorial Section */}
          <motion.div variants={itemVariants}>
            <EditorialSection />
          </motion.div>

          {/* Newsletter Section */}
          <motion.section
            variants={itemVariants}
            className="py-12 sm:py-16 md:py-20"
          >
            <Newsletter />
          </motion.section>

          {/* Floating Game Trigger Button */}
          {gameSettings?.promotionalGames?.showFloatingButton && (
            <button
              onClick={() => setIsGameOpen(true)}
              className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-40 group bg-black border border-white/30 hover:bg-zinc-900"
              title="Mystery Rewards"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:via-white/20 transition-all duration-300" />
              <span className="relative text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-300">
                ⬢
              </span>
            </button>
          )}
        </main>
      </motion.div>

      {/* Promo Game Selector */}
      <PromoGameSelector isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
    </>
  );
}