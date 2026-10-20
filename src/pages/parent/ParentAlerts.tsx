import { useEffect } from 'react';
import { Empty } from '../../components/ui';
import { relTime } from '../../lib/format';
import { useNow, useStore } from '../../store';
import { useParent } from './ParentApp';

const ICON = { bus: '🚌', student: '🎒', message: '💬', payment: '💳', announcement: '📣' } as const;

export function ParentAlerts() {
  const { state, dispatch } = useStore();
  const parent = useParent();
  const now = useNow(15000);
  const mine = state.notifications.filter((n) => n.parentId === parent.id);
  const unread = mine.some((n) => !n.read);

  useEffect(() => {
    if (unread) {
      const t = setTimeout(() => dispatch({ type: 'MARK_NOTIFICATIONS_READ', parentId: parent.id }), 1500);
      return () => clearTimeout(t);
    }
  }, [unread, dispatch, parent.id]);

  return (
    <div className="stack">
      <h2>Alerts</h2>
      {mine.length === 0 ? (
        <Empty>You’ll see pickup, drop-off and bus alerts here.</Empty>
      ) : (
        <ul className="list card">
          {mine.map((n) => (
            <li key={n.id} className={`list-item${n.read ? '' : ' unread'}`}>
              <span className="list-icon" aria-hidden>{ICON[n.kind]}</span>
              <div className="grow">
                <div>{n.text}</div>
                <div className="muted small">{relTime(n.at, now)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
