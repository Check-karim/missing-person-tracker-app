'use client';

import { useEffect, useState } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LocationTrackingStatus() {
  const { currentLocation, isTracking, error, startTracking, stopTracking, requestPermission, hasPermission } = useLocation();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  if (!user) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 z-40">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {isTracking ? 'Location Tracking Active' : 'Location Tracking Inactive'}
              </p>
              {currentLocation && (
                <p className="text-xs text-gray-500">
                  Accuracy: ±{Math.round(currentLocation.accuracy)}m
                </p>
              )}
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            {showDetails ? '▼' : '▲'}
          </button>
        </div>

        {showDetails && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            {currentLocation ? (
              <div className="space-y-2 mb-3">
                <div className="text-xs">
                  <p className="text-gray-600">Latitude:</p>
                  <p className="font-mono text-gray-800">{currentLocation.latitude.toFixed(6)}</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-600">Longitude:</p>
                  <p className="font-mono text-gray-800">{currentLocation.longitude.toFixed(6)}</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-600">Last Updated:</p>
                  <p className="text-gray-800">{new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-3">No location data available</p>
            )}

            {!hasPermission ? (
              <button
                onClick={requestPermission}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Enable Location Access
              </button>
            ) : isTracking ? (
              <button
                onClick={stopTracking}
                className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
              >
                Stop Tracking
              </button>
            ) : (
              <button
                onClick={startTracking}
                className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                Start Tracking
              </button>
            )}

            <p className="text-xs text-gray-500 mt-2 text-center">
              Your location helps authorities track missing persons in real-time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

