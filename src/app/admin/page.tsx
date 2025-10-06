'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats, MissingPerson } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const { token, isAdmin } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchAnalytics();
  }, [token, isAdmin]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Failed to load data</p>
        </div>
      </ProtectedRoute>
    );
  }

  const stats = data.statistics;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Analytics and system overview</p>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total_cases || 0}</p>
              <p className="text-sm text-gray-600">Total Cases</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.active_missing || 0}</p>
              <p className="text-sm text-gray-600">Active Missing</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.found_cases || 0}</p>
              <p className="text-sm text-gray-600">Found</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.under_investigation || 0}</p>
              <p className="text-sm text-gray-600">Under Investigation</p>
            </div>
          </div>

          {/* Priority Cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Priority Cases</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Critical Priority</span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {stats.critical_cases || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">High Priority</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    {stats.high_priority_cases || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Average Resolution Time</h2>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-gray-800">
                  {stats.avg_days_to_find ? Math.round(stats.avg_days_to_find) : 0}
                </p>
                <p className="text-gray-600 mt-2">Days to find</p>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          {data.statusDistribution && data.statusDistribution.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.statusDistribution.map((item) => (
                  <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800">{item.count}</p>
                    <p className="text-sm text-gray-600 capitalize">{item.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Age Distribution */}
          {data.ageDistribution && data.ageDistribution.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Age Distribution</h2>
              <div className="space-y-2">
                {data.ageDistribution.map((item) => (
                  <div key={item.age_group} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.age_group}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${(item.count / stats.total_cases) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-800 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gender Distribution */}
          {data.genderDistribution && data.genderDistribution.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Gender Distribution</h2>
              <div className="grid grid-cols-3 gap-4">
                {data.genderDistribution.map((item) => (
                  <div key={item.gender} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800">{item.count}</p>
                    <p className="text-sm text-gray-600 capitalize">{item.gender}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Cases */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Cases</h2>
              <Link href="/missing-persons" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentCases.slice(0, 5).map((person) => (
                <Link
                  key={person.id}
                  href={`/missing-persons/${person.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{person.full_name}</p>
                      <p className="text-sm text-gray-600">Case #{person.case_number}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      person.status === 'missing' ? 'bg-red-100 text-red-800' :
                      person.status === 'found' ? 'bg-green-100 text-green-800' :
                      person.status === 'investigation' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {person.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

