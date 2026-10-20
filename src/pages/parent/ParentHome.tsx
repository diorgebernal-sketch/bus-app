import { Link } from 'react-router-dom';
import { BusMap } from '../../components/BusMap';
import { Avatar, StatusBadge } from '../../components/ui';
import { etaToStop, nextStop } from '../../lib/eta';
import { duration, relTime } from '../../lib/format';
import { useNow, useStore } from '../../store';
import { useParent } from './ParentApp';

export function ParentHome() {
  const { state, dispatch } = useStore();
  const parent = useParent();
  const now = useNow();
  const kids = state.students.filter((s) => s.parentId === parent.id);
  const { trip, route } = state;
  const driver = state.drivers.find((d) => d.id === route.driverId)!;
  const upcoming = trip.active ? nextStop(state) : null;
  const latest = state.announcements[0];

  return (
    <div className="stack">
      <section className="card trip-card">
        <div className="row between">
          <div>
            <div className="eyebrow">Bus #{route.busNumber}</div>
            <h2 className="tight">{route.name}</h2>
          </div>
          <span className={`live ${trip.active ? (trip.paused ? 'paused' : 'on') : 'off'}`}>
            {trip.active ? (trip.paused ? 'Paused' : 'Live') : 'Not running'}
          </span>
        </div>
        <BusMap state={state} highlightStopIds={kids.map((k) => k.stopId)} />
        <p className="muted small">
          {trip.active
            ? trip.atStopId
              ? `Stopped at ${trip.atStopId === 'school' ? route.school.name : route.stops.find((s) => s.id === trip.atStopId)?.name}`
              : upcoming
                ? `Heading to ${upcoming.name}`
                : 'Finishing route'
            : trip.completedAt
              ? `Last trip finished ${relTime(trip.completedAt, now)}.`
              : 'The bus hasn’t started its route yet.'}
        </p>
      </section>

      {latest && (
        <section className="card announcement">
          <div className="eyebrow">📣 From the driver · {relTime(latest.at, now)}</div>
          <p className="tight">{latest.text}</p>
        </section>
      )}

      {kids.map((kid) => {
        const stop = route.stops.find((s) => s.id === kid.stopId)!;
        const eta = kid.status !== 'absent' ? etaToStop(state, kid.stopId, now) : null;
        const showEta = eta !== null && (trip.direction === 'morning' ? kid.status === 'waiting' : kid.status === 'on_bus');
        return (
          <section key={kid.id} className="card">
            <div className="row gap">
              <Avatar name={`${kid.firstName} ${kid.lastName}`} color={kid.color} />
              <div className="grow">
                <strong>{kid.firstName}</strong>
                <div className="muted small">
                  {stop.name} · pickup {stop.time}
                </div>
              </div>
              <StatusBadge status={kid.status} />
            </div>
            {showEta && (
              <div className="eta">
                <span>{trip.direction === 'morning' ? 'Pickup in' : 'Drop-off in'}</span>
                <strong>{eta === 0 ? 'Now' : duration(eta)}</strong>
              </div>
            )}
            <div className="row gap wrap mt">
              {kid.status === 'absent' ? (
                <button className="btn btn-outline" onClick={() => dispatch({ type: 'REPORT_ABSENCE', studentId: kid.id, absent: false, now: Date.now() })}>
                  {kid.firstName} is riding today
                </button>
              ) : (
                (kid.status === 'waiting' || kid.status === 'at_school') && (
                  <button className="btn btn-outline" onClick={() => dispatch({ type: 'REPORT_ABSENCE', studentId: kid.id, absent: true, now: Date.now() })}>
                    Not riding today
                  </button>
                )
              )}
              <Link className="btn btn-outline" to="/parent/messages">
                Message {driver.name.split(' ')[0]}
              </Link>
            </div>
          </section>
        );
      })}

      <section className="card row gap">
        <Avatar name={driver.name} color="#f5b700" />
        <div className="grow">
          <strong>{driver.name}</strong>
          <div className="muted small">Your driver · {driver.phone}</div>
        </div>
        <a className="btn btn-outline" href={`tel:${driver.phone.replace(/\D/g, '')}`}>
          Call
        </a>
      </section>
    </div>
  );
}
