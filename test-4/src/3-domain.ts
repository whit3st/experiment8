import { PortMap } from './1-ports.js';

/** Pure domain logic. Knows nothing about the browser or UI. */
export class TodoDomain {
  state: PortMap['port:out:todo:updated'] = { todos: [] };

  add(text: string): PortMap['port:out:todo:updated'] {
    const t = text.trim();
    if (!t) return this.state;
    this.state = { todos: [...this.state.todos, t] };
    return this.state;
  }

  remove(index: number): PortMap['port:out:todo:updated'] {
    this.state = { todos: this.state.todos.filter((_, i) => i !== index) };
    return this.state;
  }
}
