"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartItem from "@/components/CartItem";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart();

  const subtotal = totalPrice;
  const shippingEstimate = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const taxEstimate = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingEstimate + taxEstimate;

  return (
    <main className="min-h-screen relative">
      <Navbar />

      <section className="pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              YOUR CART
            </h1>
            <p className="text-muted">
              {items.length === 0 
                ? "Your cart is empty" 
                : `${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`
              }
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16 md:py-24">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-accent">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-medium mb-4">Your cart is empty</h2>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Link
                href="/shop"
                className="inline-block px-8 py-4 bg-accent text-white font-medium rounded-full hover:bg-accent-light transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            /* Cart with Items */
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="flex-1 space-y-4">
                {items.map((item, index) => (
                  <CartItem key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`} item={item} />
                ))}

                {/* Continue Shopping */}
                <div className="pt-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <aside className="lg:w-96 flex-shrink-0">
                <div className="sticky top-24 bg-card-bg p-6 md:p-8 rounded-2xl border border-card-border">
                  <h2 className="text-xl font-medium mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Shipping</span>
                      <span className="font-medium">
                        {shippingEstimate === 0 ? 'Free' : `$${shippingEstimate.toFixed(2)}`}
                      </span>
                    </div>
                    {subtotal > 0 && subtotal <= 100 && (
                      <p className="text-xs text-accent">
                        Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted">Tax (estimated)</span>
                      <span className="font-medium">${taxEstimate.toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t border-card-border">
                      <div className="flex justify-between text-lg">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full px-6 py-4 bg-accent text-white text-center font-medium rounded-full hover:bg-accent-light transition-colors mb-4"
                  >
                    Proceed to Checkout
                  </Link>

                  <button
                    onClick={clearCart}
                    className="w-full px-6 py-3 text-muted hover:text-accent transition-colors text-sm"
                  >
                    Clear Cart
                  </button>

                  {/* Additional Info */}
                  <div className="mt-6 pt-6 border-t border-card-border space-y-3 text-sm text-muted">
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      <span>Free returns within 30 days</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
