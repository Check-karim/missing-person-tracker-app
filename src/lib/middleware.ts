import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from './auth';

export interface AuthRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    is_admin: boolean;
  };
}

export function authMiddleware<T extends any[]>(
  handler: (req: AuthRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: AuthRequest, ...args: T) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    req.user = user;
    return handler(req, ...args);
  };
}

export function adminMiddleware<T extends any[]>(
  handler: (req: AuthRequest, ...args: T) => Promise<NextResponse>
) {
  return authMiddleware(async (req: AuthRequest, ...args: T) => {
    if (!req.user?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    return handler(req, ...args);
  });
}

