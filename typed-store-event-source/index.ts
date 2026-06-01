/** Pure function that projects state from one event. */
export type EventProjector<State, Event> = (
  state: State,
  event: Event
) => State;

/** Listener called after each appended event. */
export type EventStoreListener<State, Event> = (
  state: State,
  event: Event
) => void;

/** The event-sourced store returned by createEventStore(). */
export type EventStore<State, Event> = {
  /** Read the current projected state. */
  getState(): State;

  /** Read the full event log. */
  getEvents(): readonly Event[];

  /** Append one event to the log and project the next state. */
  append(event: Event): void;

  /** Recompute state by replaying the full event log. */
  replay(): State;

  /** Subscribe to appended events. Returns an unsubscribe function. */
  subscribe(listener: EventStoreListener<State, Event>): () => void;
};

/**
 * Create a minimal event-sourced store.
 *
 * State is derived by replaying events through a projector function.
 * The store keeps both the event log and the current projected state.
 */
export function createEventStore<State, Event>(
  projector: EventProjector<State, Event>,
  initialState: State,
  initialEvents: readonly Event[] = []
): EventStore<State, Event> {
  let events = [...initialEvents];
  let state = replayState(projector, initialState, events);
  const listeners = new Set<EventStoreListener<State, Event>>();

  return {
    getState() {
      return state;
    },

    getEvents() {
      return events;
    },

    append(event) {
      events = [...events, event];
      state = projector(state, event);

      for (const listener of listeners) {
        listener(state, event);
      }
    },

    replay() {
      state = replayState(projector, initialState, events);
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function replayState<State, Event>(
  projector: EventProjector<State, Event>,
  initialState: State,
  events: readonly Event[]
) {
  let state = initialState;

  for (const event of events) {
    state = projector(state, event);
  }

  return state;
}
