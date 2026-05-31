/** The single source of truth for every message that crosses the bus. */
export interface PortMap {
  'port:in:todo:add':      { text: string };
  'port:in:todo:remove':   { index: number };
  'port:out:todo:updated': { todos: string[] };
}

/** Proves at compile time that the string is a valid port key. */
export function port<K extends keyof PortMap>(key: K): K { return key; }

export const IN_ADD      = port('port:in:todo:add');
export const IN_REMOVE   = port('port:in:todo:remove');
export const OUT_UPDATED = port('port:out:todo:updated');
