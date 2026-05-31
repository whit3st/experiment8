import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBus } from '../src/2-bus.js';
import { startApiAdapter } from '../src/3-api-adapter.js';
import { KANBAN_ADD, KANBAN_MOVE, KANBAN_UPDATE, KANBAN_DELETE, KANBAN_CHANGED } from '../src/1-ports.js';

describe('startApiAdapter', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads board on boot', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ columns: [{ id: 'todo', title: 'To Do' }], cards: [] })
    });

    const bus = createBus();
    const received: unknown[] = [];
    bus.on(KANBAN_CHANGED, (detail) => received.push(detail));

    startApiAdapter(bus);

    // Wait for async boot check
    await new Promise(r => setTimeout(r, 10));

    expect(fetchMock).toHaveBeenCalledWith('/api/board');
    expect(received).toHaveLength(1);
  });

  it('POSTs new card then reloads board', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ columns: [], cards: [] }) }) // boot
      .mockResolvedValueOnce({ json: async () => ({ id: '99', title: 'New' }) }) // POST
      .mockResolvedValueOnce({ json: async () => ({ columns: [], cards: [{ id: '99', title: 'New' }] }) }); // reload

    const bus = createBus();
    const received: unknown[] = [];
    bus.on(KANBAN_CHANGED, (detail) => received.push(detail));

    startApiAdapter(bus);
    await new Promise(r => setTimeout(r, 10)); // boot

    bus.dispatch(KANBAN_ADD, { columnId: 'todo', title: 'New' });
    await new Promise(r => setTimeout(r, 10));

    expect(fetchMock).toHaveBeenCalledWith('/api/cards', expect.objectContaining({ method: 'POST' }));
    expect(received).toHaveLength(2); // boot + reload
  });

  it('PATCHes moved card then reloads', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ columns: [], cards: [] }) }) // boot
      .mockResolvedValueOnce({ json: async () => ({ id: '1', title: 'Task', columnId: 'done' }) }) // PATCH
      .mockResolvedValueOnce({ json: async () => ({ columns: [], cards: [{ id: '1', title: 'Task', columnId: 'done' }] }) }); // reload

    const bus = createBus();
    const received: unknown[] = [];
    bus.on(KANBAN_CHANGED, (detail) => received.push(detail));

    startApiAdapter(bus);
    await new Promise(r => setTimeout(r, 10));

    bus.dispatch(KANBAN_MOVE, { cardId: '1', targetColumnId: 'done' });
    await new Promise(r => setTimeout(r, 10));

    expect(fetchMock).toHaveBeenCalledWith('/api/cards/1', expect.objectContaining({ method: 'PATCH' }));
    expect(received).toHaveLength(2);
  });

  it('DELETEs card then reloads', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ columns: [], cards: [{ id: '1' }] }) }) // boot
      .mockResolvedValueOnce({ json: async () => ({ success: true }) }) // DELETE
      .mockResolvedValueOnce({ json: async () => ({ columns: [], cards: [] }) }); // reload

    const bus = createBus();
    const received: unknown[] = [];
    bus.on(KANBAN_CHANGED, (detail) => received.push(detail));

    startApiAdapter(bus);
    await new Promise(r => setTimeout(r, 10));

    bus.dispatch(KANBAN_DELETE, { cardId: '1' });
    await new Promise(r => setTimeout(r, 10));

    expect(fetchMock).toHaveBeenCalledWith('/api/cards/1', expect.objectContaining({ method: 'DELETE' }));
    expect(received).toHaveLength(2);
  });
});
