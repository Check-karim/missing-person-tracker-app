'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import MapView from '@/components/MapView';
import toast from 'react-hot-toast';

interface UserLocation {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  is_active: boolean;
}

export default function LiveTrackingPage() {
  const router = useRouter();
  const { token, isAdmin, user } = useAuth();
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch user locations
  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/location/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch user locations');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (token && isAdmin) {
      fetchLocations();
    }
  }, [token, isAdmin]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLocations();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  // Prepare markers for map
  const markers = locations.map((loc) => ({
    id: loc.user_id,
    position: [Number(loc.latitude), Number(loc.longitude)] as [number, number],
    title: loc.full_name,
    description: `Email: ${loc.email}\nPhone: ${loc.phone}\nLast updated: ${new Date(loc.timestamp).toLocaleString()}\nAccuracy: ${Math.round(Number(loc.accuracy))}m`,
    type: 'user' as const,
  }));

  // Calculate center of map (average of all locations)
  const mapCenter: [number, number] = locations.length > 0
    ? [
        locations.reduce((sum, loc) => sum + Number(loc.latitude), 0) / locations.length,
        locations.reduce((sum, loc) => sum + Number(loc.longitude), 0) / locations.length,
      ]
    : [0, 0];

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Live User Tracking</h1>
              <p className="text-gray-600 mt-1">Real-time GPS locations of registered users</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh</span>
              </label>
              
              <button
                onClick={fetchLocations}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{locations.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Update</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {locations.length > 0
                      ? new Date(Math.max(...locations.map(l => new Date(l.timestamp).getTime()))).toLocaleTimeString()
                      : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tracking Status</p>
                  <p className="text-sm font-semibold text-green-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                    {autoRefresh ? 'Live' : 'Paused'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Location Map</h2>
            {loading ? (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '500px' }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading locations...</p>
                </div>
              </div>
            ) : locations.length === 0 ? (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '500px' }}>
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📍</span>
                  <p className="text-gray-600">No active user locations found</p>
                  <p className="text-sm text-gray-500 mt-2">Users need to enable location tracking on their devices</p>
                </div>
              </div>
            ) : (
              <MapView
                center={mapCenter}
                zoom={locations.length === 1 ? 13 : 6}
                markers={markers}
                onMarkerClick={(id) => {
                  const user = locations.find(l => l.user_id === id);
                  if (user) {
                    setSelectedUser(user);
                  }
                }}
                height="500px"
              />
            )}
          </div>

          {/* User List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tracked Users</h2>
            {locations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users are currently being tracked</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Accuracy</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((location) => (
                      <tr
                        key={location.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedUser(location)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{location.full_name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">{location.email}</div>
                          <div className="text-sm text-gray-500">{location.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">±{Math.round(Number(location.accuracy))}m</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(location.timestamp).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Selected User Details Modal */}
          {selectedUser && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedUser(null)}
            >
              <div
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">User Location Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coordinates</p>
                    <p className="font-medium text-gray-900">
                      {Number(selectedUser.latitude).toFixed(6)}, {Number(selectedUser.longitude).toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Accuracy</p>
                    <p className="font-medium text-gray-900">±{Math.round(Number(selectedUser.accuracy))} meters</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-900">{new Date(selectedUser.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

