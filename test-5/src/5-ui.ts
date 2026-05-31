import { LitElement, html } from 'lit';
import { IN_ADD, IN_REMOVE, OUT_UPDATED } from './1-ports.js';
import { appBus } from './2-bus.js';

export class TodoApp extends LitElement {
  static properties = {
    todos: { type: Array },
    logs: { type: Array }
  };

  todos: string[] = [];
  logs: string[] = [];

  connectedCallback() {
    super.connectedCallback();
    appBus.on(OUT_UPDATED, (detail) => {
      this.log('TodosUpdated received', detail);
      this.todos = detail.todos;
    });
  }

  private log(label: string, data: unknown) {
    const ts = new Date().toLocaleTimeString();
    const entry = `[${ts}] ${label}: ${JSON.stringify(data)}`;
    this.logs = [...this.logs.slice(-19), entry];
  }

  private handleAdd(e: Event) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input')!;
    appBus.dispatch(IN_ADD, { text: input.value });
    this.log('AddTodoCmd dispatched', { text: input.value });
    input.value = '';
  }

  private handleDelete(index: number) {
    appBus.dispatch(IN_REMOVE, { index });
    this.log('RemoveTodoCmd dispatched', { index });
  }

  render() {
    return html`
      <style>
        :host { display: block; font-family: system-ui, sans-serif; padding: 16px; }
        ul { list-style: none; padding: 0; }
        li { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; }
        pre { background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 12px; white-space: pre-wrap; }
        input { padding: 4px 8px; }
      </style>
      <form @submit=${this.handleAdd}>
        <input placeholder="What needs to be done?">
        <button type="submit">Add</button>
      </form>
      <ul>
        ${this.todos.map((t, i) => html`
          <li>
            <span>${t}</span>
            <button @click=${() => this.handleDelete(i)}>Delete</button>
          </li>
        `)}
      </ul>
      <hr>
      <pre>${this.logs.join('\n')}</pre>
    `;
  }
}
