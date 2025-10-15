import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
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

    const { latitude, longitude, accuracy } = await request.json();

    // Validate input
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
    }

    // Update current location (delete old and insert new)
    await query(
      `DELETE FROM user_locations WHERE user_id = ?`,
      [decoded.userId]
    );
    
    await query(
      `INSERT INTO user_locations (user_id, latitude, longitude, accuracy, timestamp) 
       VALUES (?, ?, ?, ?, NOW())`,
      [decoded.userId, latitude, longitude, accuracy || null]
    );

    // Add to location history
    await query(
      `INSERT INTO location_history (user_id, latitude, longitude, accuracy) 
       VALUES (?, ?, ?, ?)`,
      [decoded.userId, latitude, longitude, accuracy || null]
    );

    // Notify admin of location update
    const admins = await query('SELECT id FROM users WHERE is_admin = TRUE');
    
    for (const admin of admins as any[]) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES (?, ?, ?, ?)`,
        [
          admin.id,
          'User Location Update',
          `User ID ${decoded.userId} location updated`,
          'general'
        ]
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Location updated successfully' 
    });
  } catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

