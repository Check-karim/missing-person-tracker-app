import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      console.error('Invalid token', decoded);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const userResult = await query(
      'SELECT is_admin FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!userResult || (userResult as any[]).length === 0 || !(userResult as any[])[0].is_admin) {
      console.error('User is not admin');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all active user locations with the most recent location for each user
    const locations = await query(
      `SELECT 
        ul.id,
        ul.user_id,
        u.full_name,
        u.email,
        u.phone,
        ul.latitude,
        ul.longitude,
        COALESCE(ul.accuracy, 0) as accuracy,
        ul.timestamp,
        ul.is_active
      FROM user_locations ul
      INNER JOIN (
        SELECT user_id, MAX(timestamp) as max_timestamp
        FROM user_locations
        WHERE is_active = TRUE
        GROUP BY user_id
      ) latest ON ul.user_id = latest.user_id AND ul.timestamp = latest.max_timestamp
      JOIN users u ON ul.user_id = u.id
      WHERE ul.is_active = TRUE
      ORDER BY ul.timestamp DESC`
    );

    console.log('Fetched user locations:', (locations as any[]).length);
    return NextResponse.json({ 
      locations: locations || [],
      count: (locations as any[]).length 
    });
  } catch (error) {
    console.error('Get user locations error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        locations: []
      },
      { status: 500 }
    );
  }
}

