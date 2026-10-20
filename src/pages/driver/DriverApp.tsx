import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useStore } from '../../store';

export function DriverApp() {
  const { state, session, dispatch } = useStore();
  const active = state.trip.active && !state.trip.paused;

  // The driver's device is the bus's GPS: while a trip runs, it moves the bus along the route.
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => dispatch({ type: 'TICK', now: Date.now() }), 500);
    return () => clearInterval(t);
  }, [active, dispatch]);

  if (!session || session.role !== 'driver') return <Navigate to="/" replace />;
  const driver = state.drivers.find((d) => d.id === session.id)!;
  const unread = state.messages.filter((m) => !m.readByDriver).length;
  const absent = state.students.filter((s) => s.status === 'absent').length;

  return (
    <Layout
      title={`Bus #${state.route.busNumber}`}
      subtitle={`Driver · ${driver.name}`}
      tabs={[
        { to: '/driver', label: 'Route', icon: '🗺️', end: true },
        { to: '/driver/roster', label: 'Students', icon: '🎒', badge: absent },
        { to: '/driver/messages', label: 'Messages', icon: '💬', badge: unread },
      ]}
    />
  );
}
