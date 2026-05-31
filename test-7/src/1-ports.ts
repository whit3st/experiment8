/** The single source of truth for every message that crosses the bus. */
export interface PortMap {
  'port:in:kanban:add':      { columnId: string; title: string };
  'port:in:kanban:move':     { cardId: string; targetColumnId: string };
  'port:in:kanban:update':   { cardId: string; title: string };
  'port:in:kanban:delete':   { cardId: string };
  'port:out:kanban:changed': { columns: Column[]; cards: Card[] };
}

export interface Column {
  id: string;
  title: string;
}

export interface Card {
  id: string;
  title: string;
  columnId: string;
  order: number;
}

export function port<K extends keyof PortMap>(key: K): K { return key; }

export const KANBAN_ADD     = port('port:in:kanban:add');
export const KANBAN_MOVE    = port('port:in:kanban:move');
export const KANBAN_UPDATE  = port('port:in:kanban:update');
export const KANBAN_DELETE  = port('port:in:kanban:delete');
export const KANBAN_CHANGED = port('port:out:kanban:changed');
