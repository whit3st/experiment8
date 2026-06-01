/** A typed reducer function for a store. */
export type Reducer<State, Action> = (
  state: State,
  action: Action
) => State;

/** Listener called after each dispatch with the latest state and action. */
export type StoreListener<State, Action> = (
  state: State,
  action: Action
) => void;

/** The typed store returned by createStore(). */
export type Store<State, Action> = {
  /** Read the current state snapshot. */
  getState(): State;

  /** Apply an action through the reducer. */
  dispatch(action: Action): void;

  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe(listener: StoreListener<State, Action>): () => void;
};

/**
 * Create a minimal typed reducer store.
 *
 * The store holds the current state, runs all updates through one reducer,
 * and notifies subscribers after each dispatch.
 */
export function createStore<State, Action>(
  reducer: Reducer<State, Action>,
  initialState: State
): Store<State, Action> {
  let state = initialState;
  const listeners = new Set<StoreListener<State, Action>>();

  return {
    getState() {
      return state;
    },

    dispatch(action) {
      state = reducer(state, action);

      for (const listener of listeners) {
        listener(state, action);
      }
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
