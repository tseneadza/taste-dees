"use client";

import Link from "next/link";

const categories = [
  {
    name: "Street Style",
    description: "Urban edge meets comfort",
    count: 45,
    gradient: "from-accent to-accent-light",
  },
  {
    name: "Minimalist",
    description: "Less is more",
    count: 32,
    gradient: "from-secondary to-muted",
  },
  {
    name: "Vintage",
    description: "Timeless classics",
    count: 28,
    gradient: "from-[#8B6914] to-[#C9A227]",
  },
  {
    name: "Art Series",
    description: "Wearable masterpieces",
    count: 21,
    gradient: "from-[#6B4E71] to-[#9B7FA8]",
  },
];

export default function Categories() {
  return (
    <section className="py-20 md:py-32 bg-card-bg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-grid opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-accent font-medium tracking-wide">EXPLORE</span>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mt-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            SHOP BY STYLE
          </h2>
          <p className="text-muted mt-4 max-w-xl mx-auto">
            Find your perfect match from our curated collections
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={`/collections/${category.name.toLowerCase().replace(' ', '-')}`}
              className="group relative aspect-[2/1] rounded-3xl overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 transition-opacity group-hover:opacity-100`} />
              
              {/* Content */}
              <div className="relative h-full p-8 flex flex-col justify-between text-white">
                <div>
                  <p className="text-white/80 text-sm mb-1">{category.count} Products</p>
                  <h3 
                    className="text-3xl md:text-4xl lg:text-5xl"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {category.name.toUpperCase()}
                  </h3>
                </div>
                
                <div className="flex items-end justify-between">
                  <p className="text-white/80">{category.description}</p>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110 group-hover:bg-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-black/10 blur-3xl" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
