"use client";

import { CartItem as CartItemType } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity, selectedColor, selectedSize } = item;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      updateQuantity(product.id, selectedColor, selectedSize, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(product.id, selectedColor, selectedSize);
  };

  const subtotal = product.price * quantity;

  return (
    <div className="flex gap-4 md:gap-6 p-4 md:p-6 bg-card-bg rounded-2xl border border-card-border">
      {/* Product Image Placeholder */}
      <div className="w-24 h-32 md:w-32 md:h-40 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-xl flex items-center justify-center flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 text-accent/50">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-muted text-xs md:text-sm">{product.category}</p>
              <h3 className="font-medium text-base md:text-lg">{product.name}</h3>
            </div>
            <button
              onClick={handleRemove}
              className="text-muted hover:text-accent transition-colors p-1 h-fit"
              aria-label="Remove item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Color and Size */}
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Color:</span>
              <div
                className="w-5 h-5 rounded-full border border-card-border"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Size:</span>
              <span className="text-sm font-medium">{selectedSize}</span>
            </div>
          </div>
        </div>

        {/* Quantity and Price */}
        <div className="flex items-center justify-between mt-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 border border-card-border rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="px-3 py-1 hover:bg-card-border/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-3 py-1 font-medium min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
              className="px-3 py-1 hover:bg-card-border/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-bold text-lg md:text-xl">${subtotal.toFixed(2)}</p>
            {quantity > 1 && (
              <p className="text-xs text-muted">${product.price} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
