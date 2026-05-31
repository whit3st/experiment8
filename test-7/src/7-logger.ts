import { KANBAN_ADD, KANBAN_MOVE, KANBAN_UPDATE, KANBAN_DELETE, KANBAN_CHANGED } from './1-ports.js';
import type { Bus } from './2-bus.js';

function log(label: string, data: unknown) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] ${label}:`, JSON.stringify(data));
}

/** Console logger adapter. Non-intrusive, just observes the bus. */
export function startLogger(bus: Bus) {
  bus.on(KANBAN_ADD, (detail) => log('KANBAN_ADD', detail));
  bus.on(KANBAN_MOVE, (detail) => log('KANBAN_MOVE', detail));
  bus.on(KANBAN_UPDATE, (detail) => log('KANBAN_UPDATE', detail));
  bus.on(KANBAN_DELETE, (detail) => log('KANBAN_DELETE', detail));
  bus.on(KANBAN_CHANGED, (detail) => log('KANBAN_CHANGED', detail));
}
