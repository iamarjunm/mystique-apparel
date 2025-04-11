"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Aryan Singh",
    review: "Mystique Apparel's oversized tees are a game-changer. The fit, the fabric—pure perfection!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sara Kapoor",
    review: "Absolutely in love with the joggers! Super comfy and stylish at the same time.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Neel Patel",
    review: "The quality of these t-shirts is insane. Definitely my go-to brand now!",
    image: "https://randomuser.me/api/portraits/men/56.jpg",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-black via-gray-900 to-black text-white py-20 px-8 md:px-16 lg:px-32">
      <h2 className="text-4xl font-bold text-center mb-12 uppercase tracking-widest">
        What Our Customers Say
      </h2>

      <div className="relative max-w-4xl mx-auto">
        {/* Testimonial Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex flex-col items-center bg-white/10 backdrop-blur-lg px-10 py-8 rounded-3xl shadow-[0px_0px_40px_rgba(255,255,255,0.1)] text-center"
          >
            <img
              src={testimonials[index].image}
              alt={testimonials[index].name}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            />
            <p className="text-lg mt-6 text-gray-200 italic max-w-xl">
              "{testimonials[index].review}"
            </p>
            <h4 className="text-xl font-semibold mt-4 text-white">{testimonials[index].name}</h4>
            <div className="flex mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-500" fill="yellow" />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)}
          className="absolute top-1/2 -left-12 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full shadow-lg transition-all duration-300"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <button
          onClick={() => setIndex((index + 1) % testimonials.length)}
          className="absolute top-1/2 -right-12 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full shadow-lg transition-all duration-300"
        >
          <ChevronRight className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}
