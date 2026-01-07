"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-20 md:py-32 bg-foreground text-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Accent Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <span 
          className="inline-block text-accent font-medium tracking-wide mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          JOIN THE MOVEMENT
        </span>
        
        <h2 
          className="text-4xl md:text-5xl lg:text-6xl mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          GET 15% OFF YOUR<br />
          <span className="text-accent">FIRST ORDER</span>
        </h2>
        
        <p className="text-background/70 text-lg max-w-xl mx-auto mb-10">
          Subscribe to our newsletter for exclusive drops, behind-the-scenes content, 
          and early access to new collections.
        </p>

        {isSubmitted ? (
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-accent rounded-full text-white font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            You&apos;re in! Check your inbox for your discount code.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-background/10 border border-background/20 rounded-full text-background placeholder:text-background/50 focus:outline-none focus:border-accent transition-colors"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-accent text-white font-medium rounded-full transition-all hover:bg-accent-light hover:scale-105"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-background/40 text-sm mt-6">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
}
