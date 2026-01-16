import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.resolve(process.cwd(), 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRY = '7d';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: 'super_admin' | 'admin';
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT token management
export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Cookie management
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

// Get current user from token
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

// User file operations
export async function getUsers(): Promise<User[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser(
  username: string,
  password: string,
  role: 'super_admin' | 'admin'
): Promise<User> {
  const users = await getUsers();

  // Check if username already exists
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already exists');
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    username,
    passwordHash: await hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  return newUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) return false;

  // Check if this is the last super_admin
  const user = users[index];
  if (user.role === 'super_admin') {
    const superAdminCount = users.filter((u) => u.role === 'super_admin').length;
    if (superAdminCount <= 1) {
      throw new Error('Cannot delete the last super admin');
    }
  }

  users.splice(index, 1);
  await saveUsers(users);

  return true;
}

export async function hasAnyUsers(): Promise<boolean> {
  const users = await getUsers();
  return users.length > 0;
}

// Auth check helper for API routes
export async function requireAuth(): Promise<TokenPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireSuperAdmin(): Promise<TokenPayload> {
  const user = await requireAuth();
  if (user.role !== 'super_admin') {
    throw new Error('Super admin access required');
  }
  return user;
}
