import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authMiddleware, AuthRequest } from '@/lib/middleware';
import { Comment } from '@/types';

// GET comments for a missing person
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const missingPersonId = searchParams.get('missing_person_id');

    if (!missingPersonId) {
      return NextResponse.json(
        { error: 'missing_person_id is required' },
        { status: 400 }
      );
    }

    const comments = await query<Comment>(
      `SELECT 
        c.*,
        CASE 
          WHEN c.is_anonymous = 1 THEN 'Anonymous'
          ELSE u.full_name
        END as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.missing_person_id = ?
       ORDER BY c.created_at DESC`,
      [missingPersonId]
    );

    return NextResponse.json({ data: comments });

  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create comment
export const POST = authMiddleware(async (req: AuthRequest) => {
  try {
    const { missing_person_id, comment, is_anonymous } = await req.json();

    if (!missing_person_id || !comment) {
      return NextResponse.json(
        { error: 'missing_person_id and comment are required' },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `INSERT INTO comments (missing_person_id, user_id, comment, is_anonymous)
       VALUES (?, ?, ?, ?)`,
      [missing_person_id, req.user!.id, comment, is_anonymous || false]
    );

    const commentId = result[0]?.insertId;

    // Get the missing person to notify reporter
    const missingPerson = await query<{ reporter_id: number; full_name: string }>(
      'SELECT reporter_id, full_name FROM missing_persons WHERE id = ?',
      [missing_person_id]
    );

    if (missingPerson.length > 0 && missingPerson[0].reporter_id !== req.user!.id) {
      // Create notification for reporter
      await query(
        `INSERT INTO notifications (user_id, missing_person_id, title, message, type)
         VALUES (?, ?, ?, ?, ?)`,
        [
          missingPerson[0].reporter_id,
          missing_person_id,
          'New Comment',
          `Someone commented on the case: ${missingPerson[0].full_name}`,
          'comment'
        ]
      );
    }

    // Get created comment
    const [newComment] = await query<Comment>(
      `SELECT 
        c.*,
        CASE 
          WHEN c.is_anonymous = 1 THEN 'Anonymous'
          ELSE u.full_name
        END as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId]
    );

    return NextResponse.json({
      message: 'Comment added successfully',
      data: newComment
    }, { status: 201 });

  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

