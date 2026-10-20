import { DWELL_MS, SIM_SPEED } from '../reducer';
import type { AppState } from '../types';
import { tripPath } from './geo';

/** Seconds until the bus reaches `stopId`, or null if it's not on its way there. */
export function etaToStop(state: AppState, stopId: string, now: number): number | null {
  const { trip } = state;
  if (!trip.active) return null;
  const path = tripPath(state.route, trip.direction);
  const target = path.stops.find((s) => s.id === stopId);
  if (!target || target.distance < trip.progress) return null;
  if (target.distance === trip.progress) return 0;
  const stopsBetween = path.stops.filter((s) => s.distance > trip.progress && s.distance < target.distance).length;
  const dwellLeft = Math.max(0, trip.dwellUntil - now) / 1000;
  return (target.distance - trip.progress) / SIM_SPEED + (stopsBetween * DWELL_MS) / 1000 + dwellLeft;
}

export function nextStop(state: AppState) {
  const { trip } = state;
  const path = tripPath(state.route, trip.direction);
  return path.stops.find((s) => s.distance > trip.progress) ?? null;
}
