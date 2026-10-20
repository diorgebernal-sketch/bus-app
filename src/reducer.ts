import { seedState } from './data/seed';
import { tripPath } from './lib/geo';
import { uid } from './lib/format';
import type { AppState, Direction, Notification, Role, StudentStatus } from './types';

/** Simulated bus speed in meters/second (sped up so a demo run takes a few minutes). */
export const SIM_SPEED = 25;
/** How long the bus waits at each stop, in ms. */
export const DWELL_MS = 4000;
/** Distance before a child's stop at which the parent is alerted. */
export const APPROACH_ALERT_M = 600;

export type Action =
  | { type: 'REPLACE'; state: AppState }
  | { type: 'RESET' }
  | { type: 'START_TRIP'; direction: Direction; now: number }
  | { type: 'PAUSE_TRIP'; paused: boolean; now: number }
  | { type: 'END_TRIP'; now: number }
  | { type: 'TICK'; now: number }
  | { type: 'SET_STATUS'; studentId: string; status: StudentStatus; now: number }
  | { type: 'REPORT_ABSENCE'; studentId: string; absent: boolean; now: number }
  | { type: 'SEND_MESSAGE'; parentId: string; from: Role; text: string; now: number }
  | { type: 'MARK_THREAD_READ'; parentId: string; reader: Role }
  | { type: 'ANNOUNCE'; text: string; now: number }
  | { type: 'PAY_INVOICES'; invoiceIds: string[]; paidWith: string; now: number }
  | { type: 'ADD_CARD'; parentId: string; brand: string; last4: string; exp: string }
  | { type: 'REMOVE_CARD'; cardId: string }
  | { type: 'SET_AUTOPAY'; parentId: string; on: boolean }
  | { type: 'MARK_NOTIFICATIONS_READ'; parentId: string };

function notify(
  state: AppState,
  parentId: string,
  text: string,
  kind: Notification['kind'],
  now: number,
): AppState {
  const n: Notification = { id: uid('n'), parentId, text, kind, at: now, read: false };
  return { ...state, notifications: [n, ...state.notifications].slice(0, 200) };
}

function stopName(state: AppState, stopId: string): string {
  return state.route.stops.find((s) => s.id === stopId)?.name ?? 'the stop';
}

