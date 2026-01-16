"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    // Default to first available size
    const defaultSize = product.sizes[0];
    
    addToCart(product, selectedColor, defaultSize);
    
    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(false);
    }, 1500);
  };

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
        <button 
          onClick={handleAddToCart}
          disabled={isAdding || product.stock === 0}
          className={`absolute bottom-4 left-4 right-4 z-10 py-3 font-medium rounded-full transition-all
            ${showSuccess 
              ? 'bg-secondary text-white opacity-100 translate-y-0' 
              : 'bg-foreground text-background opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-accent'
            }
            ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {showSuccess ? '✓ Added to Cart' : product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
        </button>

        {/* Product Image */}
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-top transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/5 to-accent/5 transition-transform group-hover:scale-105">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-accent/50">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          </div>
        )}
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
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedColor(color);
              }}
              className={`w-4 h-4 rounded-full border transition-all ${
                selectedColor === color ? 'border-foreground ring-2 ring-foreground ring-offset-2' : 'border-card-border'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
