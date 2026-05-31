import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBus } from '../src/2-bus.js';
import { startLogger } from '../src/7-logger.js';
import { KANBAN_ADD, KANBAN_CHANGED } from '../src/1-ports.js';

describe('startLogger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs KANBAN_ADD events', () => {
    const bus = createBus();
    startLogger(bus);

    bus.dispatch(KANBAN_ADD, { columnId: 'todo', title: 'Test card' });

    expect(consoleSpy).toHaveBeenCalledOnce();
    const call = consoleSpy.mock.calls[0] as string[];
    expect(call[0]).toMatch(/\[.+\] KANBAN_ADD:/);
    expect(call[1]).toBe('{"columnId":"todo","title":"Test card"}');
  });

  it('logs KANBAN_CHANGED events', () => {
    const bus = createBus();
    startLogger(bus);

    bus.dispatch(KANBAN_CHANGED, { columns: [], cards: [] });

    expect(consoleSpy).toHaveBeenCalledOnce();
    const call = consoleSpy.mock.calls[0] as string[];
    expect(call[0]).toMatch(/\[.+\] KANBAN_CHANGED:/);
    expect(call[1]).toBe('{"columns":[],"cards":[]}');
  });
});
