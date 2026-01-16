"use client";

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import MultiImageUploader from './MultiImageUploader';

interface EditProductModalProps {
  product: Product | null;
  categories: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export default function EditProductModal({
  product,
  categories,
  isOpen,
  onClose,
  onSave,
}: EditProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setCategory(product.category);
      setImages(product.images || []);
      setStock(String(product.stock));
      setIsNew(product.isNew || false);
      setIsBestseller(product.isBestseller || false);
      setNewCategory('');
      setShowNewCategory(false);
      setError(null);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSaving(true);
    setError(null);

    const finalCategory = showNewCategory && newCategory.trim()
      ? newCategory.trim()
      : category;

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category: finalCategory,
          images,
          stock: parseInt(stock),
          isNew,
          isBestseller,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to update product');
        return;
      }

      onSave(data.product);
      onClose();
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card-bg border border-card-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card-bg border-b border-card-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Product</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-border transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-muted mb-1">
              Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
              disabled={isSaving}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-muted mb-1">
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
              disabled={isSaving}
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-muted mb-1">
                Price
              </label>
              <input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
                disabled={isSaving}
              />
            </div>
            <div>
              <label htmlFor="edit-stock" className="block text-sm font-medium text-muted mb-1">
                Stock
              </label>
              <input
                id="edit-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-muted mb-1">
              Category
            </label>
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-1 rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategory('');
                  }}
                  className="px-3 py-2 border border-card-border rounded-md hover:bg-card-border transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
                  disabled={isSaving}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="px-3 py-2 border border-card-border rounded-md hover:bg-card-border transition-colors text-sm"
                  disabled={isSaving}
                >
                  + New
                </button>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 accent-accent"
                disabled={isSaving}
              />
              <span className="text-sm">Mark as New</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 accent-accent"
                disabled={isSaving}
              />
              <span className="text-sm">Bestseller</span>
            </label>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Images
            </label>
            <MultiImageUploader
              images={images}
              onChange={setImages}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-card-border rounded-md hover:bg-card-border transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
