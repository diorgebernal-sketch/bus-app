import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { seedState } from './data/seed';
import { reducer, type Action } from './reducer';
import type { AppState, Session } from './types';

const STORAGE_KEY = 'busbuddy:state';
const SESSION_KEY = 'busbuddy:session';

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === seedState().version) return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  return seedState();
}

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

interface StoreValue {
  state: AppState;
  dispatch: (action: Action) => void;
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

/**
 * Holds the whole app in one reducer persisted to localStorage. Other tabs pick up
 * changes through the `storage` event, so a driver tab and a parent tab stay in sync
 * the way they would against a real backend.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [session, setSession] = useState<Session | null>(loadSession);
  const lastWritten = useRef<string | null>(null);

  useEffect(() => {
    const raw = JSON.stringify(state);
    if (raw === lastWritten.current) return;
    lastWritten.current = raw;
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      /* storage full or unavailable: keep running in memory */
    }
  }, [state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue || e.newValue === lastWritten.current) return;
      try {
        lastWritten.current = e.newValue;
        dispatch({ type: 'REPLACE', state: JSON.parse(e.newValue) as AppState });
      } catch {
        /* ignore malformed writes */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = useCallback((s: Session) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const value = useMemo(() => ({ state, dispatch, session, signIn, signOut }), [state, session, signIn, signOut]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/** Re-renders every `ms` so relative times and ETAs stay fresh. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}
