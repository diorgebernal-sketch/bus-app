import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/ui';
import { useStore } from '../store';

export function Login() {
  const { state, signIn, dispatch } = useStore();
  const navigate = useNavigate();
  const [parentId, setParentId] = useState(state.parents[0].id);
  const driver = state.drivers[0];

  return (
    <div className="login">
      <div className="login-hero">
        <div className="login-logo" aria-hidden>🚌</div>
        <h1>BusBuddy</h1>
        <p>Live school bus tracking, messaging and payments for families and drivers.</p>
      </div>

      <div className="card">
        <h2>I’m a parent</h2>
        <p className="muted">See where the bus is, get alerts, message the driver and pay fees.</p>
        <label className="field">
          <span>Account</span>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            {state.parents.map((p) => {
              const kids = state.students.filter((s) => s.parentId === p.id).map((s) => s.firstName);
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({kids.join(', ')})
                </option>
              );
            })}
          </select>
        </label>
        <button
          className="btn btn-block"
          onClick={() => {
            signIn({ role: 'parent', id: parentId });
            navigate('/parent');
          }}
        >
          Continue as parent
        </button>
      </div>

      <div className="card">
        <h2>I’m a driver</h2>
        <div className="row gap">
          <Avatar name={driver.name} color="#f5b700" />
          <div>
            <strong>{driver.name}</strong>
            <div className="muted small">
              Bus #{state.route.busNumber} · {state.route.name}
            </div>
          </div>
        </div>
        <button
          className="btn btn-dark btn-block"
          onClick={() => {
            signIn({ role: 'driver', id: driver.id });
            navigate('/driver');
          }}
        >
          Continue as driver
        </button>
      </div>

      <p className="muted small center">
        Tip: open the driver and a parent in two browser tabs. They stay in sync live.
        <br />
        <button
          className="link"
          onClick={() => {
            if (confirm('Reset all demo data?')) dispatch({ type: 'RESET' });
          }}
        >
          Reset demo data
        </button>
      </p>
    </div>
  );
}
