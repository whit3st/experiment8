/**
 * A lightweight, deterministic, typed pub/sub bus built on native browser APIs.
 * Zero dependencies. Zero runtime overhead.
 */

/** Every application defines its own contract.
 *  Any object with string keys satisfies this. */
export type PortContract = Record<string, any>;

/** The typed bus returned by createBus(). */
export type Bus<T extends PortContract> = {
  /** Send a typed message into the bus. */
  dispatch<K extends keyof T>(type: K, detail: T[K]): void;

  /** Subscribe to a typed message. */
  on<K extends keyof T>(
    type: K,
    handler: (detail: T[K]) => void
  ): () => void;
};

/**
 * Create a new typed event bus.
 *
 * The bus is a thin, zero-dependency wrapper around the native EventTarget API.
 * All type safety lives in the generic parameter T — there is zero runtime
 * validation or overhead beyond a single `as` inside the wrapper.
 */
export function createBus<T extends PortContract>(): Bus<T> {
  const target = new EventTarget();

  return {
    dispatch(type, detail) {
      target.dispatchEvent(new CustomEvent(type as string, { detail }));
    },

    on(type, handler) {
      const listener = (e: Event) => {
        // Single runtime bridge. External API is fully typed.
        handler((e as CustomEvent).detail);
      };
      target.addEventListener(type as string, listener);
      return () => target.removeEventListener(type as string, listener);
    }
  };
}

/**
 * Create a type-safe port name factory for a given contract.
 *
 * Usage in an application:
 *
 *   interface MyPorts {
 *     'app:event:a': { foo: string };
 *     'app:event:b': { bar: number };
 *   }
 *
 *   const port = createPort<MyPorts>();
 *   const EVENT_A = port('app:event:a'); // typed as literal
 */
export function createPort<T extends Record<string, any>>() {
  return function <K extends keyof T & string>(key: K): K {
    return key;
  };
}
