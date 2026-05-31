import { AUTH_CHANGED } from './1-ports.js';
import type { Bus } from './2-bus.js';

type Route = 'home' | 'login' | 'dashboard';

const ROUTES: Record<Route, () => string> = {
  home: () => 'Home',
  login: () => 'Login',
  dashboard: () => 'Dashboard'
};

/** Hash-based router that guards routes based on auth state. */
export function startRouter(bus: Bus, mount: HTMLElement) {
  let currentRoute: Route = 'home';
  let isAuthenticated = false;

  const navigate = (route: Route) => {
    currentRoute = route;
    window.location.hash = route === 'home' ? '' : `#/${route}`;
    render();
  };

  const render = () => {
    // Guard: redirect unauthenticated users away from dashboard
    if (currentRoute === 'dashboard' && !isAuthenticated) {
      navigate('login');
      return;
    }
    // Guard: redirect authenticated users away from login
    if (currentRoute === 'login' && isAuthenticated) {
      navigate('dashboard');
      return;
    }

    mount.innerHTML = '';
    const page = createPage(currentRoute, bus, navigate);
    mount.appendChild(page);
  };

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(2) as Route;
    currentRoute = ROUTES[hash] ? hash : 'home';
    render();
  });

  // React to auth state changes
  bus.on(AUTH_CHANGED, ({ isAuthenticated: auth }) => {
    isAuthenticated = auth;
    render();
  });

  // Initial render
  const initialHash = window.location.hash.slice(2) as Route;
  currentRoute = ROUTES[initialHash] ? initialHash : 'home';
  render();
}

function createPage(route: Route, bus: Bus, _navigate: (r: Route) => void): HTMLElement {
  const el = document.createElement('div');
  el.className = 'page';

  switch (route) {
    case 'home':
      el.innerHTML = `
        <h1>Welcome</h1>
        <p>This is a public page. Anyone can see it.</p>
        <a href="#/login">Go to Login</a>
      `;
      break;

    case 'login':
      el.innerHTML = `
        <h1>Login</h1>
        <form id="login-form">
          <input type="text" name="username" placeholder="Username" required>
          <input type="password" name="password" placeholder="Password (try 'secret')" required>
          <button type="submit">Login</button>
        </form>
        <p><a href="#/">Back to Home</a></p>
      `;
      el.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const fd = new FormData(form);
        bus.dispatch('port:in:auth:login', {
          username: fd.get('username') as string,
          password: fd.get('password') as string
        });
      });
      break;

    case 'dashboard':
      el.innerHTML = `
        <h1>Dashboard</h1>
        <p>Welcome, <span id="user-name"></span>! This page is guarded.</p>
        <button id="logout">Logout</button>
      `;
      // Listen for auth changes to update the username
      const unsub = bus.on(AUTH_CHANGED, ({ user }) => {
        const nameEl = el.querySelector('#user-name');
        if (nameEl) nameEl.textContent = user?.name ?? 'Guest';
      });
      // Clean up listener when page is removed (simple heuristic)
      const observer = new MutationObserver(() => {
        if (!document.contains(el)) {
          unsub();
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      el.querySelector('#logout')?.addEventListener('click', () => {
        bus.dispatch('port:in:auth:logout', {});
      });
      break;
  }

  return el;
}
