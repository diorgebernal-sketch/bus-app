export type Role = 'parent' | 'driver';
export type Direction = 'morning' | 'afternoon';
export type StudentStatus = 'waiting' | 'on_bus' | 'at_school' | 'home' | 'absent';

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Scheduled morning pickup time, e.g. "7:12 AM". */
  time: string;
}

export interface School {
  name: string;
  lat: number;
  lng: number;
  /** Scheduled morning arrival time. */
  time: string;
}

export interface Route {
  id: string;
  name: string;
  busNumber: string;
  driverId: string;
  stops: Stop[];
  school: School;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  stopId: string;
  parentId: string;
  color: string;
  allergies: string;
  medicalNotes: string;
  emergencyContacts: EmergencyContact[];
  status: StudentStatus;
  statusAt?: number;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  autopay: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
}

export interface Message {
  id: string;
  parentId: string;
  from: Role;
  text: string;
  at: number;
  readByParent: boolean;
  readByDriver: boolean;
}

export interface Announcement {
  id: string;
  text: string;
  at: number;
}

export interface Invoice {
  id: string;
  parentId: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'due' | 'paid';
  paidAt?: number;
  paidWith?: string;
}

export interface Card {
  id: string;
  parentId: string;
  brand: string;
  last4: string;
  exp: string;
}

export interface Notification {
  id: string;
  parentId: string;
  text: string;
  at: number;
  read: boolean;
  kind: 'bus' | 'student' | 'message' | 'payment' | 'announcement';
}

export interface Trip {
  active: boolean;
  paused: boolean;
  direction: Direction;
  /** Meters travelled along the trip path. */
  progress: number;
  lastTick: number;
  dwellUntil: number;
  /** Stop the bus is currently stopped at, if any ("school" for the school). */
  atStopId: string | null;
  startedAt: number;
  completedAt: number | null;
  /** Student ids whose parents already got the "approaching" alert this trip. */
  notified: string[];
}

export interface AppState {
  version: number;
  route: Route;
  parents: Parent[];
  drivers: Driver[];
  students: Student[];
  messages: Message[];
  announcements: Announcement[];
  invoices: Invoice[];
  cards: Card[];
  notifications: Notification[];
  trip: Trip;
}

export interface Session {
  role: Role;
  id: string;
}
