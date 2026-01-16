"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter to only products with valid images, then show first 4 (prioritizing new and bestseller items)
  const featuredProducts = products
    .filter((p) => p.images && p.images.length > 0 && p.images[0].trim() !== '')
    .sort((a, b) => {
      // Prioritize bestsellers, then new items
      const aScore = (a.isBestseller ? 2 : 0) + (a.isNew ? 1 : 0);
      const bScore = (b.isBestseller ? 2 : 0) + (b.isNew ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, 4);

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
          {isLoading ? (
            /* Loading skeleton */
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-card-border rounded-2xl mb-4" />
                <div className="h-4 bg-card-border rounded w-3/4 mb-2" />
                <div className="h-4 bg-card-border rounded w-1/2" />
              </div>
            ))
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
