'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { MissingPerson } from '@/types';
import MapView from '@/components/MapView';
import toast from 'react-hot-toast';

export default function MapPage() {
  const router = useRouter();
  const [persons, setPersons] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'missing' | 'investigation' | 'found'>('all');

  useEffect(() => {
    fetchPersons();
  }, [filter]);

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/missing-persons?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPersons(data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch missing persons');
    } finally {
      setLoading(false);
    }
  };

  // Filter persons with GPS coordinates
  const personsWithLocation = persons.filter(
    (p) => p.last_seen_latitude && p.last_seen_longitude
  );

  // Prepare markers
  const markers = personsWithLocation.map((person) => ({
    id: person.id,
    position: [person.last_seen_latitude!, person.last_seen_longitude!] as [number, number],
    title: person.full_name,
    description: `Status: ${person.status}\nLast seen: ${person.last_seen_location}\nCase: ${person.case_number}`,
    type: (person.status === 'found' ? 'found' : 'missing') as 'user' | 'missing' | 'found',
  }));

  // Calculate map center
  const mapCenter: [number, number] = personsWithLocation.length > 0
    ? [
        personsWithLocation.reduce((sum, p) => sum + p.last_seen_latitude!, 0) / personsWithLocation.length,
        personsWithLocation.reduce((sum, p) => sum + p.last_seen_longitude!, 0) / personsWithLocation.length,
      ]
    : [0, 0];

  const handleMarkerClick = (id: string | number) => {
    router.push(`/missing-persons/${id}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Missing Persons Map</h1>
            <p className="text-gray-600">View all reported cases with GPS locations on the map</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`p-4 rounded-xl shadow-sm transition ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <p className={`text-2xl font-bold ${filter === 'all' ? 'text-white' : 'text-blue-600'}`}>
                {personsWithLocation.length}
              </p>
              <p className={`text-sm mt-1 ${filter === 'all' ? 'text-blue-100' : 'text-gray-600'}`}>
                All Cases
              </p>
            </button>

            <button
              onClick={() => setFilter('missing')}
              className={`p-4 rounded-xl shadow-sm transition ${
                filter === 'missing' ? 'bg-red-600 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <p className={`text-2xl font-bold ${filter === 'missing' ? 'text-white' : 'text-red-600'}`}>
                {personsWithLocation.filter((p) => p.status === 'missing').length}
              </p>
              <p className={`text-sm mt-1 ${filter === 'missing' ? 'text-red-100' : 'text-gray-600'}`}>
                Missing
              </p>
            </button>

            <button
              onClick={() => setFilter('investigation')}
              className={`p-4 rounded-xl shadow-sm transition ${
                filter === 'investigation' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <p className={`text-2xl font-bold ${filter === 'investigation' ? 'text-white' : 'text-yellow-600'}`}>
                {personsWithLocation.filter((p) => p.status === 'investigation').length}
              </p>
              <p className={`text-sm mt-1 ${filter === 'investigation' ? 'text-yellow-100' : 'text-gray-600'}`}>
                Investigation
              </p>
            </button>

            <button
              onClick={() => setFilter('found')}
              className={`p-4 rounded-xl shadow-sm transition ${
                filter === 'found' ? 'bg-green-600 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <p className={`text-2xl font-bold ${filter === 'found' ? 'text-white' : 'text-green-600'}`}>
                {personsWithLocation.filter((p) => p.status === 'found').length}
              </p>
              <p className={`text-sm mt-1 ${filter === 'found' ? 'text-green-100' : 'text-gray-600'}`}>
                Found
              </p>
            </button>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {loading ? (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '600px' }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading map...</p>
                </div>
              </div>
            ) : personsWithLocation.length === 0 ? (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '600px' }}>
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🗺️</span>
                  <p className="text-gray-600 font-semibold">No cases with GPS coordinates found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {filter !== 'all' ? 'Try changing the filter or ' : ''}
                    Cases need GPS coordinates to appear on the map
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">Missing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-700">Investigation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Found</span>
                    </div>
                  </div>
                </div>
                <MapView
                  center={mapCenter}
                  zoom={personsWithLocation.length === 1 ? 13 : 6}
                  markers={markers}
                  onMarkerClick={handleMarkerClick}
                  height="600px"
                />
              </>
            )}
          </div>

          {/* Legend and Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-semibold text-blue-900 mb-1">How to use this map</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click on any marker to view case details</li>
                  <li>• Use the filter buttons above to show specific case types</li>
                  <li>• Red markers indicate missing persons, yellow for under investigation, green for found</li>
                  <li>• Only cases with GPS coordinates are shown on the map</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

