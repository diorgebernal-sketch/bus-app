import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, StatusBadge } from '../../components/ui';
import { useStore } from '../../store';
import { StudentActions } from './StudentActions';

export function DriverRoster() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const counts = state.students.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }), {});

  return (
    <div className="stack">
      <h2>Students</h2>
      <div className="stats card">
        <div>
          <strong>{state.students.length}</strong>
          <span>assigned</span>
        </div>
        <div>
          <strong>{counts.on_bus ?? 0}</strong>
          <span>on board</span>
        </div>
        <div>
          <strong>{counts.absent ?? 0}</strong>
          <span>absent</span>
        </div>
      </div>
      <input className="search" placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
      {state.route.stops.map((stop) => {
        const students = state.students.filter(
          (s) => s.stopId === stop.id && (!query || `${s.firstName} ${s.lastName}`.toLowerCase().includes(query)),
        );
        if (!students.length) return null;
        return (
          <section key={stop.id} className="card">
            <div className="row between">
              <h3 className="tight">{stop.name}</h3>
              <span className="muted small">{stop.time}</span>
            </div>
            <ul className="list">
              {students.map((s) => (
                <li key={s.id} className="list-item">
                  <Avatar name={`${s.firstName} ${s.lastName}`} color={s.color} size={36} />
                  <Link to={`/driver/students/${s.id}`} className="grow plain">
                    <div>
                      {s.firstName} {s.lastName} {(s.allergies !== 'None' || s.medicalNotes) && <span title="Health notes">⚕️</span>}
                    </div>
                    <StatusBadge status={s.status} />
                  </Link>
                  {state.trip.active && <StudentActions student={s} />}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
