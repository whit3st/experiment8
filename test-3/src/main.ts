/** Application-wide event bus. Zero dependencies on window or DOM. */
const appBus = new EventTarget();

// ------------------------------------------------------------------
// PORTS
// ------------------------------------------------------------------

/** Inbound port: request to add a todo. */
const PORT_IN_ADD = 'port:in:todo:add' as const;
interface AddTodoDetail { text: string }

/** Inbound port: request to remove a todo by index. */
const PORT_IN_REMOVE = 'port:in:todo:remove' as const;
interface RemoveTodoDetail { index: number }

/** Outbound port: notifies that the todo list has changed. */
const PORT_OUT_UPDATED = 'port:out:todo:updated' as const;
interface TodosUpdatedDetail { todos: string[] }

// ------------------------------------------------------------------
// CORE
// ------------------------------------------------------------------

/** Pure domain logic. Knows nothing about the browser or UI. */
class TodoDomain {
  state: TodosUpdatedDetail = { todos: [] };

  add(text: string): TodosUpdatedDetail {
    const t = text.trim();
    if (!t) return this.state;
    this.state = { todos: [...this.state.todos, t] };
    return this.state;
  }

  remove(index: number): TodosUpdatedDetail {
    this.state = { todos: this.state.todos.filter((_, i) => i !== index) };
    return this.state;
  }
}

// ------------------------------------------------------------------
// BUS ADAPTER
// ------------------------------------------------------------------

/** Wires domain commands onto the event bus.
 *  The ONLY place where raw CustomEvents are cast to typed details. */
function startAdapter(bus: EventTarget) {
  const domain = new TodoDomain();

  bus.addEventListener(PORT_IN_ADD, (e: Event) => {
    const { text } = (e as CustomEvent<AddTodoDetail>).detail;
    const next = domain.add(text);
    bus.dispatchEvent(new CustomEvent(PORT_OUT_UPDATED, { detail: next }));
  });

  bus.addEventListener(PORT_IN_REMOVE, (e: Event) => {
    const { index } = (e as CustomEvent<RemoveTodoDetail>).detail;
    const next = domain.remove(index);
    bus.dispatchEvent(new CustomEvent(PORT_OUT_UPDATED, { detail: next }));
  });
}

// ------------------------------------------------------------------
// UI ADAPTER
// ------------------------------------------------------------------

class TodoApp extends HTMLElement {
  private _todos: string[] = [];
  private _logs: string[] = [];
  private _listEl: HTMLElement | null = null;
  private _logEl: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    appBus.addEventListener(PORT_OUT_UPDATED, this._onUpdate);
    this._renderStructure();
  }

  disconnectedCallback() {
    appBus.removeEventListener(PORT_OUT_UPDATED, this._onUpdate);
  }

  private _onUpdate = (e: Event) => {
    const detail = (e as CustomEvent<TodosUpdatedDetail>).detail;
    this._log('TodosUpdated received', detail);
    this._todos = detail.todos;
    this._updateList();
  };

  private _log(label: string, data: unknown) {
    const ts = new Date().toLocaleTimeString();
    const entry = `[${ts}] ${label}: ${JSON.stringify(data)}`;
    this._logs = [...this._logs.slice(-19), entry];
    if (this._logEl) this._logEl.textContent = this._logs.join('\n');
  }

  private _handleFormSubmit = (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const detail: AddTodoDetail = { text: input.value };
    appBus.dispatchEvent(new CustomEvent(PORT_IN_ADD, { detail }));
    this._log('AddTodoCmd dispatched', detail);
    input.value = '';
  };

  private _handleListClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON') {
      const idx = parseInt(target.dataset.index || '0');
      const detail: RemoveTodoDetail = { index: idx };
      appBus.dispatchEvent(new CustomEvent(PORT_IN_REMOVE, { detail }));
      this._log('RemoveTodoCmd dispatched', detail);
    }
  };

  private _renderStructure() {
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

    this._listEl = this.shadowRoot.querySelector('ul');
    this._logEl = this.shadowRoot.querySelector('pre');

    this.shadowRoot.querySelector('form')?.addEventListener('submit', this._handleFormSubmit);
    this._listEl?.addEventListener('click', this._handleListClick);
  }

  private _updateList() {
    if (!this._listEl) return;
    this._listEl.innerHTML = this._todos.map((t, i) => `
      <li>
        <span>${t}</span>
        <button data-index="${i}">Delete</button>
      </li>
    `).join('');
  }
}

// ------------------------------------------------------------------
// WIRING
// ------------------------------------------------------------------

customElements.define('todo-app', TodoApp);
startAdapter(appBus);
