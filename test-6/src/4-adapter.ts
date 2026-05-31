import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHANGED } from './1-ports.js';
import type { Bus } from './2-bus.js';

/** HTTP client adapter. Talks to the cookie-based API server.
 *  On boot it checks /api/me to restore an existing session. */
export function startAdapter(bus: Bus) {
  // Boot: check if there's an existing session (cookie)
  checkSession();

  bus.on(AUTH_LOGIN, async ({ username, password }) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        bus.dispatch(AUTH_CHANGED, { isAuthenticated: false, user: null, token: null });
        return;
      }

      const data = await res.json();
      bus.dispatch(AUTH_CHANGED, {
        isAuthenticated: true,
        user: data.user,
        token: data.token
      });
    } catch {
      bus.dispatch(AUTH_CHANGED, { isAuthenticated: false, user: null, token: null });
    }
  });

  bus.on(AUTH_LOGOUT, async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    bus.dispatch(AUTH_CHANGED, { isAuthenticated: false, user: null, token: null });
  });

  async function checkSession() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (!res.ok) {
        bus.dispatch(AUTH_CHANGED, { isAuthenticated: false, user: null, token: null });
        return;
      }
      const data = await res.json();
      bus.dispatch(AUTH_CHANGED, {
        isAuthenticated: true,
        user: data.user,
        token: data.token
      });
    } catch {
      bus.dispatch(AUTH_CHANGED, { isAuthenticated: false, user: null, token: null });
    }
  }
}
