import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { User } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, phone } = await req.json();

    // Validation
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query<User>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await execute(
      'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, phone ?? null]
    );

    const userId = result.insertId;

    // Get created user
    const [newUser] = await query<User>(
      'SELECT id, full_name, email, phone, is_admin, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Generate token
    const token = generateToken(newUser);

    return NextResponse.json({
      message: 'Registration successful',
      user: newUser,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

