import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const userResult = await query(
      'SELECT is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!userResult || (userResult as any[]).length === 0 || !(userResult as any[])[0].is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all active user locations
    const locations = await query(
      `SELECT 
        ul.id,
        ul.user_id,
        u.full_name,
        u.email,
        u.phone,
        ul.latitude,
        ul.longitude,
        ul.accuracy,
        ul.timestamp,
        ul.is_active
      FROM user_locations ul
      JOIN users u ON ul.user_id = u.id
      WHERE ul.is_active = TRUE
      ORDER BY ul.timestamp DESC`
    );

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Get user locations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

