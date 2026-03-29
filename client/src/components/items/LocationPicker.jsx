import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair, LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const CAMPUS_CENTER = [12.9716, 77.5946];
const DEFAULT_ZOOM = 16;

// Custom red/blue pin marker
function createPinIcon(color = '#6366f1') {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 28px; height: 28px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 12px ${color}60, 0 2px 8px rgba(0,0,0,0.15);
        "></div>
        <div style="
          width: 8px; height: 8px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 10px; left: 10px;
          transform: rotate(-45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

const pinIcon = createPinIcon('#6366f1');
const pinIconLost = createPinIcon('#f97316');
const pinIconFound = createPinIcon('#10b981');

// Click handler component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Fly to location
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

export default function LocationPicker({ value, onChange, type = 'lost' }) {
  const [position, setPosition] = useState(
    value?.lat && value?.lng ? [value.lat, value.lng] : null
  );
  const [locating, setLocating] = useState(false);

  const icon = type === 'lost' ? pinIconLost : type === 'found' ? pinIconFound : pinIcon;

  const handleMapClick = useCallback((latlng) => {
    const coords = { lat: latlng.lat, lng: latlng.lng };
    setPosition([latlng.lat, latlng.lng]);
    onChange(coords);
  }, [onChange]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition([coords.lat, coords.lng]);
        onChange(coords);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-primary-500" />
          Pin Exact Location on Map
        </label>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors"
        >
          <LocateFixed className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          {locating ? 'Locating...' : 'Use my location'}
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-dashed border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors" style={{ height: '260px' }}>
        <MapContainer
          center={position || CAMPUS_CENTER}
          zoom={position ? 17 : DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {position && (
            <>
              <Marker position={position} icon={icon} />
              <FlyTo position={position} />
            </>
          )}
        </MapContainer>
      </div>

      {position ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-found-600 dark:text-found-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Location pinned: {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </p>
          <button
            type="button"
            onClick={() => { setPosition(null); onChange({ lat: null, lng: null }); }}
            className="text-xs text-danger hover:underline"
          >
            Clear pin
          </button>
        </div>
      ) : (
        <p className="text-xs text-surface-400 flex items-center gap-1">
          <Navigation className="w-3 h-3" />
          Click on the map to mark the exact spot, or use your current location
        </p>
      )}
    </div>
  );
}

// ── Read-only mini map for ItemDetail ──
export function LocationMiniMap({ lat, lng, title, type = 'lost' }) {
  if (!lat || !lng) return null;

  const icon = type === 'lost' ? pinIconLost : pinIconFound;

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-500" />
          Exact Location
        </h3>
      </div>
      <div style={{ height: '200px' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; OSM'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={icon} />
        </MapContainer>
      </div>
      <div className="px-4 py-2 bg-surface-50 dark:bg-surface-800/50 text-xs text-surface-500 flex items-center gap-1">
        <Navigation className="w-3 h-3" />
        {lat.toFixed(5)}, {lng.toFixed(5)}
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-primary-500 hover:text-primary-600 font-medium"
        >
          Open in Google Maps →
        </a>
      </div>
    </div>
  );
}
