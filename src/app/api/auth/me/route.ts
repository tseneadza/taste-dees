import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ success: false, user: null });
    }

    const role = user.user_metadata?.role;

    // Only return user info for admins
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ success: false, user: null });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split('@')[0],
        role: role,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ success: false, user: null });
  }
}
