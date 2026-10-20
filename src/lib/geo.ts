import type { Direction, Route } from '../types';

export type LatLng = [number, number];

const EARTH_RADIUS_M = 6371000;

export function haversine(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export interface PathStop {
  id: string;
  name: string;
  point: LatLng;
  distance: number;
}

export interface TripPath {
  points: LatLng[];
  stops: PathStop[];
  total: number;
}

/** Morning runs stops -> school; afternoon runs school -> stops in reverse. */
export function tripPath(route: Route, direction: Direction): TripPath {
  const school = { id: 'school', name: route.school.name, point: [route.school.lat, route.school.lng] as LatLng };
  const stops = route.stops.map((s) => ({ id: s.id, name: s.name, point: [s.lat, s.lng] as LatLng }));
  const ordered = direction === 'morning' ? [...stops, school] : [school, ...[...stops].reverse()];
  let total = 0;
  const withDistance: PathStop[] = ordered.map((s, i) => {
    if (i > 0) total += haversine(ordered[i - 1].point, s.point);
    return { ...s, distance: total };
  });
  return { points: ordered.map((s) => s.point), stops: withDistance, total };
}

export function pointAt(path: TripPath, distance: number): LatLng {
  const { stops } = path;
  if (distance <= 0) return stops[0].point;
  for (let i = 1; i < stops.length; i++) {
    if (distance <= stops[i].distance) {
      const a = stops[i - 1];
      const b = stops[i];
      const t = (distance - a.distance) / (b.distance - a.distance || 1);
      return [a.point[0] + (b.point[0] - a.point[0]) * t, a.point[1] + (b.point[1] - a.point[1]) * t];
    }
  }
  return stops[stops.length - 1].point;
}
