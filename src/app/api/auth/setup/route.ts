import { NextRequest, NextResponse } from 'next/server';
import {
  hasAnyUsers,
  createUser,
  createToken,
  setAuthCookie,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if setup is allowed (no users exist)
    const usersExist = await hasAnyUsers();
    if (usersExist) {
      return NextResponse.json(
        { success: false, error: 'Setup already completed' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create super admin user
    const user = await createUser(username, password, 'super_admin');

    // Create token and set cookie
    const token = createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin account' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const usersExist = await hasAnyUsers();
    return NextResponse.json({ setupRequired: !usersExist });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}