function finishTrip(state: AppState, now: number): AppState {
  let next: AppState = { ...state, trip: { ...state.trip, active: false, paused: false, atStopId: null, completedAt: now } };
  if (state.trip.direction === 'morning') {
    for (const s of state.students) {
      if (s.status === 'on_bus') {
        next = notify(next, s.parentId, `${s.firstName} arrived at ${state.route.school.name}.`, 'student', now);
      }
    }
    next = {
      ...next,
      students: next.students.map((s) => (s.status === 'on_bus' ? { ...s, status: 'at_school', statusAt: now } : s)),
    };
  }
  return next;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REPLACE':
      return action.state;

    case 'RESET':
      return seedState();

    case 'START_TRIP': {
      const { direction, now } = action;
      const initial: StudentStatus = direction === 'morning' ? 'waiting' : 'at_school';
      const first = tripPath(state.route, direction).stops[0];
      let next: AppState = {
        ...state,
        trip: {
          active: true, paused: false, direction, progress: 0, lastTick: now, dwellUntil: now + DWELL_MS,
          atStopId: first.id, startedAt: now, completedAt: null, notified: [],
        },
        students: state.students.map((s) => (s.status === 'absent' ? s : { ...s, status: initial, statusAt: now })),
      };
      const label = direction === 'morning' ? 'morning pickup' : 'afternoon drop-off';
      for (const p of state.parents) {
        next = notify(next, p.id, `Bus #${state.route.busNumber} started its ${label} route.`, 'bus', now);
      }
      return next;
    }

    case 'PAUSE_TRIP':
      if (!state.trip.active) return state;
      return { ...state, trip: { ...state.trip, paused: action.paused, lastTick: action.now } };

    case 'END_TRIP':
      if (!state.trip.active) return state;
      return finishTrip(state, action.now);

    case 'TICK': {
      const { trip } = state;
      const { now } = action;
      if (!trip.active || trip.paused) return state;

      const path = tripPath(state.route, trip.direction);
      let next: AppState;
      if (now < trip.dwellUntil) {
        next = { ...state, trip: { ...trip, lastTick: now } };
      } else {
        if (trip.progress >= path.total) return finishTrip(state, now);
        const dt = Math.min(2, Math.max(0, (now - trip.lastTick) / 1000));
        let progress = Math.min(path.total, trip.progress + SIM_SPEED * dt);
        let dwellUntil = 0;
        let atStopId: string | null = null;
        // Pull over at the first stop crossed during this tick.
        const crossed = path.stops.find((s) => s.distance > trip.progress && s.distance <= progress);
        if (crossed) {
          progress = crossed.distance;
          atStopId = crossed.id;
          dwellUntil = now + DWELL_MS;
        }
        next = { ...state, trip: { ...trip, progress, lastTick: now, dwellUntil, atStopId } };
      }

      // Heads-up to parents whose child's stop is coming up (once per trip).
      const { progress } = next.trip;
      const notified = [...trip.notified];
      for (const s of state.students) {
        if (s.status === 'absent' || notified.includes(s.id)) continue;
        if (trip.direction === 'afternoon' && s.status !== 'on_bus') continue;
        const stop = path.stops.find((p) => p.id === s.stopId);
        if (!stop) continue;
        const remaining = stop.distance - progress;
        if (remaining < 0 || remaining > APPROACH_ALERT_M) continue;
        notified.push(s.id);
        const verb = trip.direction === 'morning' ? 'pick up' : 'drop off';
        const text =
          remaining === 0
            ? `Bus #${state.route.busNumber} is at ${stop.name} to ${verb} ${s.firstName}.`
            : `Bus #${state.route.busNumber} is about ${Math.max(1, Math.round(remaining / SIM_SPEED))} sec from ${stop.name} to ${verb} ${s.firstName}.`;
        next = notify(next, s.parentId, text, 'bus', now);
      }
      return { ...next, trip: { ...next.trip, notified } };
    }

    case 'SET_STATUS': {
      const student = state.students.find((s) => s.id === action.studentId);
      if (!student || student.status === action.status) return state;
      let next: AppState = {
        ...state,
        students: state.students.map((s) =>
          s.id === action.studentId ? { ...s, status: action.status, statusAt: action.now } : s,
        ),
      };
      const bus = `Bus #${state.route.busNumber}`;
      const texts: Partial<Record<StudentStatus, string>> = {
        on_bus: `${student.firstName} boarded ${bus}.`,
        home: `${student.firstName} was dropped off at ${stopName(state, student.stopId)}.`,
        at_school: `${student.firstName} arrived at ${state.route.school.name}.`,
        absent: `${student.firstName} was marked absent by the driver.`,
      };
      const text = texts[action.status];
      if (text) next = notify(next, student.parentId, text, 'student', action.now);
      return next;
    }

    case 'REPORT_ABSENCE': {
      const restored: StudentStatus = state.trip.direction === 'afternoon' && state.trip.active ? 'at_school' : 'waiting';
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === action.studentId
            ? { ...s, status: action.absent ? 'absent' : restored, statusAt: action.now }
            : s,
        ),
      };
    }

    case 'SEND_MESSAGE': {
      const text = action.text.trim();
      if (!text) return state;
      let next: AppState = {
        ...state,
        messages: [
          ...state.messages,
          {
            id: uid('m'), parentId: action.parentId, from: action.from, text, at: action.now,
            readByParent: action.from === 'parent', readByDriver: action.from === 'driver',
          },
        ],
      };
      if (action.from === 'driver') {
        const driver = state.drivers.find((d) => d.id === state.route.driverId);
        next = notify(next, action.parentId, `New message from ${driver?.name ?? 'your driver'}.`, 'message', action.now);
      }
      return next;
    }

    case 'MARK_THREAD_READ':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.parentId !== action.parentId
            ? m
            : action.reader === 'parent'
              ? { ...m, readByParent: true }
              : { ...m, readByDriver: true },
        ),
      };

    case 'ANNOUNCE': {
      const text = action.text.trim();
      if (!text) return state;
      let next: AppState = {
        ...state,
        announcements: [{ id: uid('a'), text, at: action.now }, ...state.announcements],
      };
      for (const p of state.parents) next = notify(next, p.id, `Announcement: ${text}`, 'announcement', action.now);
      return next;
    }

    case 'PAY_INVOICES': {
      const paid = state.invoices.filter((i) => action.invoiceIds.includes(i.id) && i.status === 'due');
      if (!paid.length) return state;
      let next: AppState = {
        ...state,
        invoices: state.invoices.map((i) =>
          paid.some((p) => p.id === i.id) ? { ...i, status: 'paid', paidAt: action.now, paidWith: action.paidWith } : i,
        ),
      };
      const total = paid.reduce((sum, i) => sum + i.amount, 0);
      next = notify(next, paid[0].parentId, `Payment of $${total.toFixed(2)} received. Thank you!`, 'payment', action.now);
      return next;
    }

    case 'ADD_CARD':
      return {
        ...state,
        cards: [...state.cards, { id: uid('c'), parentId: action.parentId, brand: action.brand, last4: action.last4, exp: action.exp }],
      };

    case 'REMOVE_CARD':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.cardId) };

    case 'SET_AUTOPAY':
      return { ...state, parents: state.parents.map((p) => (p.id === action.parentId ? { ...p, autopay: action.on } : p)) };

    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.parentId === action.parentId ? { ...n, read: true } : n)),
      };
  }
}
