import { LitElement, html } from 'lit';
import { bus, ISSUE_SELECTED } from '../ports.js';
import type { IssueSummary } from '../types.js';
import { formatDateTime } from '../utils.js';
import { listStyles, panelStyles } from './shared.js';

export class IssueList extends LitElement {
  static styles = [panelStyles, listStyles];

  static properties = {
    issues: { attribute: false },
    selectedIssueNumber: { type: Number },
    bookmarks: { attribute: false },
    loading: { type: Boolean },
    error: { type: String },
    lastLoadedAt: { type: String }
  };

  issues: IssueSummary[] = [];
  selectedIssueNumber: number | null = null;
  bookmarks: number[] = [];
  loading = false;
  error: string | null = null;
  lastLoadedAt: string | null = null;

  render() {
    return html`
      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">Issues</div>
          <div class="subtle">${this.issues.length} visible</div>
        </div>
        ${this.loading ? html`<div class="subtle">Loading issues...</div>` : null}
        ${this.error ? html`<div class="error">${this.error}</div>` : null}
        ${this.lastLoadedAt ? html`<div class="subtle">Updated ${formatDateTime(this.lastLoadedAt)}</div>` : null}
        ${!this.loading && !this.error && this.issues.length === 0
          ? html`<div class="subtle">No issues match the current filters.</div>`
          : html`
              <div class="list" style="margin-top: 0.75rem;">
                ${this.issues.map((issue) => html`
                  <button
                    class="list-item ${this.selectedIssueNumber === issue.number ? 'selected' : ''}"
                    @click=${() => bus.dispatch(ISSUE_SELECTED, { issueNumber: issue.number })}
                  >
                    <div class="item-title-row">
                      <span class="issue-number">#${issue.number}</span>
                      ${this.bookmarks.includes(issue.number) ? html`<span class="bookmark">Saved</span>` : null}
                    </div>
                    <div class="item-title">${issue.title}</div>
                    <div class="item-meta">
                      <span>${issue.state}</span>
                      <span>${issue.author}</span>
                      <span>${issue.comments} comments</span>
                    </div>
                  </button>
                `)}
              </div>
            `}
      </section>
    `;
  }
}

customElements.define('issue-list', IssueList);
