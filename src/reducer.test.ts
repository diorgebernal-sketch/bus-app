import { describe, expect, it } from 'vitest';
import { seedState } from './data/seed';
import { etaToStop } from './lib/eta';
import { tripPath } from './lib/geo';
import { DWELL_MS, reducer } from './reducer';
import type { AppState } from './types';

const T0 = 1_000_000;

/** Ticks the trip forward until `until` returns true (or the trip ends). */
function drive(state: AppState, now: number, until: (s: AppState) => boolean): [AppState, number] {
  let s = state;
  let t = now;
  for (let i = 0; i < 5000 && s.trip.active && !until(s); i++) {
    t += 500;
    s = reducer(s, { type: 'TICK', now: t });
  }
  return [s, t];
}

describe('trip simulation', () => {
  it('stops at each stop in order and finishes at school', () => {
    let s = reducer(seedState(T0), { type: 'START_TRIP', direction: 'morning', now: T0 });
    const visited: string[] = [s.trip.atStopId!];
    let t = T0;
    while (s.trip.active) {
      t += 500;
      s = reducer(s, { type: 'TICK', now: t });
      if (s.trip.atStopId && visited[visited.length - 1] !== s.trip.atStopId) visited.push(s.trip.atStopId);
    }
    expect(visited).toEqual(['s1', 's2', 's3', 's4', 's5', 'school']);
    expect(s.trip.completedAt).not.toBeNull();
  });

  it('waits at a stop for the dwell time', () => {
    let s = reducer(seedState(T0), { type: 'START_TRIP', direction: 'morning', now: T0 });
    let t: number;
    [s, t] = drive(s, T0, (x) => x.trip.atStopId === 's2');
    const at = s.trip.progress;
    s = reducer(s, { type: 'TICK', now: t + DWELL_MS - 100 });
    expect(s.trip.progress).toBe(at);
    s = reducer(s, { type: 'TICK', now: t + DWELL_MS + 500 });
    expect(s.trip.progress).toBeGreaterThan(at);
  });

  it('runs the afternoon route in reverse from school', () => {
    const path = tripPath(seedState().route, 'afternoon');
    expect(path.stops.map((p) => p.id)).toEqual(['school', 's5', 's4', 's3', 's2', 's1']);
  });

  it('marks riders as at school when a morning trip ends', () => {
    let s = reducer(seedState(T0), { type: 'START_TRIP', direction: 'morning', now: T0 });
    s = reducer(s, { type: 'SET_STATUS', studentId: 'st1', status: 'on_bus', now: T0 });
    s = reducer(s, { type: 'END_TRIP', now: T0 + 1 });
    expect(s.students.find((x) => x.id === 'st1')!.status).toBe('at_school');
    expect(s.notifications.some((n) => n.parentId === 'p1' && n.text.includes('arrived'))).toBe(true);
  });

  it('alerts a parent once as the bus approaches their stop', () => {
    let s = reducer(seedState(T0), { type: 'START_TRIP', direction: 'morning', now: T0 });
    [s] = drive(s, T0, (x) => x.trip.atStopId === 's4');
    const alerts = s.notifications.filter((n) => n.parentId === 'p2' && n.text.includes('Noah'));
    expect(alerts).toHaveLength(1);
  });

  it('alerts the family at the first stop as the trip starts', () => {
    let s = reducer(seedState(T0), { type: 'START_TRIP', direction: 'morning', now: T0 });
    s = reducer(s, { type: 'TICK', now: T0 + 500 });
    expect(s.notifications.some((n) => n.parentId === 'p3' && n.text.includes('is at Oak St'))).toBe(true);
  });

  it('keeps absent students absent when a trip starts and skips their alerts', () => {
    let s = reducer(seedState(T0), { type: 'REPORT_ABSENCE', studentId: 'st3', absent: true, now: T0 });
    s = reducer(s, { type: 'START_TRIP', direction: 'morning', now: T0 });
    expect(s.students.find((x) => x.id === 'st3')!.status).toBe('absent');
    [s] = drive(s, T0, (x) => x.trip.atStopId === 's5');
    expect(s.notifications.some((n) => n.text.includes('Noah'))).toBe(false);
  });
});

describe('eta', () => {
  it('counts down to a stop ahead and is null once passed', () => {
    let s = reducer(seedState(T0), { type: 'START_TRIP', direction: 'morning', now: T0 });
    const first = etaToStop(s, 's4', T0)!;
    expect(first).toBeGreaterThan(0);
    let t: number;
    [s, t] = drive(s, T0, (x) => x.trip.progress > 1000);
    expect(etaToStop(s, 's4', t)!).toBeLessThan(first);
    [s, t] = drive(s, t, (x) => x.trip.atStopId === 's5');
    expect(etaToStop(s, 's4', t)).toBeNull();
  });
});

describe('messages and payments', () => {
  it('notifies the parent when the driver replies', () => {
    const s = reducer(seedState(T0), { type: 'SEND_MESSAGE', parentId: 'p1', from: 'driver', text: 'Hi!', now: T0 });
    const msg = s.messages[s.messages.length - 1];
    expect(msg.readByDriver).toBe(true);
    expect(msg.readByParent).toBe(false);
    expect(s.notifications[0].kind).toBe('message');
  });

  it('ignores blank messages', () => {
    const before = seedState(T0);
    expect(reducer(before, { type: 'SEND_MESSAGE', parentId: 'p1', from: 'parent', text: '   ', now: T0 })).toBe(before);
  });

  it('pays only invoices that are still due', () => {
    const s = reducer(seedState(T0), { type: 'PAY_INVOICES', invoiceIds: ['inv1', 'inv2', 'inv3'], paidWith: 'Visa •••• 4242', now: T0 });
    expect(s.invoices.filter((i) => i.parentId === 'p1' && i.status === 'due')).toHaveLength(0);
    expect(s.invoices.find((i) => i.id === 'inv1')!.paidAt).not.toBe(T0); // already paid, untouched
    expect(s.notifications[0].text).toContain('$57.00');
  });
});
