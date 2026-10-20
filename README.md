# BusBuddy 🚌

A school bus tracking app for **parents** and **bus drivers**, built mobile-first with React, TypeScript and Vite.

## Features

**Parents**
- 📍 **Live tracking**: see the bus move on a map along the route, with a live ETA to your child's stop
- 🎒 **Ride status** for each child (waiting, on the bus, at school, dropped off, absent)
- 🔔 **Alerts** when the route starts, when the bus is approaching your stop, and when your child boards, arrives at school or is dropped off
- 🚫 **"Not riding today"**: report an absence so the driver knows not to wait
- 💬 **Message the driver** directly, with quick replies, or call them
- 💳 **Payments**: pay transportation and field-trip fees, save cards, turn on autopay, see payment history
- 📣 **Announcements** from the driver (delays, schedule changes)

**Drivers**
- 🗺️ **Route view**: start a morning pickup or afternoon drop-off, pause or end the trip, and see the next stop and its students
- ✅ **Check students on and off**: board, drop off or mark absent at each stop (parents are notified automatically)
- 🎒 **Student roster** grouped by stop, with search
- ⚕️ **Student info**: allergies, medical notes, parent contact and emergency contacts with tap-to-call
- 💬 **Inbox** with every parent, plus one-tap announcements to all families

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # production build in dist/
```

**Try the live demo flow:** open the app in two browser tabs. Sign in as the **driver** in one tab and as a **parent** in the other, then press **Start trip**. The bus moves on the parent's map in real time, and boarding, messages and announcements sync between the tabs instantly.

Use **Reset demo data** on the sign-in screen to start over.

## How it works

This is a front-end prototype with no server yet:

- All data lives in one reducer (`src/reducer.ts`) persisted to `localStorage`. Tabs sync through the browser `storage` event, standing in for a real-time backend.
- The driver's device "is" the GPS: while a trip runs, the driver tab moves the bus along the route at a sped-up demo speed (`SIM_SPEED`).
- Payments are simulated. Card numbers are checked (Luhn and expiry), but nothing is charged.
- Map tiles come from OpenStreetMap.

### Project layout

```
src/
  types.ts            data model
  reducer.ts          all app logic (trips, boarding, alerts, messages, payments)
  store.tsx           state provider, persistence, cross-tab sync, session
  data/seed.ts        demo route, students, parents, invoices
  lib/                geo math, ETA, card validation, formatting
  components/         layout, map, chat, badges
  pages/parent/       parent screens
  pages/driver/       driver screens
```

## Next steps for production

- A backend (e.g. Supabase or Firebase) for accounts, real-time data and push notifications
- Real GPS from the driver's phone (`navigator.geolocation.watchPosition`) instead of simulated movement
- A payment processor (e.g. Stripe) for real payments
- A school admin portal for managing routes, students and billing
