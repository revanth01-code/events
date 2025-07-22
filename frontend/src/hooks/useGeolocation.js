import { useState, useEffect } from 'react';
import { mockUserLocation } from '../data/mockData';

const useGeolocation = () => {
  const [location, setLocation] = useState(mockUserLocation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    const success = async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // In a real app, you'd reverse geocode to get city/state
        // For now, we'll use a mock implementation
        const geocodedLocation = await mockReverseGeocode(latitude, longitude);
        
        setLocation({
          lat: latitude,
          lng: longitude,
          ...geocodedLocation
        });
      } catch (err) {
        console.warn('Reverse geocoding failed, using coordinates only');
        setLocation(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }));
      }
      
      setLoading(false);
    };

    const errorHandler = (err) => {
      console.warn('Geolocation error:', err.message);
      // Fall back to mock location
      setError(`Location access denied: ${err.message}`);
      setLocation(mockUserLocation);
      setLoading(false);
    };

    // Request location with high accuracy
    navigator.geolocation.getCurrentPosition(success, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    });
  }, []);

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
  };

  return { location, loading, error, updateLocation };
};

// Mock reverse geocoding function
const mockReverseGeocode = async (lat, lng) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple mock based on coordinates
  if (lat > 37.7 && lat < 37.8 && lng > -122.5 && lng < -122.3) {
    return { city: 'San Francisco', state: 'CA', country: 'USA' };
  } else if (lat > 40.7 && lat < 40.8 && lng > -74.1 && lng < -73.9) {
    return { city: 'New York', state: 'NY', country: 'USA' };
  } else if (lat > 34.0 && lat < 34.1 && lng > -118.3 && lng < -118.2) {
    return { city: 'Los Angeles', state: 'CA', country: 'USA' };
  } else {
    return { city: 'Unknown City', state: 'Unknown State', country: 'USA' };
  }
};

export default useGeolocation;