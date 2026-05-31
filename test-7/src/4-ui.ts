import { KANBAN_CHANGED, KANBAN_ADD, KANBAN_MOVE, KANBAN_UPDATE, KANBAN_DELETE } from './1-ports.js';
import { appBus } from './2-bus.js';
import type { Bus } from './2-bus.js';

export class KanbanApp extends HTMLElement {
  private columns: import('./1-ports.js').Column[] = [];
  private cards: import('./1-ports.js').Card[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    appBus.on(KANBAN_CHANGED, ({ columns, cards }) => {
      this.columns = columns;
      this.cards = cards;
      this.render();
    });
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        ${this.styles()}
      </style>
      <div class="board">
        ${this.columns.map(col => `
          <div class="column" data-column-id="${col.id}">
            <h2>${col.title}</h2>
            <div class="cards">
              ${this.cardsForColumn(col.id).map(card => `
                <div class="card" data-card-id="${card.id}">
                  <span class="title">${card.title}</span>
                  <div class="actions">
                    <select class="move-select">
                      <option value="">Move to...</option>
                      ${this.columns.filter(c => c.id !== col.id).map(c => `
                        <option value="${c.id}">${c.title}</option>
                      `).join('')}
                    </select>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <form class="add-form">
              <input type="text" placeholder="New card..." required>
              <button type="submit">Add</button>
            </form>
          </div>
        `).join('')}
      </div>
    `;

    this.shadowRoot.querySelectorAll('.add-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const columnId = (e.target as HTMLElement).closest('.column')?.getAttribute('data-column-id')!;
        const input = (e.target as HTMLFormElement).querySelector('input')!;
        appBus.dispatch(KANBAN_ADD, { columnId, title: input.value });
        input.value = '';
      });
    });

    this.shadowRoot.querySelectorAll('.move-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const cardId = target.closest('.card')?.getAttribute('data-card-id')!;
        if (target.value) {
          appBus.dispatch(KANBAN_MOVE, { cardId, targetColumnId: target.value });
        }
        target.value = '';
      });
    });

    this.shadowRoot.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cardId = (e.target as HTMLElement).closest('.card')?.getAttribute('data-card-id')!;
        appBus.dispatch(KANBAN_DELETE, { cardId });
      });
    });

    this.shadowRoot.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cardEl = (e.target as HTMLElement).closest('.card')!;
        const cardId = cardEl.getAttribute('data-card-id')!;
        const titleEl = cardEl.querySelector('.title')!;
        const current = titleEl.textContent!;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = current;
        titleEl.replaceWith(input);
        input.focus();

        const save = () => {
          appBus.dispatch(KANBAN_UPDATE, { cardId, title: input.value });
        };
        input.addEventListener('blur', save);
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') save();
        });
      });
    });
  }

  private cardsForColumn(columnId: string) {
    return this.cards
      .filter(c => c.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }

  private styles() {
    return `
      :host { display: block; font-family: system-ui, sans-serif; }
      .board { display: flex; gap: 1rem; overflow-x: auto; padding: 1rem; }
      .column { background: #f0f0f0; border-radius: 8px; padding: 1rem; min-width: 280px; flex-shrink: 0; }
      .column h2 { margin: 0 0 1rem; font-size: 1rem; color: #333; }
      .cards { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; min-height: 40px; }
      .card { background: white; padding: 0.75rem; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .card .title { display: block; margin-bottom: 0.5rem; }
      .card .actions { display: flex; gap: 0.25rem; align-items: center; }
      .card select { font-size: 0.75rem; padding: 2px; }
      .card button { font-size: 0.75rem; padding: 2px 6px; }
      .add-form { display: flex; gap: 0.25rem; }
      .add-form input { flex: 1; padding: 4px; font-size: 0.875rem; }
      .add-form button { padding: 4px 8px; font-size: 0.875rem; }
    `;
  }
}

customElements.define('kanban-app', KanbanApp);
