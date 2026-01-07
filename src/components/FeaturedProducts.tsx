"use client";

import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  colors: string[];
  isNew?: boolean;
  isBestseller?: boolean;
}

const products: Product[] = [
  {
    id: "1",
    name: "Urban Vibes Tee",
    price: 45,
    category: "Street Style",
    colors: ["#1A1614", "#C84B31", "#F5F0EB"],
    isNew: true,
  },
  {
    id: "2",
    name: "Minimalist Wave",
    price: 42,
    originalPrice: 55,
    category: "Essential",
    colors: ["#1A1614", "#2D3A3A"],
    isBestseller: true,
  },
  {
    id: "3",
    name: "Retro Sunset",
    price: 48,
    category: "Vintage",
    colors: ["#C84B31", "#EC7B5F", "#F5F0EB"],
  },
  {
    id: "4",
    name: "Abstract Mind",
    price: 52,
    category: "Art Series",
    colors: ["#1A1614", "#2D3A3A", "#C84B31"],
    isNew: true,
  },
];

function ProductCard({ product }: { product: Product }) {
  return (
    <Link 
      href={`/product/${product.id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] bg-card-bg rounded-2xl overflow-hidden border border-card-border transition-all group-hover:shadow-xl group-hover:border-accent/30">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">NEW</span>
          )}
          {product.isBestseller && (
            <span className="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full">BESTSELLER</span>
          )}
          {product.originalPrice && (
            <span className="px-3 py-1 bg-foreground text-background text-xs font-bold rounded-full">SALE</span>
          )}
        </div>

        {/* Quick Add Button */}
        <button className="absolute bottom-4 left-4 right-4 z-10 py-3 bg-foreground text-background font-medium rounded-full opacity-0 translate-y-4 transition-all group-hover:opacity-100 group-hover:translate-y-0 hover:bg-accent">
          Add to Cart
        </button>

        {/* Placeholder Image */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/5 to-accent/5 transition-transform group-hover:scale-105">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-accent/50">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-muted text-sm">{product.category}</p>
            <h3 className="font-medium text-lg group-hover:text-accent transition-colors">{product.name}</h3>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg">${product.price}</span>
            {product.originalPrice && (
              <span className="block text-muted text-sm line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Color Options */}
        <div className="flex gap-2">
          {product.colors.map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full border border-card-border"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts() {
  return (
    <section className="py-20 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-accent font-medium tracking-wide">CURATED SELECTION</span>
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl mt-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              FEATURED TEES
            </h2>
          </div>
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 text-foreground hover:text-accent transition-colors group"
          >
            View All Products
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
