'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MissingPerson } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MyReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [token]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/missing-persons/my-reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load reports');
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

  const getStatusStats = () => {
    return {
      total: reports.length,
      missing: reports.filter(r => r.status === 'missing').length,
      found: reports.filter(r => r.status === 'found').length,
      investigation: reports.filter(r => r.status === 'investigation').length,
    };
  };

  const stats = getStatusStats();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Reports</h1>
            <p className="text-gray-600 mt-1">Track your submitted missing person reports</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold text-red-600">{stats.missing}</p>
              <p className="text-sm text-gray-600">Missing</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold text-yellow-600">{stats.investigation}</p>
              <p className="text-sm text-gray-600">Investigation</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold text-green-600">{stats.found}</p>
              <p className="text-sm text-gray-600">Found</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No reports yet</p>
              <p className="text-gray-500 text-sm mb-6">Start by reporting a missing person</p>
              <Link
                href="/report"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Report Missing Person
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/missing-persons/${report.id}`}
                  className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{report.full_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(report.priority)}`}></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Case Number</p>
                          <p className="font-medium">#{report.case_number}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Seen</p>
                          <p className="font-medium">{format(new Date(report.last_seen_date), 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reported On</p>
                          <p className="font-medium">{format(new Date(report.created_at), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          📍 {report.last_seen_location}
                        </p>
                      </div>

                      {report.days_missing !== undefined && report.status === 'missing' && (
                        <div className="mt-3 inline-block px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                          Missing for {report.days_missing} days
                        </div>
                      )}

                      {report.status === 'found' && report.found_date && (
                        <div className="mt-3 inline-block px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                          Found on {format(new Date(report.found_date), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>

                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

