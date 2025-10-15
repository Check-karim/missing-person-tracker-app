'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string | number;
    position: [number, number];
    title: string;
    description?: string;
    type?: 'user' | 'missing' | 'found';
  }>;
  onMarkerClick?: (id: string | number) => void;
  height?: string;
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({
  center = [0, 0],
  zoom = 13,
  markers = [],
  onMarkerClick,
  height = '400px',
  className = ''
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<L.Marker[]>([]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const mapContainer = document.getElementById('map');
    if (!mapContainer || map) return;

    // Initialize map
    const newMap = L.map('map').setView(center, zoom);

    // Add OpenStreetMap tile layer (free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(newMap);

    setMap(newMap);

    return () => {
      newMap.remove();
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!map) return;

    // Remove old markers
    mapMarkers.forEach(marker => marker.remove());

    // Create custom icons based on marker type
    const getIcon = (type?: 'user' | 'missing' | 'found') => {
      const iconColors = {
        user: '#3b82f6', // blue
        missing: '#ef4444', // red
        found: '#10b981', // green
      };

      const color = iconColors[type || 'user'];
      
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              text-align: center;
              line-height: 26px;
              font-size: 16px;
              font-weight: bold;
            ">
              ${type === 'user' ? '👤' : type === 'found' ? '✓' : '!'}
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });
    };

    // Add new markers
    const newMarkers = markers.map(markerData => {
      const marker = L.marker(markerData.position, {
        icon: getIcon(markerData.type)
      }).addTo(map);

      // Add popup
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">${markerData.title}</h3>
          ${markerData.description ? `<p style="margin-bottom: 8px;">${markerData.description}</p>` : ''}
          <button 
            onclick="window.markerClick && window.markerClick('${markerData.id}')"
            style="
              background-color: #3b82f6;
              color: white;
              padding: 6px 12px;
              border-radius: 4px;
              border: none;
              cursor: pointer;
              font-size: 14px;
            "
          >
            View Details
          </button>
        </div>
      `;
      
      marker.bindPopup(popupContent);

      return marker;
    });

    setMapMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const group = L.featureGroup(newMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Set up global click handler
    if (onMarkerClick) {
      (window as any).markerClick = onMarkerClick;
    }

    return () => {
      (window as any).markerClick = undefined;
    };
  }, [map, markers, onMarkerClick]);

  return (
    <div className={className}>
      <div 
        id="map" 
        style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}
      />
    </div>
  );
};

// Export as dynamic component to prevent SSR issues
export default dynamic(() => Promise.resolve(MapView), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '400px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

