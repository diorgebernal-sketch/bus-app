import { useEffect } from 'react';
import { ChatThread } from '../../components/ChatThread';
import { Avatar } from '../../components/ui';
import { useStore } from '../../store';
import { useParent } from './ParentApp';

export function ParentMessages() {
  const { state, dispatch } = useStore();
  const parent = useParent();
  const driver = state.drivers.find((d) => d.id === state.route.driverId)!;
  const thread = state.messages.filter((m) => m.parentId === parent.id);
  const unread = thread.some((m) => !m.readByParent);

  useEffect(() => {
    if (unread) dispatch({ type: 'MARK_THREAD_READ', parentId: parent.id, reader: 'parent' });
  }, [unread, dispatch, parent.id]);

  return (
    <div className="stack fill">
      <div className="card row gap">
        <Avatar name={driver.name} color="#f5b700" />
        <div className="grow">
          <strong>{driver.name}</strong>
          <div className="muted small">Bus #{state.route.busNumber} driver</div>
        </div>
      </div>
      <ChatThread
        messages={thread}
        me="parent"
        onSend={(text) => dispatch({ type: 'SEND_MESSAGE', parentId: parent.id, from: 'parent', text, now: Date.now() })}
        quickReplies={['Running a couple minutes late!', 'Someone else is picking up today.', 'Thank you!']}
        placeholder={`Message ${driver.name.split(' ')[0]}…`}
      />
    </div>
  );
}
