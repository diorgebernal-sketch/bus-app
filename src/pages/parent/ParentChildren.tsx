import { Avatar, StatusBadge } from '../../components/ui';
import { useStore } from '../../store';
import { useParent } from './ParentApp';

export function ParentChildren() {
  const { state } = useStore();
  const parent = useParent();
  const kids = state.students.filter((s) => s.parentId === parent.id);

  return (
    <div className="stack">
      <h2>My kids</h2>
      {kids.map((k) => {
        const stop = state.route.stops.find((s) => s.id === k.stopId)!;
        return (
          <section key={k.id} className="card">
            <div className="row gap">
              <Avatar name={`${k.firstName} ${k.lastName}`} color={k.color} size={52} />
              <div className="grow">
                <h3 className="tight">
                  {k.firstName} {k.lastName}
                </h3>
                <div className="muted small">
                  {k.grade} grade · {state.route.school.name}
                </div>
              </div>
              <StatusBadge status={k.status} />
            </div>
            <dl className="details">
              <dt>Bus stop</dt>
              <dd>
                {stop.name} ({stop.time})
              </dd>
              <dt>Allergies</dt>
              <dd>{k.allergies || 'None'}</dd>
              <dt>Medical notes</dt>
              <dd>{k.medicalNotes || 'None'}</dd>
              <dt>Emergency contacts</dt>
              <dd>
                {k.emergencyContacts.map((c) => (
                  <div key={c.phone}>
                    {c.name} ({c.relation}) · {c.phone}
                  </div>
                ))}
              </dd>
            </dl>
            <p className="muted small">This information is shared with your driver. Contact the school office to update it.</p>
          </section>
        );
      })}
      <section className="card">
        <h3 className="tight">Account</h3>
        <dl className="details">
          <dt>Name</dt>
          <dd>{parent.name}</dd>
          <dt>Email</dt>
          <dd>{parent.email}</dd>
          <dt>Phone</dt>
          <dd>{parent.phone}</dd>
        </dl>
      </section>
    </div>
  );
}
