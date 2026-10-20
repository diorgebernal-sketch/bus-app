import { Link, useParams } from 'react-router-dom';
import { Avatar, StatusBadge } from '../../components/ui';
import { useStore } from '../../store';
import { StudentActions } from './StudentActions';

export function DriverStudent() {
  const { id } = useParams();
  const { state } = useStore();
  const s = state.students.find((x) => x.id === id);
  if (!s) return <p className="empty">Student not found.</p>;
  const parent = state.parents.find((p) => p.id === s.parentId)!;
  const stop = state.route.stops.find((x) => x.id === s.stopId)!;
  const hasHealth = s.allergies !== 'None' || !!s.medicalNotes;

  return (
    <div className="stack">
      <Link to="/driver/roster" className="link">
        ← All students
      </Link>
      <section className="card">
        <div className="row gap">
          <Avatar name={`${s.firstName} ${s.lastName}`} color={s.color} size={56} />
          <div className="grow">
            <h2 className="tight">
              {s.firstName} {s.lastName}
            </h2>
            <div className="muted small">
              {s.grade} grade · {state.route.school.name}
            </div>
          </div>
        </div>
        <div className="row between mt">
          <StatusBadge status={s.status} />
          {state.trip.active && <StudentActions student={s} />}
        </div>
      </section>

      {hasHealth && (
        <section className="card alert-card">
          <div className="eyebrow">⚕️ Health & safety</div>
          {s.allergies !== 'None' && (
            <p className="tight">
              <strong>Allergies:</strong> {s.allergies}
            </p>
          )}
          {s.medicalNotes && (
            <p className="tight">
              <strong>Notes:</strong> {s.medicalNotes}
            </p>
          )}
        </section>
      )}

      <section className="card">
        <dl className="details">
          <dt>Stop</dt>
          <dd>
            {stop.name} · {stop.time}
          </dd>
          <dt>Parent / guardian</dt>
          <dd>
            {parent.name} · {parent.phone}
          </dd>
          {!hasHealth && (
            <>
              <dt>Health notes</dt>
              <dd>None on file</dd>
            </>
          )}
        </dl>
        <div className="row gap">
          <Link className="btn grow" to={`/driver/messages/${parent.id}`}>
            Message parent
          </Link>
          <a className="btn btn-outline grow" href={`tel:${parent.phone.replace(/\D/g, '')}`}>
            Call
          </a>
        </div>
      </section>

      <section className="card">
        <h3 className="tight">Emergency contacts</h3>
        <ul className="list">
          {s.emergencyContacts.map((c) => (
            <li key={c.phone} className="list-item">
              <div className="grow">
                <div>{c.name}</div>
                <div className="muted small">{c.relation}</div>
              </div>
              <a className="btn btn-sm btn-outline" href={`tel:${c.phone.replace(/\D/g, '')}`}>
                {c.phone}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
