"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function AmbientExperience() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[1.5px] origin-left z-[70] pointer-events-none bg-[#F4F2ED] mix-blend-difference"
      aria-hidden="true"
    />
  );
}
