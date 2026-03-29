import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { LOCATIONS } from '../../utils/constants';
import { MapPin, X, ExternalLink, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// ── Campus Center (configurable — set to a sample university location) ──
const CAMPUS_CENTER = [12.9716, 77.5946]; // Bangalore center — adjust for your campus
const DEFAULT_ZOOM = 15;

// ── Building coordinates spread around campus center ──
const CAMPUS_COORDS = {
  'Main Library':              [12.9730, 77.5940],
  'Student Center':            [12.9716, 77.5946],
  'Engineering Building':      [12.9705, 77.5970],
  'Science Hall':              [12.9698, 77.5955],
  'Arts & Humanities Building': [12.9728, 77.5920],
  'Business School':           [12.9710, 77.5925],
  'Cafeteria':                 [12.9700, 77.5942],
  'Gymnasium':                 [12.9690, 77.5975],
  'Computer Lab':              [12.9708, 77.5960],
  'Lecture Hall A':            [12.9722, 77.5948],
  'Lecture Hall B':            [12.9718, 77.5958],
  'Parking Lot':               [12.9740, 77.5915],
  'Bus Stop':                  [12.9745, 77.5935],
  'Sports Field':              [12.9685, 77.5985],
  'Dormitory A':               [12.9738, 77.5955],
  'Dormitory B':               [12.9735, 77.5965],
  'Admin Block':               [12.9725, 77.5935],
  'Medical Center':            [12.9695, 77.5930],
  'Auditorium':                [12.9712, 77.5950],
  'Research Center':           [12.9702, 77.5978],
};

// ── Custom marker icons ──
function createIcon(color, count) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 700; font-size: 12px;
        box-shadow: 0 2px 8px ${color}80, 0 4px 16px rgba(0,0,0,0.2);
        font-family: 'Inter', sans-serif;
        position: relative;
      ">
        ${count}
        <div style="
          position: absolute; top: -4px; right: -4px;
          width: 12px; height: 12px;
          background: ${color};
          border-radius: 50%;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.6;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

const emptyIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="
      width: 14px; height: 14px;
      background: #94a3b8;
      border: 2px solid white;
      border-radius: 50%;
      opacity: 0.5;
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

// ── Auto-fit map bounds ──
function FitBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => l.coords));
      map.fitBounds(bounds.pad(0.15));
    }
  }, [locations, map]);

  return null;
}

export default function CampusMap({ items, onLocationClick }) {
  // Count items per location
  const locationData = {};
  items.forEach(item => {
    const locName = item.location?.name || 'Unknown';
    if (!locationData[locName]) {
      locationData[locName] = { total: 0, lost: 0, found: 0, items: [] };
    }
    locationData[locName].total++;
    if (item.type === 'lost') locationData[locName].lost++;
    else locationData[locName].found++;
    locationData[locName].items.push(item);
  });

  // Build marker data
  const activeLocations = [];
  const emptyLocations = [];

  LOCATIONS.forEach(loc => {
    const coords = CAMPUS_COORDS[loc];
    if (!coords) return;
    const data = locationData[loc];
    if (data && data.total > 0) {
      activeLocations.push({ name: loc, coords, ...data });
    } else {
      emptyLocations.push({ name: loc, coords });
    }
  });

  return (
    <div className="card overflow-hidden animate-fade-in" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm px-3 py-2 rounded-xl text-xs font-semibold shadow-lg border border-surface-200 dark:border-surface-700">
        <MapPin className="w-3.5 h-3.5 text-primary-500" />
        Campus Map — Live
        <span className="w-2 h-2 rounded-full bg-found-500 animate-pulse"></span>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm px-3 py-2 rounded-xl text-[11px] flex gap-3 shadow-lg border border-surface-200 dark:border-surface-700">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: '#f97316' }}></span> Lost
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: '#10b981' }}></span> Found
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: '#94a3b8', opacity: 0.5 }}></span> No items
        </span>
      </div>

      <div style={{ height: '420px', width: '100%' }}>
        <MapContainer
          center={CAMPUS_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%', borderRadius: '16px' }}
          zoomControl={false}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds locations={[...activeLocations, ...emptyLocations]} />

          {/* Empty location markers */}
          {emptyLocations.map(loc => (
            <Marker key={loc.name} position={loc.coords} icon={emptyIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '140px' }}>
                  <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 4px 0' }}>{loc.name}</p>
                  <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>No items reported here</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Active location markers */}
          {activeLocations.map(loc => {
            const color = loc.lost > loc.found ? '#f97316' : '#10b981';
            const icon = createIcon(color, loc.total);

            return (
              <Marker
                key={loc.name}
                position={loc.coords}
                icon={icon}
                eventHandlers={{
                  click: () => onLocationClick?.(loc.name),
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '200px' }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 6px 0' }}>{loc.name}</p>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }}></span>
                        {loc.lost} lost
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                        {loc.found} found
                      </span>
                    </div>
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                      {loc.items.slice(0, 4).map(item => (
                        <a
                          key={item._id}
                          href={`/items/${item._id}`}
                          style={{
                            display: 'block',
                            fontSize: '11px',
                            padding: '3px 0',
                            color: '#334155',
                            textDecoration: 'none',
                          }}
                        >
                          {item.type === 'lost' ? '🔍' : '📌'} {item.title}
                        </a>
                      ))}
                      {loc.items.length > 4 && (
                        <p style={{ fontSize: '11px', color: '#6366f1', margin: '4px 0 0 0' }}>
                          +{loc.items.length - 4} more items
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Individual pinned items with exact coordinates */}
          {items.filter(item => item.location?.lat && item.location?.lng).map(item => {
            const color = item.type === 'lost' ? '#f97316' : '#10b981';
            const pinIcon = L.divIcon({
              className: 'custom-map-marker',
              html: `
                <div style="position: relative;">
                  <div style="
                    width: 20px; height: 20px;
                    background: ${color};
                    border: 2px solid white;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    box-shadow: 0 2px 8px ${color}60;
                  "></div>
                  <div style="
                    width: 6px; height: 6px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 7px; left: 7px;
                    transform: rotate(-45deg);
                  "></div>
                </div>
              `,
              iconSize: [20, 26],
              iconAnchor: [10, 26],
              popupAnchor: [0, -26],
            });

            return (
              <Marker
                key={`pin-${item._id}`}
                position={[item.location.lat, item.location.lng]}
                icon={pinIcon}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '180px' }}>
                    <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 4px 0' }}>
                      {item.type === 'lost' ? '🔍' : '📌'} {item.title}
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px 0' }}>
                      📍 {item.location.name} — Exact pin
                    </p>
                    <a
                      href={`/items/${item._id}`}
                      style={{ fontSize: '11px', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}
                    >
                      View Details →
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
