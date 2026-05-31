import { IN_ADD, IN_REMOVE, OUT_UPDATED } from './1-ports.js';
import { Bus } from './2-bus.js';
import { TodoDomain } from './3-domain.js';

/** Wires domain commands onto the event bus. */
export function startAdapter(bus: Bus) {
  const domain = new TodoDomain();

  bus.on(IN_ADD, ({ text }) => {
    bus.dispatch(OUT_UPDATED, domain.add(text));
  });

  bus.on(IN_REMOVE, ({ index }) => {
    bus.dispatch(OUT_UPDATED, domain.remove(index));
  });
}
