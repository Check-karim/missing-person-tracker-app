import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { adminMiddleware, AuthRequest } from '@/lib/middleware';
import { Statistics, MissingPerson } from '@/types';

export const GET = adminMiddleware(async (req: AuthRequest) => {
  try {
    // Get statistics
    const stats = await query<Statistics>(
      'SELECT * FROM missing_person_statistics'
    );

    // Get recent cases
    const recentCases = await query<MissingPerson>(
      `SELECT mp.*, u.full_name as reporter_name,
       DATEDIFF(CURRENT_DATE, mp.last_seen_date) as days_missing
       FROM missing_persons mp
       JOIN users u ON mp.reporter_id = u.id
       ORDER BY mp.created_at DESC
       LIMIT 10`
    );

    // Get status distribution
    const statusDistribution = await query<{ status: string; count: number }>(
      `SELECT status, COUNT(*) as count
       FROM missing_persons
       GROUP BY status`
    );

    // Get monthly trends (last 12 months)
    const monthlyTrends = await query<{ month: string; missing: number; found: number }>(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as missing,
        SUM(CASE WHEN status = 'found' THEN 1 ELSE 0 END) as found
       FROM missing_persons
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC`
    );

    // Get age distribution
    const ageDistribution = await query<{ age_group: string; count: number }>(
      `SELECT 
        CASE 
          WHEN age < 13 THEN 'Child (0-12)'
          WHEN age BETWEEN 13 AND 17 THEN 'Teen (13-17)'
          WHEN age BETWEEN 18 AND 30 THEN 'Young Adult (18-30)'
          WHEN age BETWEEN 31 AND 50 THEN 'Adult (31-50)'
          WHEN age > 50 THEN 'Senior (50+)'
          ELSE 'Unknown'
        END as age_group,
        COUNT(*) as count
       FROM missing_persons
       GROUP BY age_group`
    );

    // Get gender distribution
    const genderDistribution = await query<{ gender: string; count: number }>(
      `SELECT gender, COUNT(*) as count
       FROM missing_persons
       GROUP BY gender`
    );

    // Get priority distribution
    const priorityDistribution = await query<{ priority: string; count: number }>(
      `SELECT priority, COUNT(*) as count
       FROM missing_persons
       GROUP BY priority`
    );

    return NextResponse.json({
      statistics: stats[0] || {},
      recentCases,
      statusDistribution,
      monthlyTrends,
      ageDistribution,
      genderDistribution,
      priorityDistribution
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

