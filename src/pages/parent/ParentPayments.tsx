import { useState } from 'react';
import { Empty } from '../../components/ui';
import { cardBrand, expiryValid, luhnValid } from '../../lib/cards';
import { money, relTime } from '../../lib/format';
import { useNow, useStore } from '../../store';
import { useParent } from './ParentApp';

export function ParentPayments() {
  const { state, dispatch } = useStore();
  const parent = useParent();
  const now = useNow(30000);
  const invoices = state.invoices.filter((i) => i.parentId === parent.id);
  const due = invoices.filter((i) => i.status === 'due');
  const paid = invoices.filter((i) => i.status === 'paid').sort((a, b) => (b.paidAt ?? 0) - (a.paidAt ?? 0));
  const cards = state.cards.filter((c) => c.parentId === parent.id);

  const [selected, setSelected] = useState<string[]>(() => due.map((i) => i.id));
  const [cardId, setCardId] = useState<string>(cards[0]?.id ?? 'new');
  const [showAdd, setShowAdd] = useState(cards.length === 0);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const chosen = due.filter((i) => selected.includes(i.id));
  const total = chosen.reduce((s, i) => s + i.amount, 0);
  const balance = due.reduce((s, i) => s + i.amount, 0);
  // A freshly added card has an id we didn't know when selecting, so fall back to the newest one.
  const card = cards.find((c) => c.id === cardId) ?? cards[cards.length - 1];

  const pay = () => {
    if (!card || !chosen.length) return;
    dispatch({ type: 'PAY_INVOICES', invoiceIds: chosen.map((i) => i.id), paidWith: `${card.brand} •••• ${card.last4}`, now: Date.now() });
    setConfirmation(`Paid ${money(total)} with ${card.brand} •••• ${card.last4}.`);
    setSelected([]);
  };

  return (
    <div className="stack">
      <section className="card balance">
        <div className="eyebrow">Balance due</div>
        <div className="balance-amount">{money(balance)}</div>
        <label className="toggle">
          <input type="checkbox" checked={parent.autopay} onChange={(e) => dispatch({ type: 'SET_AUTOPAY', parentId: parent.id, on: e.target.checked })} />
          <span>Autopay monthly transportation fee</span>
        </label>
      </section>

      {confirmation && (
        <div className="notice success" role="status">
          ✅ {confirmation}
        </div>
      )}

      <section className="card">
        <h3 className="tight">Outstanding</h3>
        {due.length === 0 ? (
          <Empty>You’re all paid up. 🎉</Empty>
        ) : (
          <ul className="list">
            {due.map((i) => (
              <li key={i.id} className="list-item">
                <input
                  type="checkbox"
                  aria-label={`Select ${i.description}`}
                  checked={selected.includes(i.id)}
                  onChange={(e) => setSelected((s) => (e.target.checked ? [...s, i.id] : s.filter((x) => x !== i.id)))}
                />
                <div className="grow">
                  <div>{i.description}</div>
                  <div className="muted small">Due {new Date(i.dueDate + 'T12:00').toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                </div>
                <strong>{money(i.amount)}</strong>
              </li>
            ))}
          </ul>
        )}

        {due.length > 0 && (
          <>
            <h4>Pay with</h4>
            <div className="stack-sm">
              {cards.map((c) => (
                <label key={c.id} className={`pay-option${card?.id === c.id ? ' selected' : ''}`}>
                  <input type="radio" name="card" checked={card?.id === c.id} onChange={() => setCardId(c.id)} />
                  <span className="grow">
                    {c.brand} •••• {c.last4}
                  </span>
                  <span className="muted small">exp {c.exp}</span>
                </label>
              ))}
              {!showAdd && (
                <button className="link" onClick={() => setShowAdd(true)}>
                  + Add a card
                </button>
              )}
            </div>
            {showAdd && (
              <AddCard
                onCancel={cards.length ? () => setShowAdd(false) : undefined}
                onAdd={(brand, last4, exp) => {
                  dispatch({ type: 'ADD_CARD', parentId: parent.id, brand, last4, exp });
                  setCardId('new');
                  setShowAdd(false);
                }}
              />
            )}
            <button className="btn btn-block mt" disabled={!card || !chosen.length} onClick={pay}>
              {chosen.length ? `Pay ${money(total)}` : 'Select an item to pay'}
            </button>
            <p className="muted small center">Demo mode — no real charges are made.</p>
          </>
        )}
      </section>

      <section className="card">
        <h3 className="tight">Payment history</h3>
        {paid.length === 0 ? (
          <Empty>No payments yet.</Empty>
        ) : (
          <ul className="list">
            {paid.map((i) => (
              <li key={i.id} className="list-item">
                <span className="list-icon" aria-hidden>🧾</span>
                <div className="grow">
                  <div>{i.description}</div>
                  <div className="muted small">
                    {i.paidWith} · {i.paidAt ? relTime(i.paidAt, now) : ''}
                  </div>
                </div>
                <span>{money(i.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AddCard({ onAdd, onCancel }: { onAdd: (brand: string, last4: string, exp: string) => void; onCancel?: () => void }) {
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');
  const digits = number.replace(/\D/g, '');

  return (
    <form
      className="add-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!luhnValid(digits)) return setError('That card number doesn’t look right.');
        if (!expiryValid(exp)) return setError('Enter a valid expiry date (MM/YY).');
        if (!/^\d{3,4}$/.test(cvc)) return setError('Enter the 3–4 digit security code.');
        onAdd(cardBrand(digits), digits.slice(-4), exp);
      }}
    >
      <label className="field">
        <span>Card number</span>
        <input
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/[^\d ]/g, '').slice(0, 23))}
        />
      </label>
      <div className="row gap">
        <label className="field grow">
          <span>Expiry</span>
          <input
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={exp}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, '').slice(0, 4);
              setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
            }}
          />
        </label>
        <label className="field grow">
          <span>CVC</span>
          <input inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="row gap">
        <button className="btn btn-dark" type="submit">
          Save card
        </button>
        {onCancel && (
          <button className="btn btn-outline" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
