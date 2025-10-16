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
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // If userId is provided, check if requester is admin or the user themselves
    let targetUserId = decoded.id;
    
    if (userId) {
      const userResult = await query(
        'SELECT is_admin FROM users WHERE id = ?',
        [decoded.id]
      );

      const isAdmin = userResult && (userResult as any[]).length > 0 && (userResult as any[])[0].is_admin;
      
      if (!isAdmin && parseInt(userId) !== decoded.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      targetUserId = parseInt(userId);
    }

    // Get location history
    const history = await query(
      `SELECT 
        id,
        latitude,
        longitude,
        accuracy,
        created_at
      FROM location_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?`,
      [targetUserId, limit]
    );

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Get location history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

