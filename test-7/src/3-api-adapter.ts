import {
  KANBAN_ADD, KANBAN_MOVE, KANBAN_UPDATE, KANBAN_DELETE, KANBAN_CHANGED,
  type PortMap
} from './1-ports.js';
import type { Bus } from './2-bus.js';

/** HTTP client adapter. Talks to the JSON-file backend via REST API. */
export function startApiAdapter(bus: Bus) {
  // Boot: load initial board state
  loadBoard();

  bus.on(KANBAN_ADD, async ({ columnId, title }) => {
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, title })
    });
    await loadBoard();
  });

  bus.on(KANBAN_MOVE, async ({ cardId, targetColumnId }) => {
    await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: targetColumnId })
    });
    await loadBoard();
  });

  bus.on(KANBAN_UPDATE, async ({ cardId, title }) => {
    await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    await loadBoard();
  });

  bus.on(KANBAN_DELETE, async ({ cardId }) => {
    await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
    await loadBoard();
  });

  async function loadBoard() {
    const res = await fetch('/api/board');
    const data: PortMap['port:out:kanban:changed'] = await res.json();
    bus.dispatch(KANBAN_CHANGED, data);
  }
}
