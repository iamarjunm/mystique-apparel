import TrendingProducts from "@/components/TrendingProducts";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import Hero from "@/components/Hero";
import BrandStory from "@/components/BrandStory";
import Newsletter from "@/components/Newsletter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-bg text-primary-text dark:bg-primary-bg dark:text-primary-text">
      {/* Hero Section */}
      <Hero />

      {/* Trending Products Section */}
      <section className="py-12">
        <TrendingProducts />
      </section>
      
      {/* Brand Story Section */}
      <section className="py-12">
        <BrandStory />
      </section>

      {/* Categories Section */}
      <section>
        <Categories />
      </section>

      {/* Testimonials Section */}
      {/* <section>
        <Testimonials />
      </section> */}
      
      <section>
        <Newsletter />
      </section>
    </div>
  );
}