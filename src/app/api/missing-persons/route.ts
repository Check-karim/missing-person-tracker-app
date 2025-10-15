import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { authMiddleware, AuthRequest } from '@/lib/middleware';
import { MissingPerson } from '@/types';

// GET all missing persons
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT 
        mp.*,
        u.full_name as reporter_name,
        u.email as reporter_email,
        u.phone as reporter_phone,
        DATEDIFF(CURRENT_DATE, mp.last_seen_date) as days_missing
      FROM missing_persons mp
      JOIN users u ON mp.reporter_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND mp.status = ?';
      params.push(status);
    }

    if (priority) {
      sql += ' AND mp.priority = ?';
      params.push(priority);
    }

    if (search) {
      sql += ' AND (mp.full_name LIKE ? OR mp.case_number LIKE ? OR mp.last_seen_location LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY mp.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const missingPersons = await query<MissingPerson>(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM missing_persons mp WHERE 1=1';
    const countParams: any[] = [];

    if (status) {
      countSql += ' AND mp.status = ?';
      countParams.push(status);
    }

    if (priority) {
      countSql += ' AND mp.priority = ?';
      countParams.push(priority);
    }

    if (search) {
      countSql += ' AND (mp.full_name LIKE ? OR mp.case_number LIKE ? OR mp.last_seen_location LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await query<{ total: number }>(countSql, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      data: missingPersons,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Get missing persons error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

// POST create new missing person report
export const POST = authMiddleware(async (req: AuthRequest) => {
  try {
    const data = await req.json();

    const {
      full_name,
      age,
      gender,
      last_seen_location,
      last_seen_latitude,
      last_seen_longitude,
      last_seen_date,
      last_seen_time,
      height,
      weight,
      hair_color,
      eye_color,
      skin_tone,
      distinctive_features,
      clothing_description,
      medical_conditions,
      photo_url,
      contact_name,
      contact_phone,
      contact_email,
      additional_info,
      priority
    } = data;

    // Validation
    if (!full_name || !gender || !last_seen_location || !last_seen_date || !contact_name || !contact_phone) {
      return NextResponse.json(
        { error: 'Required fields: full_name, gender, last_seen_location, last_seen_date, contact_name, contact_phone' },
        { status: 400 }
      );
    }

    // Generate case number
    const caseNumber = `MP${new Date().getFullYear()}${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;

    // Convert undefined to null for optional fields
    const result = await execute(
      `INSERT INTO missing_persons (
        reporter_id, full_name, age, gender, last_seen_location,
        last_seen_latitude, last_seen_longitude,
        last_seen_date, last_seen_time, height, weight, hair_color,
        eye_color, skin_tone, distinctive_features, clothing_description,
        medical_conditions, photo_url, contact_name, contact_phone,
        contact_email, additional_info, priority, case_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user!.id, 
        full_name, 
        age ?? null, 
        gender, 
        last_seen_location,
        last_seen_latitude ?? null,
        last_seen_longitude ?? null,
        last_seen_date, 
        last_seen_time ?? null, 
        height ?? null, 
        weight ?? null, 
        hair_color ?? null,
        eye_color ?? null, 
        skin_tone ?? null, 
        distinctive_features ?? null, 
        clothing_description ?? null,
        medical_conditions ?? null, 
        photo_url ?? null, 
        contact_name, 
        contact_phone,
        contact_email ?? null, 
        additional_info ?? null, 
        priority || 'medium', 
        caseNumber
      ]
    );

    const missingPersonId = result.insertId;

    // Get created record
    const [missingPerson] = await query<MissingPerson>(
      'SELECT * FROM missing_persons WHERE id = ?',
      [missingPersonId]
    );

    return NextResponse.json({
      message: 'Missing person report created successfully',
      data: missingPerson
    }, { status: 201 });

  } catch (error) {
    console.error('Create missing person error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

