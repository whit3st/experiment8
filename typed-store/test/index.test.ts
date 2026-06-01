import { describe, expect, it } from 'vitest';
import { createStore, type Reducer } from '../index.js';

type CounterAction =
  | { type: 'increment'; amount: number }
  | { type: 'reset' };

const reducer: Reducer<{ count: number }, CounterAction> = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.amount };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
};

describe('createStore', () => {
  it('returns the initial state', () => {
    const store = createStore(reducer, { count: 1 });

    expect(store.getState()).toEqual({ count: 1 });
  });

  it('updates state through the reducer', () => {
    const store = createStore(reducer, { count: 0 });

    store.dispatch({ type: 'increment', amount: 2 });
    store.dispatch({ type: 'increment', amount: 3 });

    expect(store.getState()).toEqual({ count: 5 });
  });

  it('notifies subscribers with the latest state and action', () => {
    const store = createStore(reducer, { count: 0 });
    const seen: Array<{ state: { count: number }; action: CounterAction }> = [];

    store.subscribe((state, action) => {
      seen.push({ state, action });
    });

    store.dispatch({ type: 'increment', amount: 4 });
    store.dispatch({ type: 'reset' });

    expect(seen).toEqual([
      {
        state: { count: 4 },
        action: { type: 'increment', amount: 4 }
      },
      {
        state: { count: 0 },
        action: { type: 'reset' }
      }
    ]);
  });

  it('unsubscribe stops notifications', () => {
    const store = createStore(reducer, { count: 0 });
    const seen: number[] = [];

    const unsubscribe = store.subscribe((state) => {
      seen.push(state.count);
    });

    store.dispatch({ type: 'increment', amount: 1 });
    unsubscribe();
    store.dispatch({ type: 'increment', amount: 1 });

    expect(seen).toEqual([1]);
  });

  it('keeps store instances isolated', () => {
    const storeA = createStore(reducer, { count: 0 });
    const storeB = createStore(reducer, { count: 10 });

    storeA.dispatch({ type: 'increment', amount: 2 });
    storeB.dispatch({ type: 'increment', amount: 5 });

    expect(storeA.getState()).toEqual({ count: 2 });
    expect(storeB.getState()).toEqual({ count: 15 });
  });
});
