import type { PortMap } from './1-ports.js';

/** The ONLY place that touches the untyped DOM EventTarget API.
 *  All 'as' assertions live here, behind a typed wall. */
export function createBus() {
  const target = new EventTarget();

  return {
    dispatch<K extends keyof PortMap>(type: K, detail: PortMap[K]): void {
      target.dispatchEvent(new CustomEvent(type, { detail }));
    },

    on<K extends keyof PortMap>(
      type: K,
      handler: (detail: PortMap[K]) => void
    ): () => void {
      const listener = (e: Event) => {
        handler((e as CustomEvent<PortMap[K]>).detail);
      };
      target.addEventListener(type, listener);
      return () => target.removeEventListener(type, listener);
    }
  };
}

export const appBus = createBus();
export type Bus = ReturnType<typeof createBus>;
