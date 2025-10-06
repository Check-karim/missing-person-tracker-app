import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authMiddleware, AuthRequest } from '@/lib/middleware';
import { MissingPerson } from '@/types';

// PUT update status
export const PUT = authMiddleware(async (req: AuthRequest, { params }: { params: { id: string } }) => {
  try {
    const { status: newStatus, update_note, found_location } = await req.json();

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['missing', 'found', 'investigation', 'closed'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current missing person
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

    const oldStatus = existing[0].status;

    // Update status
    let updateSql = 'UPDATE missing_persons SET status = ?';
    const updateParams: any[] = [newStatus];

    if (newStatus === 'found') {
      updateSql += ', found_date = NOW(), found_by = ?';
      updateParams.push(req.user!.id);
      
      if (found_location) {
        updateSql += ', found_location = ?';
        updateParams.push(found_location);
      }
    }

    updateSql += ' WHERE id = ?';
    updateParams.push(params.id);

    await query(updateSql, updateParams);

    // Log status update
    await query(
      `INSERT INTO status_updates (missing_person_id, user_id, old_status, new_status, update_note)
       VALUES (?, ?, ?, ?, ?)`,
      [params.id, req.user!.id, oldStatus, newStatus, update_note || null]
    );

    // Create notification for reporter if status changed by someone else
    if (existing[0].reporter_id !== req.user!.id) {
      const notificationMessage = newStatus === 'found' 
        ? `Great news! ${existing[0].full_name} has been found.`
        : `Status updated to: ${newStatus}`;

      await query(
        `INSERT INTO notifications (user_id, missing_person_id, title, message, type)
         VALUES (?, ?, ?, ?, ?)`,
        [existing[0].reporter_id, params.id, 'Status Update', notificationMessage, 'status_update']
      );
    }

    // Get updated record
    const [updated] = await query<MissingPerson>(
      'SELECT * FROM missing_persons WHERE id = ?',
      [params.id]
    );

    return NextResponse.json({
      message: 'Status updated successfully',
      data: updated
    });

  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

