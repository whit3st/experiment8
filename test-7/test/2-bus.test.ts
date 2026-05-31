import { describe, it, expect } from 'vitest';
import { createBus } from '../src/2-bus.js';
import { KANBAN_ADD, KANBAN_CHANGED } from '../src/1-ports.js';

describe('createBus', () => {
  it('dispatches and receives events', () => {
    const bus = createBus();
    const received: unknown[] = [];

    bus.on(KANBAN_ADD, (detail) => {
      received.push(detail);
    });

    bus.dispatch(KANBAN_ADD, { columnId: 'todo', title: 'Test' });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ columnId: 'todo', title: 'Test' });
  });

  it('supports multiple listeners', () => {
    const bus = createBus();
    const logs: string[] = [];

    bus.on(KANBAN_ADD, () => logs.push('a'));
    bus.on(KANBAN_ADD, () => logs.push('b'));

    bus.dispatch(KANBAN_ADD, { columnId: 'todo', title: 'X' });

    expect(logs).toEqual(['a', 'b']);
  });

  it('unsubscribe stops receiving', () => {
    const bus = createBus();
    const received: unknown[] = [];

    const unsub = bus.on(KANBAN_ADD, (detail) => {
      received.push(detail);
    });

    bus.dispatch(KANBAN_ADD, { columnId: 'todo', title: 'First' });
    unsub();
    bus.dispatch(KANBAN_ADD, { columnId: 'todo', title: 'Second' });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ columnId: 'todo', title: 'First' });
  });

  it('does not leak events across different port types', () => {
    const bus = createBus();
    let addCalled = false;
    let changedCalled = false;

    bus.on(KANBAN_ADD, () => { addCalled = true; });
    bus.on(KANBAN_CHANGED, () => { changedCalled = true; });

    bus.dispatch(KANBAN_ADD, { columnId: 'todo', title: 'Test' });

    expect(addCalled).toBe(true);
    expect(changedCalled).toBe(false);
  });
});
