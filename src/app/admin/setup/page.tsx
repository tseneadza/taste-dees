"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [setupAllowed, setSetupAllowed] = useState(false);

  // Check if setup is required
  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch('/api/auth/setup');
        const data = await response.json();
        if (data.setupRequired) {
          setSetupAllowed(true);
        } else {
          // Setup already completed, redirect to login
          router.replace('/admin/login');
        }
      } catch (err) {
        console.error('Setup check failed:', err);
        setError('Failed to check setup status');
      } finally {
        setCheckingSetup(false);
      }
    }
    checkSetup();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Setup failed');
        return;
      }

      // Redirect to admin page
      router.replace('/admin');
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!setupAllowed) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-card-bg border border-card-border rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span
                className="text-2xl tracking-wider"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                TASTE DEES
              </span>
            </Link>
            <h1 className="text-2xl gradient-text mb-2">Admin Setup</h1>
            <p className="text-sm text-muted">
              Create your super admin account to get started
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-muted mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="At least 3 characters"
                className="w-full rounded-md border border-card-border p-3 bg-white dark:bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full rounded-md border border-card-border p-3 bg-white dark:bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="w-full rounded-md border border-card-border p-3 bg-white dark:bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent text-white rounded-md hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/" className="hover:text-accent transition-colors">
              Back to store
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
