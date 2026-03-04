"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { client, urlFor } from "../../sanity";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('[CATEGORIES] 🏷️ Fetching categories from Sanity...');
        const query = `*[_type == "category"]|order(title asc){
          _id,
          title,
          slug,
          image,
          description
        }`;
        
        const data = await client.fetch(query);
        console.log('[CATEGORIES] ✅ Fetched categories:', data);
        
        const mappedCategories = data.map(cat => ({
          name: cat.title,
          slug: cat.slug?.current || cat.slug,
          image: cat.image?.asset?._ref ? urlFor(cat.image).width(600).height(800).url() : '/tshirt.jpg',
          description: cat.description,
        }));
        
        setCategories(mappedCategories);
      } catch (error) {
        console.error('[CATEGORIES] ❌ Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="relative">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.2em] mb-2">
              Shop by{" "}
              <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-200 bg-clip-text text-transparent">
                Category
              </span>
            </h2>
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
          </div>
          <div className="flex justify-center">
            <p className="text-zinc-400 animate-pulse text-xs sm:text-sm">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="relative">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.2em] mb-2">
              Shop by{" "}
              <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-200 bg-clip-text text-transparent">
                Category
              </span>
            </h2>
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
          </div>
          <div className="flex justify-center">
            <p className="text-zinc-400 text-xs sm:text-sm">No categories available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.2em] mb-2">
            Shop by{" "}
            <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-200 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/categories/${category.slug}`}>
                <div className="relative w-full overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/15 transition-all duration-500 group-hover:border-white/40 group-hover:shadow-2xl group-hover:shadow-white/10 rounded-lg aspect-[3/4] max-h-[200px] sm:max-h-[250px] md:max-h-[320px] lg:max-h-[400px]">
                  {/* Image with Filter */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 opacity-70 group-hover:opacity-90 saturate-0 group-hover:saturate-50 rounded-lg"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-white/0 group-hover:from-white/5 group-hover:via-white/0 group-hover:to-white/5 transition-all duration-500" />

                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content Container */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
                    {/* Category Name */}
                    <div className="text-center">
                      <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black uppercase text-white tracking-[0.15em] transition-all duration-500 group-hover:tracking-[0.25em] mb-2 sm:mb-3">
                        {category.name}
                      </h3>
                      
                      {/* Animated Underline */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-0 h-px bg-white group-hover:w-6 transition-all duration-500" />
                        <span className="text-[7px] sm:text-[9px] tracking-[0.25em] uppercase text-white/60 opacity-0 group-hover:opacity-100 transition-all duration-500">
                          Explore
                        </span>
                        <div className="w-0 h-px bg-white group-hover:w-6 transition-all duration-500" />
                      </div>
                    </div>

                    {/* Bottom Corner Detail */}
                    <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-4">
                      <div className="w-8 h-8 border-r border-b border-white/30" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
