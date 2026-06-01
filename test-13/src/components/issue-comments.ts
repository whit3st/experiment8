import { LitElement, html } from 'lit';
import type { IssueComment, IssueResource } from '../types.js';
import { formatDate } from '../utils.js';
import { listStyles, markdownStyles, panelStyles } from './shared.js';

export class IssueComments extends LitElement {
  static styles = [panelStyles, markdownStyles, listStyles];

  static properties = {
    resource: { attribute: false }
  };

  resource: IssueResource<IssueComment[]> | null = null;

  render() {
    if (this.resource === null) {
      return html`<section class="panel"><div class="subtle">Comments appear after selecting an issue.</div></section>`;
    }

    return html`
      <section class="panel">
        <div class="panel-title">Comments</div>
        ${this.resource.loading ? html`<div class="subtle">Loading comments...</div>` : null}
        ${this.resource.error ? html`<div class="error">${this.resource.error}</div>` : null}
        ${!this.resource.loading && !this.resource.error && (this.resource.item?.length ?? 0) === 0
          ? html`<div class="subtle">No comments.</div>`
          : html`
              <div class="list" style="margin-top: 0.8rem;">
                ${(this.resource.item ?? []).map((comment) => html`
                  <article class="list-item static-item">
                    <div class="item-title-row">
                      <div class="item-title">${comment.author}</div>
                      <a href=${comment.htmlUrl} target="_blank" rel="noreferrer">GitHub</a>
                    </div>
                    <div class="item-meta">${formatDate(comment.createdAt)}</div>
                    <div class="body" style="margin-top: 0.75rem;">${comment.body || 'No content.'}</div>
                  </article>
                `)}
              </div>
            `}
      </section>
    `;
  }
}

customElements.define('issue-comments', IssueComments);
