import { describe, expect, it } from 'vitest';
import {
  createEventStore,
  type EventProjector
} from '../index.js';

type CounterEvent =
  | { type: 'counter/incremented'; amount: number }
  | { type: 'counter/reset' };

const projector: EventProjector<{ count: number }, CounterEvent> = (state, event) => {
  switch (event.type) {
    case 'counter/incremented':
      return { count: state.count + event.amount };
    case 'counter/reset':
      return { count: 0 };
    default:
      return state;
  }
};

describe('createEventStore', () => {
  it('projects initial state from initial events', () => {
    const store = createEventStore(projector, { count: 0 }, [
      { type: 'counter/incremented', amount: 2 },
      { type: 'counter/incremented', amount: 3 }
    ]);

    expect(store.getState()).toEqual({ count: 5 });
  });

  it('appends events and updates state', () => {
    const store = createEventStore(projector, { count: 0 });

    store.append({ type: 'counter/incremented', amount: 4 });
    store.append({ type: 'counter/incremented', amount: 1 });

    expect(store.getState()).toEqual({ count: 5 });
    expect(store.getEvents()).toEqual([
      { type: 'counter/incremented', amount: 4 },
      { type: 'counter/incremented', amount: 1 }
    ]);
  });

  it('replays the full event log', () => {
    const store = createEventStore(projector, { count: 0 });

    store.append({ type: 'counter/incremented', amount: 2 });
    store.append({ type: 'counter/reset' });
    store.append({ type: 'counter/incremented', amount: 7 });

    expect(store.replay()).toEqual({ count: 7 });
    expect(store.getState()).toEqual({ count: 7 });
  });

  it('notifies subscribers with projected state and appended event', () => {
    const store = createEventStore(projector, { count: 0 });
    const seen: Array<{ state: { count: number }; event: CounterEvent }> = [];

    store.subscribe((state, event) => {
      seen.push({ state, event });
    });

    store.append({ type: 'counter/incremented', amount: 3 });
    store.append({ type: 'counter/reset' });

    expect(seen).toEqual([
      {
        state: { count: 3 },
        event: { type: 'counter/incremented', amount: 3 }
      },
      {
        state: { count: 0 },
        event: { type: 'counter/reset' }
      }
    ]);
  });

  it('unsubscribe stops notifications', () => {
    const store = createEventStore(projector, { count: 0 });
    const seen: number[] = [];

    const unsubscribe = store.subscribe((state) => {
      seen.push(state.count);
    });

    store.append({ type: 'counter/incremented', amount: 1 });
    unsubscribe();
    store.append({ type: 'counter/incremented', amount: 1 });

    expect(seen).toEqual([1]);
  });
});
