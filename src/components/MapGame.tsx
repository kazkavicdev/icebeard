'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';

interface TeamMember {
  id: string;
  name: string;
  status: string;
  coordinates?: [number, number]; // Latitude and longitude
  country?: string; // Add country field
  isLoadingCountry?: boolean;
}

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapGame() {
  const [isMounted, setIsMounted] = useState(false);
  const [icon, setIcon] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pickedMembers, setPickedMembers] = useState<TeamMember[]>([]);
  const [currentPick, setCurrentPick] = useState<TeamMember | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    // Initialize Leaflet only on client side
    import('leaflet').then(L => {
      const customIcon = L.icon({
        iconUrl: '/pin.png',
        iconSize: [30, 30], // Width and height of the icon
        iconAnchor: [15, 30], // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -30] // Point from which the popup should open relative to the iconAnchor
      });
      setIcon(customIcon);
    });

    setIsMounted(true);
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team');
      if (!response.ok) throw new Error('Failed to fetch team members');
      const data = await response.json();
      setTeamMembers(data.filter((member: TeamMember) => member.status === 'active'));
      setError('');
    } catch (err) {
      setError('Failed to load team members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=3`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'MapGame/1.0'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch country');
      const data = await response.json();
      return data.address?.country || 'Unknown Location';
    } catch (err) {
      console.error('Error fetching country:', err);
      return 'Unknown Location';
    }
  };

  const generateRandomCoordinates = (): [number, number] => {
    // Generate random coordinates within valid ranges
    // Latitude: -85 to 85 (avoiding poles for better map visibility)
    // Longitude: -180 to 180
    const lat = Math.random() * 170 - 85;
    const lng = Math.random() * 360 - 180;
    return [lat, lng];
  };

  const updateMemberCountry = async (memberId: string, coordinates: [number, number]) => {
    const country = await fetchCountryName(coordinates[0], coordinates[1]);
    setPickedMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, country, isLoadingCountry: false }
        : member
    ));
    if (currentPick?.id === memberId) {
      setCurrentPick(prev => prev ? { ...prev, country, isLoadingCountry: false } : null);
    }
  };

  // Center map on coordinates with animation
  const centerMapOn = (coordinates: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.flyTo(coordinates, 4, {
        duration: 2 // Animation duration in seconds
      });
    }
  };

  const handlePickRandomMember = () => {
    const availableMembers = teamMembers.filter(
      member => !pickedMembers.some(picked => picked.id === member.id)
    );

    if (availableMembers.length === 0) {
      setError('All team members have been picked!');
      setCurrentPick(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableMembers.length);
    const coordinates = generateRandomCoordinates();
    
    const pickedMember = {
      ...availableMembers[randomIndex],
      coordinates,
      isLoadingCountry: true
    };
    
    setCurrentPick(pickedMember);
    setPickedMembers(prev => [...prev, pickedMember]);
    setError('');

    // Center map on new pin location
    centerMapOn(coordinates);

    // Fetch country name asynchronously
    updateMemberCountry(pickedMember.id, coordinates);
  };

  const resetPicks = () => {
    setPickedMembers([]);
    setCurrentPick(null);
    setError('');
  };

  if (!isMounted) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Map Game - answer what you gonna do there</h2>
        <div className="h-[600px] w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Map Game - answer what you gonna do there</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePickRandomMember}
            disabled={loading || teamMembers.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pick Random Member
          </button>
          {pickedMembers.length > 0 && (
            <button
              onClick={resetPicks}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {currentPick && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Picked: <span className="font-bold">{currentPick.name}</span>
          {currentPick.coordinates && (
            <span className="ml-2">
              at [{currentPick.coordinates[0].toFixed(4)}, {currentPick.coordinates[1].toFixed(4)}]
              {currentPick.isLoadingCountry ? (
                <span className="ml-1">loading location...</span>
              ) : currentPick.country && (
                <span className="ml-1">in {currentPick.country}</span>
              )}
            </span>
          )}
          {pickedMembers.length < teamMembers.length && (
            <span className="ml-2">
              ({pickedMembers.length} of {teamMembers.length} picked)
            </span>
          )}
        </div>
      )}

      <div className="h-[600px] w-full">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          minZoom={2}
          maxBounds={[[-90, -180], [90, 180]]}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pickedMembers.map((member) => (
            member.coordinates && (
              <Marker 
                key={member.id} 
                position={member.coordinates}
                icon={icon}
              >
                <Popup>
                  <div className="font-medium">
                    {member.name}
                    <div className="text-sm text-gray-600 mt-1">
                      {member.isLoadingCountry ? (
                        <span className="inline-block animate-pulse">Loading location...</span>
                      ) : (
                        <span>📍 {member.country || 'Unknown Location'}</span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
} 