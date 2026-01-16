"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import MultiImageUploader from '@/components/MultiImageUploader';
import EditProductModal from '@/components/EditProductModal';
import UserManagement from '@/components/UserManagement';

interface AuthUser {
  id: string;
  username: string;
  role: 'super_admin' | 'admin';
}

export default function AdminPage() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Product form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Product list state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Derived categories from products
  const categories = React.useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          router.replace('/admin/login');
        }
      } catch (err) {
        router.replace('/admin/login');
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products?source=admin');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        // Set default category if not set
        if (!category && data.products.length > 0) {
          const cats = new Set(data.products.map((p: Product) => p.category));
          const firstCat = Array.from(cats)[0] as string;
          setCategory(firstCat || 'New Arrivals');
        } else if (!category) {
          setCategory('New Arrivals');
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [category]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const finalCategory = showNewCategory && newCategory.trim()
      ? newCategory.trim()
      : category;

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category: finalCategory,
          images,
          isNew: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSubmitError(data.error || 'Failed to add product');
        return;
      }

      // Success - clear form and refresh
      setName('');
      setDescription('');
      setPrice('');
      setImages([]);
      setNewCategory('');
      setShowNewCategory(false);
      setSubmitSuccess(true);
      fetchProducts();

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setDeleteError(data.error || 'Failed to delete product');
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setDeleteConfirmId(null);
    } catch (err) {
      setDeleteError('Connection error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSave = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl gradient-text">Admin Dashboard</h1>
          <p className="text-muted mt-1">
            Logged in as {user.username} ({user.role === 'super_admin' ? 'Super Admin' : 'Admin'})
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-card-border rounded-md hover:bg-card-border transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Add Product Form */}
      <div className="bg-card-bg border border-card-border rounded-lg p-8 shadow-sm mb-8">
        <h2 className="text-2xl mb-6 gradient-text">Add New Product</h2>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Product added successfully!
          </div>
        )}

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-muted">Price</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-muted">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-muted">Category</label>
            {showNewCategory ? (
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-1 rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategory('');
                  }}
                  className="px-3 py-2 border border-card-border rounded-md hover:bg-card-border transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-1 flex gap-2">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
                  disabled={isSubmitting}
                >
                  {categories.length === 0 && (
                    <option value="New Arrivals">New Arrivals</option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="px-3 py-2 border border-card-border rounded-md hover:bg-card-border transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  + New Category
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Product Images</label>
            <MultiImageUploader images={images} onChange={setImages} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-md hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              'Add Product'
            )}
          </button>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-card-bg border border-card-border rounded-lg p-8 shadow-sm mb-8">
        <h2 className="text-2xl mb-6 gradient-text">All Products</h2>

        {deleteError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {deleteError}
          </div>
        )}

        {isLoadingProducts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-card-border rounded-lg">
                <div className="w-16 h-16 bg-card-border rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-card-border rounded w-1/3 mb-2" />
                  <div className="h-3 bg-card-border rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted text-center py-8">No products yet. Add your first product above.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 border border-card-border rounded-lg hover:bg-background/50 transition-colors"
              >
                {/* Product Image */}
                <div className="w-16 h-16 relative rounded overflow-hidden bg-card-border flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                  )}
                  {/* Image count badge */}
                  {product.images && product.images.length > 1 && (
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-black/60 text-white text-xs rounded">
                      +{product.images.length - 1}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted">
                    ${product.price.toFixed(2)} &middot; {product.category}
                    {product.isNew && <span className="ml-2 text-accent">New</span>}
                    {product.isBestseller && <span className="ml-2 text-green-600">Bestseller</span>}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="px-4 py-2 border border-card-border text-sm rounded hover:bg-card-border transition-colors"
                  >
                    Edit
                  </button>

                  {deleteConfirmId === product.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted">Delete?</span>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deletingId === product.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Yes'
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        disabled={deletingId === product.id}
                        className="px-3 py-1 border border-card-border text-sm rounded hover:bg-card-border transition-colors disabled:opacity-50"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(product.id)}
                      className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management (super_admin only) */}
      {user.role === 'super_admin' && (
        <UserManagement currentUserId={user.id} />
      )}

      {/* Edit Modal */}
      <EditProductModal
        product={editingProduct}
        categories={categories.length > 0 ? categories : ['New Arrivals']}
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        onSave={handleEditSave}
      />
    </main>
  );
}
