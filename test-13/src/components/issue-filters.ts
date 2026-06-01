import { LitElement, html } from 'lit';
import { bus, FILTERS_SEARCH_CHANGED, FILTERS_STATE_CHANGED } from '../ports.js';
import type { Filters } from '../types.js';
import { panelStyles } from './shared.js';

export class IssueFilters extends LitElement {
  static styles = panelStyles;

  static properties = {
    filters: { attribute: false }
  };

  filters: Filters = { state: 'open', search: '' };

  render() {
    return html`
      <section class="panel">
        <div class="panel-title">Filters</div>
        <label>
          <span>Status</span>
          <select .value=${this.filters.state} @change=${this.handleStateChange}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
        </label>
        <label style="margin-top: 0.85rem; display: block;">
          <span>Search</span>
          <input
            .value=${this.filters.search}
            placeholder="Title, body, label, number"
            @input=${this.handleSearchInput}
          >
        </label>
      </section>
    `;
  }

  private handleStateChange = (event: Event) => {
    bus.dispatch(FILTERS_STATE_CHANGED, {
      state: (event.target as HTMLSelectElement).value as Filters['state']
    });
  };

  private handleSearchInput = (event: Event) => {
    bus.dispatch(FILTERS_SEARCH_CHANGED, {
      search: (event.target as HTMLInputElement).value
    });
  };
}

customElements.define('issue-filters', IssueFilters);
