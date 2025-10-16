'use client';

import React from 'react';
import toast from 'react-hot-toast';

interface LocationPermissionHelperProps {
  error: string | null;
  onRetry: () => void;
}

export default function LocationPermissionHelper({ error, onRetry }: LocationPermissionHelperProps) {
  if (!error) return null;

  const getHelpMessage = (errorMsg: string) => {
    if (errorMsg.includes('denied')) {
      return {
        title: '📍 Location Permission Needed',
        message: 'Please allow location access in your browser settings to use this feature.',
        steps: [
          'Click the lock/info icon in your address bar',
          'Find "Location" or "Permissions"',
          'Set location to "Allow"',
          'Refresh the page'
        ],
        color: 'red'
      };
    }

    if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
      return {
        title: '⏱️ GPS Taking Too Long',
        message: 'Your device is taking longer than expected to get your location.',
        steps: [
          'Make sure GPS is enabled on your device',
          'Go outdoors or near a window for better signal',
          'Wait 30-60 seconds for GPS to lock',
          'Try again'
        ],
        color: 'yellow'
      };
    }

    if (errorMsg.includes('unavailable')) {
      return {
        title: '🛰️ GPS Unavailable',
        message: 'Your device cannot determine your location right now.',
        steps: [
          'Turn on Location Services in device settings',
          'Make sure airplane mode is OFF',
          'Check if GPS is enabled',
          'Try restarting your device'
        ],
        color: 'orange'
      };
    }

    return {
      title: '⚠️ Location Error',
      message: errorMsg,
      steps: [
        'Check that location services are enabled',
        'Make sure your browser has location permission',
        'Try again in a few moments'
      ],
      color: 'gray'
    };
  };

  const help = getHelpMessage(error);

  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  const buttonColorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    gray: 'bg-gray-600 hover:bg-gray-700'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[help.color as keyof typeof colorClasses]}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-2xl">
          {help.color === 'red' && '🚫'}
          {help.color === 'yellow' && '⏳'}
          {help.color === 'orange' && '⚠️'}
          {help.color === 'gray' && 'ℹ️'}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">{help.title}</h3>
          <p className="text-sm mb-3">{help.message}</p>
          
          <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold mb-2">Try these steps:</p>
            <ol className="text-sm space-y-1">
              {help.steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-semibold mr-2">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onRetry}
              className={`px-4 py-2 text-white rounded-lg transition text-sm font-medium ${buttonColorClasses[help.color as keyof typeof buttonColorClasses]}`}
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => {
                const tips = [
                  '💡 GPS works best outdoors with clear view of the sky',
                  '📱 First GPS fix can take 30-60 seconds',
                  '🌐 Network connection helps GPS locate faster',
                  '⚡ Modern devices get GPS faster than older ones'
                ];
                toast(tips[Math.floor(Math.random() * tips.length)], {
                  icon: '💡',
                  duration: 4000
                });
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              💡 Tips
            </button>
          </div>
        </div>
      </div>

      {/* Quick diagnostic */}
      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold">🔧 Advanced Info</summary>
          <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
            <p><strong>Browser:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}</p>
            <p><strong>Geolocation API:</strong> {'geolocation' in navigator ? '✅ Supported' : '❌ Not supported'}</p>
            <p><strong>HTTPS:</strong> {window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? '✅ Secure' : '⚠️ Not secure (may cause issues)'}</p>
            <p><strong>Error:</strong> {error}</p>
          </div>
        </details>
      </div>
    </div>
  );
}

