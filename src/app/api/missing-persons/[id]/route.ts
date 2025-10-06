import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authMiddleware, AuthRequest } from '@/lib/middleware';
import { MissingPerson } from '@/types';

// GET single missing person
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const missingPersons = await query<MissingPerson>(
      `SELECT 
        mp.*,
        u.full_name as reporter_name,
        u.email as reporter_email,
        u.phone as reporter_phone,
        DATEDIFF(CURRENT_DATE, mp.last_seen_date) as days_missing
      FROM missing_persons mp
      JOIN users u ON mp.reporter_id = u.id
      WHERE mp.id = ?`,
      [params.id]
    );

    if (missingPersons.length === 0) {
      return NextResponse.json(
        { error: 'Missing person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: missingPersons[0] });

  } catch (error) {
    console.error('Get missing person error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update missing person
export const PUT = authMiddleware(async (req: AuthRequest, { params }: { params: { id: string } }) => {
  try {
    const data = await req.json();

    // Check if missing person exists
    const existing = await query<MissingPerson>(
      'SELECT * FROM missing_persons WHERE id = ?',
      [params.id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Missing person not found' },
        { status: 404 }
      );
    }

    // Check if user is reporter or admin
    if (existing[0].reporter_id !== req.user!.id && !req.user!.is_admin) {
      return NextResponse.json(
        { error: 'You can only update your own reports' },
        { status: 403 }
      );
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    const allowedFields = [
      'full_name', 'age', 'gender', 'last_seen_location', 'last_seen_date',
      'last_seen_time', 'height', 'weight', 'hair_color', 'eye_color',
      'skin_tone', 'distinctive_features', 'clothing_description',
      'medical_conditions', 'photo_url', 'contact_name', 'contact_phone',
      'contact_email', 'additional_info', 'priority'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(data[field]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(params.id);

    await query(
      `UPDATE missing_persons SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated record
    const [updated] = await query<MissingPerson>(
      'SELECT * FROM missing_persons WHERE id = ?',
      [params.id]
    );

    return NextResponse.json({
      message: 'Missing person updated successfully',
      data: updated
    });

  } catch (error) {
    console.error('Update missing person error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE missing person (admin only)
export const DELETE = authMiddleware(async (req: AuthRequest, { params }: { params: { id: string } }) => {
  try {
    if (!req.user!.is_admin) {
      return NextResponse.json(
        { error: 'Only admins can delete reports' },
        { status: 403 }
      );
    }

    const result = await query(
      'DELETE FROM missing_persons WHERE id = ?',
      [params.id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Missing person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Missing person deleted successfully'
    });

  } catch (error) {
    console.error('Delete missing person error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

