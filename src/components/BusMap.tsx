import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { pointAt, tripPath, type LatLng } from '../lib/geo';
import type { AppState } from '../types';

const busIcon = L.divIcon({ className: 'bus-marker', html: '<div class="bus-pin">🚌</div>', iconSize: [40, 40], iconAnchor: [20, 20] });
const schoolIcon = L.divIcon({ className: 'bus-marker', html: '<div class="school-pin">🏫</div>', iconSize: [34, 34], iconAnchor: [17, 17] });

function FitRoute({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(L.latLngBounds(points), { padding: [28, 28] });
  }, [map, points]);
  return null;
}

export function BusMap({ state, highlightStopIds = [], height = 260 }: { state: AppState; highlightStopIds?: string[]; height?: number }) {
  const { route, trip } = state;
  const path = useMemo(() => tripPath(route, trip.direction), [route, trip.direction]);
  const bus = trip.active ? pointAt(path, trip.progress) : null;
  const travelled = trip.active ? [...path.stops.filter((s) => s.distance < trip.progress).map((s) => s.point), bus!] : [];

  return (
    <div className="map-wrap" style={{ height }}>
      <MapContainer center={path.points[0]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitRoute points={path.points} />
        <Polyline positions={path.points} pathOptions={{ color: '#1b2a4a', weight: 5, opacity: 0.35 }} />
        {travelled.length > 1 && <Polyline positions={travelled} pathOptions={{ color: '#f5b700', weight: 6 }} />}
        {route.stops.map((s) => {
          const mine = highlightStopIds.includes(s.id);
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={mine ? 10 : 7}
              pathOptions={{ color: mine ? '#e63946' : '#1b2a4a', fillColor: mine ? '#e63946' : '#fff', fillOpacity: 1, weight: 3 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {s.name} · {s.time}
              </Tooltip>
            </CircleMarker>
          );
        })}
        <Marker position={[route.school.lat, route.school.lng]} icon={schoolIcon}>
          <Tooltip direction="top">{route.school.name}</Tooltip>
        </Marker>
        {bus && <Marker position={bus} icon={busIcon} zIndexOffset={1000} />}
      </MapContainer>
    </div>
  );
}
