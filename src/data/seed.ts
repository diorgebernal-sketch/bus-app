import type { AppState } from '../types';

const HOUR = 3600_000;

export function seedState(now = Date.now()): AppState {
  return {
    version: 1,
    route: {
      id: 'r12',
      name: 'Route 12 · North Loop',
      busNumber: '12',
      driverId: 'd1',
      school: { name: 'Lincoln Elementary', lat: 39.797, lng: -89.623, time: '7:40 AM' },
      stops: [
        { id: 's1', name: 'Oak St & 5th Ave', lat: 39.79, lng: -89.67, time: '7:05 AM' },
        { id: 's2', name: 'Maple Ave & Elm', lat: 39.795, lng: -89.66, time: '7:12 AM' },
        { id: 's3', name: 'Cedar Park Entrance', lat: 39.801, lng: -89.652, time: '7:18 AM' },
        { id: 's4', name: 'Lincoln & Walnut', lat: 39.806, lng: -89.642, time: '7:24 AM' },
        { id: 's5', name: 'Riverside Dr', lat: 39.803, lng: -89.631, time: '7:30 AM' },
      ],
    },
    drivers: [{ id: 'd1', name: 'Robert Hughes', phone: '(217) 555-0142', license: 'CDL-B · IL 4471-0923' }],
    parents: [
      { id: 'p1', name: 'Maria Lopez', email: 'maria.lopez@example.com', phone: '(217) 555-0101', autopay: false },
      { id: 'p2', name: 'James Carter', email: 'james.carter@example.com', phone: '(217) 555-0102', autopay: true },
      { id: 'p3', name: 'Grace Johnson', email: 'grace.j@example.com', phone: '(217) 555-0103', autopay: false },
      { id: 'p4', name: 'Daniel Kim', email: 'dkim@example.com', phone: '(217) 555-0104', autopay: false },
      { id: 'p5', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '(217) 555-0105', autopay: true },
    ],
    students: [
      {
        id: 'st1', firstName: 'Ava', lastName: 'Lopez', grade: '3rd', stopId: 's2', parentId: 'p1', color: '#e76f51',
        allergies: 'Peanuts (severe) – EpiPen in backpack', medicalNotes: '',
        emergencyContacts: [
          { name: 'Maria Lopez', relation: 'Mother', phone: '(217) 555-0101' },
          { name: 'Carlos Lopez', relation: 'Father', phone: '(217) 555-0111' },
        ],
        status: 'waiting',
      },
      {
        id: 'st2', firstName: 'Leo', lastName: 'Lopez', grade: '1st', stopId: 's2', parentId: 'p1', color: '#2a9d8f',
        allergies: 'None', medicalNotes: 'Sits near the front – gets motion sick',
        emergencyContacts: [
          { name: 'Maria Lopez', relation: 'Mother', phone: '(217) 555-0101' },
          { name: 'Carlos Lopez', relation: 'Father', phone: '(217) 555-0111' },
        ],
        status: 'waiting',
      },
      {
        id: 'st3', firstName: 'Noah', lastName: 'Carter', grade: '4th', stopId: 's4', parentId: 'p2', color: '#457b9d',
        allergies: 'None', medicalNotes: 'Asthma – inhaler in front pocket',
        emergencyContacts: [{ name: 'James Carter', relation: 'Father', phone: '(217) 555-0102' }],
        status: 'waiting',
      },
      {
        id: 'st4', firstName: 'Mia', lastName: 'Johnson', grade: '2nd', stopId: 's1', parentId: 'p3', color: '#9b5de5',
        allergies: 'Bee stings', medicalNotes: '',
        emergencyContacts: [{ name: 'Grace Johnson', relation: 'Mother', phone: '(217) 555-0103' }],
        status: 'waiting',
      },
      {
        id: 'st5', firstName: 'Ethan', lastName: 'Kim', grade: '5th', stopId: 's3', parentId: 'p4', color: '#f4a261',
        allergies: 'None', medicalNotes: '',
        emergencyContacts: [
          { name: 'Daniel Kim', relation: 'Father', phone: '(217) 555-0104' },
          { name: 'Sun Kim', relation: 'Grandmother', phone: '(217) 555-0144' },
        ],
        status: 'waiting',
      },
      {
        id: 'st6', firstName: 'Zoe', lastName: 'Patel', grade: '3rd', stopId: 's5', parentId: 'p5', color: '#ef476f',
        allergies: 'Dairy', medicalNotes: 'Type 1 diabetes – snack allowed on bus',
        emergencyContacts: [{ name: 'Priya Patel', relation: 'Mother', phone: '(217) 555-0105' }],
        status: 'waiting',
      },
    ],
    messages: [
      {
        id: 'm1', parentId: 'p1', from: 'parent', text: 'Hi Mr. Hughes! Leo forgot his jacket on the bus yesterday — blue with a dinosaur patch.',
        at: now - 20 * HOUR, readByParent: true, readByDriver: true,
      },
      {
        id: 'm2', parentId: 'p1', from: 'driver', text: 'Found it! I’ll hand it to him this morning.',
        at: now - 19 * HOUR, readByParent: true, readByDriver: true,
      },
      {
        id: 'm3', parentId: 'p4', from: 'parent', text: 'Ethan’s grandma will pick him up at the stop this afternoon.',
        at: now - 2 * HOUR, readByParent: true, readByDriver: false,
      },
    ],
    announcements: [
      { id: 'a1', text: 'Reminder: no school Friday (teacher in-service). No bus service that day.', at: now - 26 * HOUR },
    ],
    invoices: [
      { id: 'inv1', parentId: 'p1', description: 'Transportation fee – September', amount: 45, dueDate: '2026-09-05', status: 'paid', paidAt: now - 45 * 24 * HOUR, paidWith: 'Visa •••• 4242' },
      { id: 'inv2', parentId: 'p1', description: 'Transportation fee – October', amount: 45, dueDate: '2026-10-31', status: 'due' },
      { id: 'inv3', parentId: 'p1', description: 'Field trip bus – Science Museum', amount: 12, dueDate: '2026-10-24', status: 'due' },
      { id: 'inv4', parentId: 'p2', description: 'Transportation fee – October', amount: 45, dueDate: '2026-10-31', status: 'paid', paidAt: now - 10 * 24 * HOUR, paidWith: 'Mastercard •••• 5100' },
      { id: 'inv5', parentId: 'p2', description: 'Field trip bus – Science Museum', amount: 12, dueDate: '2026-10-24', status: 'due' },
      { id: 'inv6', parentId: 'p3', description: 'Transportation fee – October', amount: 45, dueDate: '2026-10-31', status: 'due' },
      { id: 'inv7', parentId: 'p4', description: 'Transportation fee – October', amount: 45, dueDate: '2026-10-31', status: 'due' },
      { id: 'inv8', parentId: 'p5', description: 'Transportation fee – October', amount: 45, dueDate: '2026-10-31', status: 'paid', paidAt: now - 5 * 24 * HOUR, paidWith: 'Visa •••• 1881' },
    ],
    cards: [
      { id: 'c1', parentId: 'p1', brand: 'Visa', last4: '4242', exp: '08/28' },
      { id: 'c2', parentId: 'p2', brand: 'Mastercard', last4: '5100', exp: '02/27' },
      { id: 'c3', parentId: 'p5', brand: 'Visa', last4: '1881', exp: '11/29' },
    ],
    notifications: [],
    trip: {
      active: false, paused: false, direction: 'morning', progress: 0, lastTick: 0, dwellUntil: 0,
      atStopId: null, startedAt: 0, completedAt: null, notified: [],
    },
  };
}
