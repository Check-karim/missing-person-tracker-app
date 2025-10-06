import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authMiddleware, AuthRequest } from '@/lib/middleware';
import { Notification } from '@/types';

// GET user's notifications
export const GET = authMiddleware(async (req: AuthRequest) => {
  try {
    const notifications = await query<Notification>(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user!.id]
    );

    return NextResponse.json({ data: notifications });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT mark notification as read
export const PUT = authMiddleware(async (req: AuthRequest) => {
  try {
    const { notification_id } = await req.json();

    if (notification_id) {
      // Mark single notification as read
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [notification_id, req.user!.id]
      );
    } else {
      // Mark all notifications as read
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
        [req.user!.id]
      );
    }

    return NextResponse.json({ message: 'Notification(s) marked as read' });

  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

