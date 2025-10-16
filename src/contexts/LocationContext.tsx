'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationContextType {
  currentLocation: Location | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Check if geolocation is supported
  const isGeolocationSupported = 'geolocation' in navigator;

  // Request location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isGeolocationSupported) {
      setError('Geolocation is not supported by your browser');
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000, // Increased to 15 seconds for slower GPS
          maximumAge: 30000 // Allow cached location up to 30 seconds old
        });
      });

      setHasPermission(true);
      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser/device settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable. Make sure GPS is enabled on your device.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Try again or check if GPS is enabled.');
            break;
          default:
            setError('An unknown error occurred while requesting location.');
        }
      } else {
        setError('Failed to get location permission');
      }
      setHasPermission(false);
      return false;
    }
  }, [isGeolocationSupported]);

  // Update location to server
  const updateLocationToServer = useCallback(async (location: Location) => {
    if (!token || !user) return;

    try {
      const response = await fetch('/api/location/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        })
      });

      if (!response.ok) {
        console.error('Failed to update location to server');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      // Store in IndexedDB for later sync
      await storeLocationForSync(location);
    }
  }, [token, user]);

  // Store location for background sync
  const storeLocationForSync = async (location: Location) => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction(['pendingLocations'], 'readwrite');
      const store = transaction.objectStore('pendingLocations');
      
      await store.add({
        ...location,
        token,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to store location for sync:', error);
    }
  };

  // Open IndexedDB
  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LocationTracker', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pendingLocations')) {
          db.createObjectStore('pendingLocations', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  };

  // Start tracking location
  const startTracking = useCallback(async () => {
    if (!isGeolocationSupported) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setIsTracking(true);
    setError(null);

    // Watch position with high accuracy
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        setCurrentLocation(location);
        setError(null); // Clear any previous errors
        
        // Update server with new location
        updateLocationToServer(location);
      },
      (err) => {
        console.error('Location error:', err);
        if (err.code === err.TIMEOUT) {
          setError('GPS signal weak. Trying again...');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('GPS unavailable. Make sure location services are enabled.');
        } else {
          setError('Failed to get location updates');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000, // Allow cached location up to 30 seconds
        timeout: 15000 // Increased timeout for slower GPS
      }
    );

    setWatchId(id);
  }, [hasPermission, requestPermission, updateLocationToServer, isGeolocationSupported]);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Auto-start tracking if user is logged in and has permission
  useEffect(() => {
    if (user && hasPermission && !isTracking) {
      startTracking();
    }
  }, [user, hasPermission, isTracking, startTracking]);

  const value: LocationContextType = {
    currentLocation,
    isTracking,
    error,
    startTracking,
    stopTracking,
    requestPermission,
    hasPermission
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

