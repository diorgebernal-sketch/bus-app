import { useEffect, useRef, useState } from 'react';
import { timeOf } from '../lib/format';
import type { Message, Role } from '../types';

export function ChatThread({
  messages,
  me,
  onSend,
  quickReplies = [],
  placeholder = 'Type a message…',
}: {
  messages: Message[];
  me: Role;
  onSend: (text: string) => void;
  quickReplies?: string[];
  placeholder?: string;
}) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = (t: string) => {
    if (!t.trim()) return;
    onSend(t);
    setText('');
  };

  return (
    <div className="chat">
      <div className="chat-log">
        {messages.length === 0 && <p className="empty">No messages yet. Say hello!</p>}
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.from === me ? 'mine' : 'theirs'}`}>
            <div>{m.text}</div>
            <div className="bubble-time">{timeOf(m.at)}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {quickReplies.length > 0 && (
        <div className="chips">
          {quickReplies.map((q) => (
            <button key={q} className="chip" onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="Message" />
        <button className="btn" type="submit" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
