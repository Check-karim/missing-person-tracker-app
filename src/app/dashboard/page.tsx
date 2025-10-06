'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MissingPerson } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [recentCases, setRecentCases] = useState<MissingPerson[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    missing: 0,
    found: 0,
    myReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      // Fetch recent cases
      const casesResponse = await fetch('/api/missing-persons?limit=5');
      if (casesResponse.ok) {
        const casesData = await casesResponse.json();
        setRecentCases(casesData.data);
        setStats(prev => ({ ...prev, total: casesData.pagination.total }));
      }

      // Fetch my reports
      if (token) {
        const myReportsResponse = await fetch('/api/missing-persons/my-reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (myReportsResponse.ok) {
          const myReportsData = await myReportsResponse.json();
          setStats(prev => ({ ...prev, myReports: myReportsData.data.length }));
        }
      }

      // Get status counts
      const missingResponse = await fetch('/api/missing-persons?status=missing');
      const foundResponse = await fetch('/api/missing-persons?status=found');
      
      if (missingResponse.ok && foundResponse.ok) {
        const missingData = await missingResponse.json();
        const foundData = await foundResponse.json();
        setStats(prev => ({
          ...prev,
          missing: missingData.pagination.total,
          found: foundData.pagination.total,
        }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'missing': return 'bg-red-100 text-red-800';
      case 'found': return 'bg-green-100 text-green-800';
      case 'investigation': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Cases</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.missing}</p>
              <p className="text-sm text-gray-600">Still Missing</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.found}</p>
              <p className="text-sm text-gray-600">Found</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.myReports}</p>
              <p className="text-sm text-gray-600">My Reports</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/report"
                className="bg-primary-600 text-white p-4 rounded-xl text-center hover:bg-primary-700 transition"
              >
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Report Missing</span>
              </Link>

              <Link
                href="/missing-persons"
                className="bg-white border-2 border-gray-200 p-4 rounded-xl text-center hover:border-primary-600 transition"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Search Cases</span>
              </Link>

              <Link
                href="/my-reports"
                className="bg-white border-2 border-gray-200 p-4 rounded-xl text-center hover:border-primary-600 transition"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">My Reports</span>
              </Link>

              <Link
                href="/missing-persons?status=found"
                className="bg-white border-2 border-gray-200 p-4 rounded-xl text-center hover:border-primary-600 transition"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Found Cases</span>
              </Link>
            </div>
          </div>

          {/* Recent Cases */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Recent Cases</h2>
              <Link href="/missing-persons" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : recentCases.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-600">No cases found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCases.map((person) => (
                  <Link
                    key={person.id}
                    href={`/missing-persons/${person.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-800">{person.full_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status)}`}>
                            {person.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          📍 {person.last_seen_location}
                        </p>
                        <p className="text-xs text-gray-500">
                          Case #{person.case_number} • {format(new Date(person.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(person.priority)} mt-2`}></div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

