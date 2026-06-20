import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// Check if setup is needed (no admin users exist)
export async function GET() {
  try {
    const supabase = createAdminClient();

    // List users and check if any have admin role
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error checking users:', error);
      // If we can't check, assume setup is needed
      return NextResponse.json({ setupRequired: true });
    }

    const adminExists = users?.some(
      (u) => u.user_metadata?.role === 'admin' || u.user_metadata?.role === 'super_admin'
    );

    return NextResponse.json({ setupRequired: !adminExists });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json({ setupRequired: true });
  }
}

// Create the first super admin
export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Check if any admin users already exist
    const { data: { users } } = await adminSupabase.auth.admin.listUsers();
    const adminExists = users?.some(
      (u) => u.user_metadata?.role === 'admin' || u.user_metadata?.role === 'super_admin'
    );

    if (adminExists) {
      return NextResponse.json(
        { success: false, error: 'Setup already completed. An admin user already exists.' },
        { status: 400 }
      );
    }

    // Create the super admin user
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username || email.split('@')[0],
        role: 'super_admin',
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Sign in the new user
    const supabase = await createClient();
    await supabase.auth.signInWithPassword({ email, password });

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: username || email.split('@')[0],
        role: 'super_admin',
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Setup failed' },
      { status: 500 }
    );
  }
}
