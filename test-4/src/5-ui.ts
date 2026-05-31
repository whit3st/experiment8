import { IN_ADD, IN_REMOVE, OUT_UPDATED } from './1-ports.js';
import { appBus } from './2-bus.js';

export class TodoApp extends HTMLElement {
  private todos: string[] = [];
  private logs: string[] = [];
  private listEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    appBus.on(OUT_UPDATED, (detail) => {
      this.log('TodosUpdated received', detail);
      this.todos = detail.todos;
      this.updateList();
    });
    this.renderStructure();
  }

  private log(label: string, data: unknown) {
    const ts = new Date().toLocaleTimeString();
    const entry = `[${ts}] ${label}: ${JSON.stringify(data)}`;
    this.logs = [...this.logs.slice(-19), entry];
    if (this.logEl) this.logEl.textContent = this.logs.join('\n');
  }

  private handleFormSubmit = (e: Event) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input')!;
    appBus.dispatch(IN_ADD, { text: input.value });
    this.log('AddTodoCmd dispatched', { text: input.value });
    input.value = '';
  };

  private handleListClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON') {
      const idx = parseInt(target.dataset.index || '0');
      appBus.dispatch(IN_REMOVE, { index: idx });
      this.log('RemoveTodoCmd dispatched', { index: idx });
    }
  };

  private renderStructure() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: system-ui, sans-serif; padding: 16px; }
        ul { list-style: none; padding: 0; }
        li { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; }
        pre { background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 12px; white-space: pre-wrap; }
        input { padding: 4px 8px; }
      </style>
      <form>
        <input placeholder="What needs to be done?">
        <button type="submit">Add</button>
      </form>
      <ul></ul>
      <hr>
      <pre></pre>
    `;
    this.listEl = this.shadowRoot.querySelector('ul');
    this.logEl = this.shadowRoot.querySelector('pre');
    this.shadowRoot.querySelector('form')?.addEventListener('submit', this.handleFormSubmit);
    this.listEl?.addEventListener('click', this.handleListClick);
  }

  private updateList() {
    if (!this.listEl) return;
    this.listEl.innerHTML = this.todos.map((t, i) => `
      <li>
        <span>${t}</span>
        <button data-index="${i}">Delete</button>
      </li>
    `).join('');
  }
}
