"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Oversized T-Shirts",
    slug: "oversized-t-shirts",
    image: "/tshirt.jpg",
  },
  {
    name: "Joggers",
    slug: "joggers",
    image: "/joggers.jpg",
  },
  {
    name: "Hoodies",
    slug: "hoodies",
    image: "/hoodie.jpg",
  },
];

export default function Categories() {
  return (
    <div className="py-24 px-8 md:px-16 lg:px-32 bg-black text-white">
      <h2 className="text-5xl font-extrabold text-center mb-16 uppercase tracking-[0.25em]">
        Shop by Category
      </h2>

      {/* Centering using flexbox */}
      <div className="flex flex-wrap justify-center gap-10">
        {categories.map((category) => (
          <motion.div
            key={category.slug}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative group overflow-hidden rounded-3xl shadow-[0px_0px_50px_rgba(255,255,255,0.2)] w-[300px]"
          >
            <Link href={`/categories/${category.slug}`}>
              <div className="relative h-[400px] w-full rounded-3xl overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-all duration-700"></div>

                <div className="absolute inset-0 flex items-end justify-center pb-10">
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold uppercase text-white tracking-widest transition-all duration-500 group-hover:scale-105 group-hover:tracking-[0.3em] group-hover:text-gray-300"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    {category.name}
                  </motion.h3>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 group-hover:shadow-[0px_0px_40px_rgba(255,255,255,0.3)] transition-all duration-500 rounded-3xl"></div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
