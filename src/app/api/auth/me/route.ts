import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authMiddleware, AuthRequest } from '@/lib/middleware';
import { User } from '@/types';

export const GET = authMiddleware(async (req: AuthRequest) => {
  try {
    const users = await query<User>(
      'SELECT id, full_name, email, phone, is_admin, created_at, updated_at FROM users WHERE id = ?',
      [req.user!.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: users[0] });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

