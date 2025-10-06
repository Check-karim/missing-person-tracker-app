import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authMiddleware, AuthRequest } from '@/lib/middleware';
import { MissingPerson } from '@/types';

// GET user's own reports
export const GET = authMiddleware(async (req: AuthRequest) => {
  try {
    const missingPersons = await query<MissingPerson>(
      `SELECT 
        mp.*,
        DATEDIFF(CURRENT_DATE, mp.last_seen_date) as days_missing
      FROM missing_persons mp
      WHERE mp.reporter_id = ?
      ORDER BY mp.created_at DESC`,
      [req.user!.id]
    );

    return NextResponse.json({ data: missingPersons });

  } catch (error) {
    console.error('Get my reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

