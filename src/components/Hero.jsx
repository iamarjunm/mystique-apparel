"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useTransform, useScroll } from "framer-motion";

export default function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]); // Parallax effect

  // Mouse trailer logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInHeroSection, setIsInHeroSection] = useState(false); // Track if the mouse is in the Hero section
  const heroRef = useRef(null); // Ref to the Hero section

  // Floating particles logic
  const [particles, setParticles] = useState([]);
  const [isLoadingParticles, setIsLoadingParticles] = useState(true);

  // Custom cursor size and animation state
  const [cursorSize, setCursorSize] = useState(32); // Default size
  const [cursorVariant, setCursorVariant] = useState("default"); // Animation variant

  useEffect(() => {
    // Generate random positions only on the client
    const generateParticles = () => {
      const particlesArray = Array.from({ length: 30 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
      }));
      setParticles(particlesArray);
      setIsLoadingParticles(false);
    };

    generateParticles();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Check if the mouse is within the Hero section
      if (heroRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const isInsideHero =
          e.clientX >= heroRect.left &&
          e.clientX <= heroRect.right &&
          e.clientY >= heroRect.top &&
          e.clientY <= heroRect.bottom;

        setIsInHeroSection(isInsideHero);

        // Change cursor size and variant based on hover state
        if (isInsideHero) {
          setCursorVariant("hover");
          setCursorSize(48); // Increase size on hover
        } else {
          setCursorVariant("default");
          setCursorSize(32); // Reset size
        }
      }
    };

    const handleScroll = () => {
      if (heroRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        // Check if the Hero section is still in view
        const isHeroInView =
          heroRect.bottom > 0 && heroRect.top < window.innerHeight;

        // If the Hero section is not in view, hide the custom cursor
        if (!isHeroInView) {
          setIsInHeroSection(false);
          setCursorVariant("default");
          setCursorSize(32); // Reset size
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      ref={heroRef} // Attach the ref to the Hero section
      className="relative h-screen flex items-end justify-center text-center overflow-hidden bg-black pb-20" // Changed to items-end and added pb-20
    >
      {/* Background Image with Parallax Effect */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://cdn.shopify.com/s/files/1/0591/7045/5631/files/IMG_3685.jpg?v=1741951244')",
          y, // Parallax effect
        }}
      >
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
      </motion.div>

      {/* Content - Moved to bottom */}
      <div className="relative z-10 px-4 sm:px-6 md:px-12 text-white">
        {/* Animated Heading */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 text-element"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Drawing Out Your Mystique
        </motion.h1>

        {/* Animated Subheading */}
        <motion.p
          className="text-lg sm:text-xl mb-8 text-gray-300 leading-relaxed max-w-2xl mx-auto text-element"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          Explore unique and edgy designs that redefine style and comfort.
        </motion.p>
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <a
            href="/shop"
            className="inline-block px-8 py-4 bg-white text-black font-bold rounded-md text-lg hover:bg-gray-300"
          >
            Shop Now
          </a>
        </motion.div>
      </div>

      {/* Floating Particles Animation */}
      <div className="absolute inset-0 z-0">
        {isLoadingParticles ? null : (
          <>
            {particles.map((particle, index) => (
              <motion.div
                key={index}
                className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                style={{
                  top: `${particle.top}%`,
                  left: `${particle.left}%`,
                }}
                initial={{ y: 0 }}
                animate={{ y: [0, -20, 0] }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Interactive Mouse Trailer */}
      {isInHeroSection && (
        <motion.div
          className="fixed rounded-full pointer-events-none z-50 bg-white mix-blend-difference"
          style={{
            left: mousePosition.x - cursorSize / 2,
            top: mousePosition.y - cursorSize / 2,
            width: cursorSize,
            height: cursorSize,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 10 },
          }}
          whileHover={{ scale: 1.2 }} // Scale up on hover
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        />
      )}

      {/* Hide default cursor inside Hero section */}
      <style jsx global>{`
        body {
          cursor: ${isInHeroSection ? "none" : "auto"};
        }
      `}</style>
    </section>
  );
}