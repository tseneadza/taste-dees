"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden noise-bg">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-float delay-500" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Text */}
        <div className="space-y-8">
          <div className="animate-fade-in-up opacity-0">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium tracking-wide">
              NEW COLLECTION 2026
            </span>
          </div>
          
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight animate-fade-in-up opacity-0 delay-100"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            WEAR YOUR
            <span className="block gradient-text">TASTE</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted max-w-md animate-fade-in-up opacity-0 delay-200">
            Premium t-shirts crafted for those who dare to express themselves. 
            Bold designs that speak louder than words.
          </p>
          
          <div className="flex flex-wrap gap-4 animate-fade-in-up opacity-0 delay-300">
            <Link 
              href="/shop"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium overflow-hidden transition-transform hover:scale-105"
            >
              <span className="relative z-10">SHOP NOW</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
              <div className="absolute inset-0 bg-accent transform scale-x-0 origin-left transition-transform group-hover:scale-x-100" />
            </Link>
            
            <Link 
              href="/collections"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-foreground rounded-full font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              VIEW COLLECTIONS
            </Link>
          </div>
          
          {/* Stats */}
          <div className="flex gap-12 pt-8 animate-fade-in-up opacity-0 delay-400">
            <div>
              <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>50K+</div>
              <div className="text-muted text-sm">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>200+</div>
              <div className="text-muted text-sm">Unique Designs</div>
            </div>
            <div>
              <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>4.9★</div>
              <div className="text-muted text-sm">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Right Column - Hero Image */}
        <div className="relative animate-scale-in opacity-0 delay-200">
          <div className="relative aspect-[4/5] max-w-lg mx-auto">
            {/* Main Image Container */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-3xl transform rotate-3 transition-transform hover:rotate-0" />
            <div className="relative h-full bg-card-bg rounded-3xl overflow-hidden border border-card-border shadow-2xl group">
              {/* Featured T-shirt Image */}
              <Image
                src="/images/featured-tee.png"
                alt="My Eyes Are Right Here - Featured T-Shirt"
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                priority
              />
              
              {/* Price Tag */}
              <div className="absolute top-4 right-4 bg-accent text-white px-4 py-2 rounded-full font-bold shadow-lg z-10">
                $35
              </div>
              
              {/* Product Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
                <p className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  MY EYES ARE RIGHT HERE
                </p>
                <p className="text-white/70 text-sm">The Statement Collection</p>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-xl animate-float">
            <span className="text-white text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>NEW</span>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-secondary rounded-2xl flex items-center justify-center shadow-xl animate-float delay-300">
            <span className="text-white text-xs text-center px-2">100% Premium Cotton</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-muted text-sm">Scroll to explore</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-muted">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  );
}
