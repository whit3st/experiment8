import { LitElement, html } from 'lit';
import { bus, ISSUE_SELECTED } from '../ports.js';
import type { IssueSummary } from '../types.js';
import { listStyles, panelStyles } from './shared.js';

export class BookmarksPanel extends LitElement {
  static styles = [panelStyles, listStyles];

  static properties = {
    issues: { attribute: false }
  };

  issues: IssueSummary[] = [];

  render() {
    return html`
      <section class="panel">
        <div class="panel-title">Bookmarks</div>
        ${this.issues.length === 0
          ? html`<div class="subtle">Save issues to pin them here.</div>`
          : html`
              <div class="list" style="margin-top: 0.75rem;">
                ${this.issues.map((issue) => html`
                  <button
                    class="list-item"
                    @click=${() => bus.dispatch(ISSUE_SELECTED, { issueNumber: issue.number })}
                  >
                    <div class="item-title-row">
                      <span class="issue-number">#${issue.number}</span>
                      <span>${issue.state}</span>
                    </div>
                    <div class="item-title">${issue.title}</div>
                  </button>
                `)}
              </div>
            `}
      </section>
    `;
  }
}

customElements.define('bookmarks-panel', BookmarksPanel);
