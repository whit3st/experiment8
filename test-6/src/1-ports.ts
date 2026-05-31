/** The single source of truth for every message that crosses the bus. */
export interface PortMap {
  'port:in:auth:login':  { username: string; password: string };
  'port:in:auth:logout': {};
  'port:out:auth:changed': { isAuthenticated: boolean; user: { name: string } | null; token: string | null };
}

/** Proves at compile time that the string is a valid port key. */
export function port<K extends keyof PortMap>(key: K): K { return key; }

export const AUTH_LOGIN   = port('port:in:auth:login');
export const AUTH_LOGOUT  = port('port:in:auth:logout');
export const AUTH_CHANGED = port('port:out:auth:changed');
