import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BusMap } from '../../components/BusMap';
import { Avatar, StatusBadge } from '../../components/ui';
import { nextStop } from '../../lib/eta';
import { tripPath } from '../../lib/geo';
import { relTime } from '../../lib/format';
import { useNow, useStore } from '../../store';
import type { Direction } from '../../types';
import { StudentActions } from './StudentActions';

export function DriverRoute() {
  const { state, dispatch } = useStore();
  const now = useNow();
  const { trip, route } = state;
  const [direction, setDirection] = useState<Direction>(new Date().getHours() < 11 ? 'morning' : 'afternoon');
  const path = tripPath(route, trip.direction);

  // While stopped somewhere, focus on that stop; otherwise the next one coming up.
  const focusId = trip.atStopId ?? nextStop(state)?.id ?? null;
  const focus = path.stops.find((s) => s.id === focusId);
  const focusStudents = focus ? state.students.filter((s) => s.stopId === focus.id) : [];
  const onBoard = state.students.filter((s) => s.status === 'on_bus').length;
  const pct = Math.round((trip.progress / path.total) * 100);

  return (
    <div className="stack">
      <section className="card">
        <div className="row between">
          <div>
            <div className="eyebrow">{route.name}</div>
            <h2 className="tight">
              {trip.active ? (trip.direction === 'morning' ? 'Morning pickup' : 'Afternoon drop-off') : 'Ready to roll'}
            </h2>
          </div>
          <span className={`live ${trip.active ? (trip.paused ? 'paused' : 'on') : 'off'}`}>
            {trip.active ? (trip.paused ? 'Paused' : 'Sharing location') : 'Off duty'}
          </span>
        </div>
        <BusMap state={state} height={240} />

        {trip.active ? (
          <>
            <div className="progress" aria-label="Route progress">
              <div style={{ width: `${pct}%` }} />
            </div>
            <div className="stats">
              <div>
                <strong>{onBoard}</strong>
                <span>on board</span>
              </div>
              <div>
                <strong>{pct}%</strong>
                <span>route done</span>
              </div>
              <div>
                <strong>{relTime(trip.startedAt, now).replace(' ago', '')}</strong>
                <span>elapsed</span>
              </div>
            </div>
            <div className="row gap">
              <button className="btn btn-outline grow" onClick={() => dispatch({ type: 'PAUSE_TRIP', paused: !trip.paused, now: Date.now() })}>
                {trip.paused ? 'Resume' : 'Pause'}
              </button>
              <button
                className="btn btn-danger grow"
                onClick={() => {
                  if (confirm('End this trip now?')) dispatch({ type: 'END_TRIP', now: Date.now() });
                }}
              >
                End trip
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="segmented" role="radiogroup" aria-label="Trip type">
              {(['morning', 'afternoon'] as const).map((d) => (
                <button key={d} role="radio" aria-checked={direction === d} className={direction === d ? 'on' : ''} onClick={() => setDirection(d)}>
                  {d === 'morning' ? '🌅 Morning pickup' : '🌇 Afternoon drop-off'}
                </button>
              ))}
            </div>
            <button className="btn btn-block" onClick={() => dispatch({ type: 'START_TRIP', direction, now: Date.now() })}>
              Start trip
            </button>
            {trip.completedAt && <p className="muted small center">Last trip finished {relTime(trip.completedAt, now)}.</p>}
          </>
        )}
      </section>

      {trip.active && focus && (
        <section className="card">
          <div className="eyebrow">{trip.atStopId ? 'Stopped at' : 'Next stop'}</div>
          <h3 className="tight">{focus.name}</h3>
          {focus.id === 'school' ? (
            <p className="muted">
              {trip.direction === 'morning' ? `${onBoard} student(s) will be checked in at school on arrival.` : 'Departing school.'}
            </p>
          ) : focusStudents.length === 0 ? (
            <p className="muted">No students at this stop.</p>
          ) : (
            <ul className="list">
              {focusStudents.map((s) => (
                <li key={s.id} className="list-item">
                  <Avatar name={`${s.firstName} ${s.lastName}`} color={s.color} size={36} />
                  <Link to={`/driver/students/${s.id}`} className="grow plain">
                    <div>
                      {s.firstName} {s.lastName}
                    </div>
                    <StatusBadge status={s.status} />
                  </Link>
                  <StudentActions student={s} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="card">
        <h3 className="tight">Stops</h3>
        <ol className="timeline">
          {path.stops.map((s) => {
            const done = trip.active && s.distance < trip.progress;
            const here = trip.atStopId === s.id;
            const riders = state.students.filter((st) => st.stopId === s.id);
            const sched = s.id === 'school' ? route.school.time : route.stops.find((r) => r.id === s.id)?.time;
            return (
              <li key={s.id} className={`${done ? 'done' : ''}${here ? ' here' : ''}`}>
                <div className="row between">
                  <strong>{s.name}</strong>
                  <span className="muted small">{sched}</span>
                </div>
                {riders.length > 0 && (
                  <div className="muted small">
                    {riders.map((r) => `${r.firstName}${r.status === 'absent' ? ' (absent)' : ''}`).join(', ')}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
