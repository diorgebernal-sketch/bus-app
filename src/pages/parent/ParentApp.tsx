import { Navigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useStore } from '../../store';

export function ParentApp() {
  const { state, session } = useStore();
  if (!session || session.role !== 'parent') return <Navigate to="/" replace />;
  const parent = state.parents.find((p) => p.id === session.id)!;
  const unreadMsgs = state.messages.filter((m) => m.parentId === parent.id && !m.readByParent).length;
  const unreadAlerts = state.notifications.filter((n) => n.parentId === parent.id && !n.read).length;
  const due = state.invoices.filter((i) => i.parentId === parent.id && i.status === 'due').length;

  return (
    <Layout
      title="BusBuddy"
      subtitle={`Hi, ${parent.name.split(' ')[0]}`}
      tabs={[
        { to: '/parent', label: 'Track', icon: '📍', end: true },
        { to: '/parent/alerts', label: 'Alerts', icon: '🔔', badge: unreadAlerts },
        { to: '/parent/messages', label: 'Driver', icon: '💬', badge: unreadMsgs },
        { to: '/parent/payments', label: 'Pay', icon: '💳', badge: due },
        { to: '/parent/children', label: 'Kids', icon: '🎒' },
      ]}
    />
  );
}

export function useParent() {
  const { state, session } = useStore();
  return state.parents.find((p) => p.id === session?.id)!;
}
