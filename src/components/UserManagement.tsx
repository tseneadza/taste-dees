"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface AdminUser {
  id: string;
  username: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
}

interface UserManagementProps {
  currentUserId: string;
}

export default function UserManagement({ currentUserId }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'super_admin'>('admin');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError(null);

    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAddError(data.error || 'Failed to add user');
        return;
      }

      // Add to list
      setUsers((prev) => [...prev, data.user]);
      setNewUsername('');
      setNewPassword('');
      setNewRole('admin');
    } catch (err) {
      setAddError('Connection error. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);

    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to delete user');
        return;
      }

      // Remove from list
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteConfirmId(null);
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card-bg border border-card-border rounded-lg p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-card-border rounded w-1/3" />
          <div className="h-12 bg-card-border rounded" />
          <div className="h-12 bg-card-border rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-lg p-8 shadow-sm">
      <h2 className="text-2xl mb-6 gradient-text">Admin Users</h2>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User list */}
      <div className="space-y-3 mb-8">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border border-card-border rounded-lg"
          >
            <div>
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-muted">
                {user.role === 'super_admin' ? 'Super Admin' : 'Admin'} &middot;{' '}
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>

            {user.id === currentUserId ? (
              <span className="text-sm text-muted">(You)</span>
            ) : deleteConfirmId === user.id ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Delete?</span>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deletingId === user.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Yes'
                  )}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deletingId === user.id}
                  className="px-3 py-1 border border-card-border text-sm rounded hover:bg-card-border transition-colors disabled:opacity-50"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirmId(user.id)}
                className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add user form */}
      <div className="border-t border-card-border pt-6">
        <h3 className="font-medium mb-4">Add New Admin</h3>

        {addError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {addError}
          </div>
        )}

        <form onSubmit={handleAddUser} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="new-username" className="block text-sm text-muted mb-1">
              Username
            </label>
            <input
              id="new-username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
              className="w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
              disabled={isAdding}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="new-password" className="block text-sm text-muted mb-1">
              Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
              disabled={isAdding}
            />
          </div>
          <div className="w-[140px]">
            <label htmlFor="new-role" className="block text-sm text-muted mb-1">
              Role
            </label>
            <select
              id="new-role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'super_admin')}
              className="w-full rounded-md border border-card-border p-2 bg-white dark:bg-card-bg"
              disabled={isAdding}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              'Add User'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
