import { LitElement, html } from 'lit';
import { BOOKMARK_TOGGLED, bus } from '../ports.js';
import type { IssueResource, IssueSummary } from '../types.js';
import { formatDate } from '../utils.js';
import { markdownStyles, panelStyles } from './shared.js';

export class IssueDetails extends LitElement {
  static styles = [panelStyles, markdownStyles];

  static properties = {
    issue: { attribute: false },
    resource: { attribute: false },
    bookmarks: { attribute: false }
  };

  issue: IssueSummary | null = null;
  resource: IssueResource<IssueSummary> | null = null;
  bookmarks: number[] = [];

  render() {
    if (this.issue === null && this.resource?.loading) {
      return html`<section class="panel"><div class="subtle">Loading issue...</div></section>`;
    }

    if (this.issue === null) {
      return html`<section class="panel"><div class="subtle">Select an issue to view details.</div></section>`;
    }

    const saved = this.bookmarks.includes(this.issue.number);

    return html`
      <section class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">#${this.issue.number} ${this.issue.title}</div>
            <div class="subtle">Opened by ${this.issue.author} on ${formatDate(this.issue.createdAt)}</div>
          </div>
          <button class="secondary" @click=${this.handleBookmarkClick}>
            ${saved ? 'Remove bookmark' : 'Save bookmark'}
          </button>
        </div>
        <div class="labels" style="margin-top: 0.8rem;">
          ${this.issue.labels.length === 0
            ? html`<span class="subtle">No labels</span>`
            : this.issue.labels.map((label) => html`<span class="label">${label}</span>`)}
        </div>
        <div class="body" style="margin-top: 1rem;">${this.issue.body || 'No description.'}</div>
        <div class="subtle" style="margin-top: 1rem;">
          <a href=${this.issue.htmlUrl} target="_blank" rel="noreferrer">Open on GitHub</a>
        </div>
        ${this.resource?.error ? html`<div class="error" style="margin-top: 0.75rem;">${this.resource.error}</div>` : null}
      </section>
    `;
  }

  private handleBookmarkClick = () => {
    if (this.issue === null) {
      return;
    }

    bus.dispatch(BOOKMARK_TOGGLED, {
      issueNumber: this.issue.number
    });
  };
}

customElements.define('issue-details', IssueDetails);
