/** The ONLY place that touches the untyped DOM EventTarget API.
 *  All 'as' assertions live here, behind a typed wall. */
export function createBus() {
    const target = new EventTarget();
    return {
        dispatch(type, detail) {
            target.dispatchEvent(new CustomEvent(type, { detail }));
        },
        on(type, handler) {
            const listener = (e) => {
                handler(e.detail);
            };
            target.addEventListener(type, listener);
            return () => target.removeEventListener(type, listener);
        }
    };
}
export const appBus = createBus();
