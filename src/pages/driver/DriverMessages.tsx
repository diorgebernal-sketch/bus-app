import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChatThread } from '../../components/ChatThread';
import { Avatar } from '../../components/ui';
import { relTime } from '../../lib/format';
import { useNow, useStore } from '../../store';

export function DriverInbox() {
  const { state, dispatch } = useStore();
  const now = useNow(15000);
  const [announcement, setAnnouncement] = useState('');
  const [sent, setSent] = useState(false);

  const threads = state.parents
    .map((p) => {
      const msgs = state.messages.filter((m) => m.parentId === p.id);
      return {
        parent: p,
        last: msgs[msgs.length - 1],
        unread: msgs.filter((m) => !m.readByDriver).length,
        kids: state.students.filter((s) => s.parentId === p.id).map((s) => s.firstName),
      };
    })
    .sort((a, b) => (b.last?.at ?? 0) - (a.last?.at ?? 0));

  const announce = (text: string) => {
    dispatch({ type: 'ANNOUNCE', text, now: Date.now() });
    setAnnouncement('');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <div className="stack">
      <section className="card">
        <h3 className="tight">📣 Announce to all families</h3>
        <div className="chips">
          {['Running about 10 minutes late.', 'Bus is on time today.', 'Traffic delay — will update soon.'].map((q) => (
            <button key={q} className="chip" onClick={() => announce(q)}>
              {q}
            </button>
          ))}
        </div>
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            if (announcement.trim()) announce(announcement);
          }}
        >
          <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Write an announcement…" aria-label="Announcement" />
          <button className="btn" type="submit" disabled={!announcement.trim()}>
            Send
          </button>
        </form>
        {sent && <p className="success-text small">Sent to {state.parents.length} families.</p>}
      </section>

      <h2>Parents</h2>
      <ul className="list card">
        {threads.map(({ parent, last, unread, kids }) => (
          <li key={parent.id}>
            <Link to={`/driver/messages/${parent.id}`} className={`list-item plain${unread ? ' unread' : ''}`}>
              <Avatar name={parent.name} size={40} />
              <div className="grow ellipsis">
                <div className="row between">
                  <strong>{parent.name}</strong>
                  {last && <span className="muted small">{relTime(last.at, now)}</span>}
                </div>
                <div className="muted small ellipsis">
                  {last ? `${last.from === 'driver' ? 'You: ' : ''}${last.text}` : `Parent of ${kids.join(', ')}`}
                </div>
              </div>
              {unread > 0 && <span className="count">{unread}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DriverThread() {
  const { parentId } = useParams();
  const { state, dispatch } = useStore();
  const parent = state.parents.find((p) => p.id === parentId);
  const thread = state.messages.filter((m) => m.parentId === parentId);
  const unread = thread.some((m) => !m.readByDriver);

  useEffect(() => {
    if (unread && parentId) dispatch({ type: 'MARK_THREAD_READ', parentId, reader: 'driver' });
  }, [unread, dispatch, parentId]);

  if (!parent) return <p className="empty">Conversation not found.</p>;
  const kids = state.students.filter((s) => s.parentId === parent.id);

  return (
    <div className="stack fill">
      <Link to="/driver/messages" className="link">
        ← Messages
      </Link>
      <div className="card row gap">
        <Avatar name={parent.name} />
        <div className="grow">
          <strong>{parent.name}</strong>
          <div className="muted small">
            Parent of{' '}
            {kids.map((k, i) => (
              <span key={k.id}>
                {i > 0 && ', '}
                <Link to={`/driver/students/${k.id}`}>{k.firstName}</Link>
              </span>
            ))}
          </div>
        </div>
        <a className="btn btn-outline" href={`tel:${parent.phone.replace(/\D/g, '')}`}>
          Call
        </a>
      </div>
      <ChatThread
        messages={thread}
        me="driver"
        onSend={(text) => dispatch({ type: 'SEND_MESSAGE', parentId: parent.id, from: 'driver', text, now: Date.now() })}
        quickReplies={['On my way!', 'Running 5 minutes late.', 'Got it, thanks!', 'Arrived at the stop.']}
      />
    </div>
  );
}
