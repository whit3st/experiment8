"use strict";
/** Application-wide event bus. Zero dependencies on window or DOM. */
const appBus = new EventTarget();
// ------------------------------------------------------------------
// PORTS
// ------------------------------------------------------------------
/** Inbound port: request to add a todo. */
const PORT_IN_ADD = 'port:in:todo:add';
/** Inbound port: request to remove a todo by index. */
const PORT_IN_REMOVE = 'port:in:todo:remove';
/** Outbound port: notifies that the todo list has changed. */
const PORT_OUT_UPDATED = 'port:out:todo:updated';
// ------------------------------------------------------------------
// CORE
// ------------------------------------------------------------------
/** Pure domain logic. Knows nothing about the browser or UI. */
class TodoDomain {
    constructor() {
        this.state = { todos: [] };
    }
    add(text) {
        const t = text.trim();
        if (!t)
            return this.state;
        this.state = { todos: [...this.state.todos, t] };
        return this.state;
    }
    remove(index) {
        this.state = { todos: this.state.todos.filter((_, i) => i !== index) };
        return this.state;
    }
}
// ------------------------------------------------------------------
// BUS ADAPTER
// ------------------------------------------------------------------
/** Wires domain commands onto the event bus.
 *  The ONLY place where raw CustomEvents are cast to typed details. */
function startAdapter(bus) {
    const domain = new TodoDomain();
    bus.addEventListener(PORT_IN_ADD, (e) => {
        const { text } = e.detail;
        const next = domain.add(text);
        bus.dispatchEvent(new CustomEvent(PORT_OUT_UPDATED, { detail: next }));
    });
    bus.addEventListener(PORT_IN_REMOVE, (e) => {
        const { index } = e.detail;
        const next = domain.remove(index);
        bus.dispatchEvent(new CustomEvent(PORT_OUT_UPDATED, { detail: next }));
    });
}
// ------------------------------------------------------------------
// UI ADAPTER
// ------------------------------------------------------------------
class TodoApp extends HTMLElement {
    constructor() {
        super();
        this._todos = [];
        this._logs = [];
        this._listEl = null;
        this._logEl = null;
        this._onUpdate = (e) => {
            const detail = e.detail;
            this._log('TodosUpdated received', detail);
            this._todos = detail.todos;
            this._updateList();
        };
        this._handleFormSubmit = (e) => {
            e.preventDefault();
            const form = e.target;
            const input = form.querySelector('input');
            const detail = { text: input.value };
            appBus.dispatchEvent(new CustomEvent(PORT_IN_ADD, { detail }));
            this._log('AddTodoCmd dispatched', detail);
            input.value = '';
        };
        this._handleListClick = (e) => {
            const target = e.target;
            if (target.tagName === 'BUTTON') {
                const idx = parseInt(target.dataset.index || '0');
                const detail = { index: idx };
                appBus.dispatchEvent(new CustomEvent(PORT_IN_REMOVE, { detail }));
                this._log('RemoveTodoCmd dispatched', detail);
            }
        };
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        appBus.addEventListener(PORT_OUT_UPDATED, this._onUpdate);
        this._renderStructure();
    }
    disconnectedCallback() {
        appBus.removeEventListener(PORT_OUT_UPDATED, this._onUpdate);
    }
    _log(label, data) {
        const ts = new Date().toLocaleTimeString();
        const entry = `[${ts}] ${label}: ${JSON.stringify(data)}`;
        this._logs = [...this._logs.slice(-19), entry];
        if (this._logEl)
            this._logEl.textContent = this._logs.join('\n');
    }
    _renderStructure() {
        if (!this.shadowRoot)
            return;
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
    _updateList() {
        if (!this._listEl)
            return;
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
