/** Proves at compile time that the string is a valid port key. */
export function port(key) { return key; }
export const IN_ADD = port('port:in:todo:add');
export const IN_REMOVE = port('port:in:todo:remove');
export const OUT_UPDATED = port('port:out:todo:updated');
