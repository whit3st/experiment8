import { LitElement, css, html } from 'lit';
import { selectBookmarkedIssues, selectSelectedComments, selectSelectedIssue, selectVisibleIssues } from '../selectors.js';
import { store } from '../store.js';
import './repo-picker.js';
import './issue-filters.js';
import './issue-list.js';
import './issue-details.js';
import './issue-comments.js';
import './bookmarks-panel.js';

export class GitHubIssuesApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, #0b1020, #111827 30%, #10151d);
      color: #ecf1f8;
      font-family: Inter, system-ui, sans-serif;
    }

    main {
      max-width: 92rem;
      margin: 0 auto;
      padding: 1.5rem;
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
    }

    .lede {
      margin-top: 0.5rem;
      color: #9fb0c8;
      line-height: 1.5;
      max-width: 62rem;
    }

    .grid {
      display: grid;
      grid-template-columns: minmax(20rem, 26rem) minmax(0, 1fr) minmax(18rem, 22rem);
      gap: 1rem;
      margin-top: 1.25rem;
      align-items: start;
    }

    .stack {
      display: grid;
      gap: 1rem;
    }

    @media (max-width: 960px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  static properties = {
    state: { attribute: false }
  };

  state = store.getState();
  private unsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = store.subscribe((state) => {
      this.state = state;
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    super.disconnectedCallback();
  }

  render() {
    const visibleIssues = selectVisibleIssues(this.state);
    const selectedIssue = selectSelectedIssue(this.state);
    const selectedComments = selectSelectedComments(this.state);
    const bookmarkedIssues = selectBookmarkedIssues(this.state);

    return html`
      <main>
        <h1>GitHub Issue Dashboard</h1>
        <div class="lede">
          A browser-native issue viewer built with <code>typed-bus</code> and <code>typed-store</code>.
          The repo picker, filters, list, details, comments, and bookmarks all stay decoupled.
        </div>
        <repo-picker
          .draftRepo=${this.state.draftRepo}
          .currentRepo=${this.state.currentRepo}
          .loading=${this.state.issues.loading}
        ></repo-picker>
        <div class="grid">
          <div class="stack">
            <issue-filters .filters=${this.state.filters}></issue-filters>
            <issue-list
              .issues=${visibleIssues}
              .selectedIssueNumber=${this.state.selectedIssueNumber}
              .bookmarks=${this.state.bookmarks}
              .loading=${this.state.issues.loading}
              .error=${this.state.issues.error}
              .lastLoadedAt=${this.state.issues.lastLoadedAt}
            ></issue-list>
          </div>
          <div class="stack">
            <issue-details
              .issue=${selectedIssue}
              .resource=${this.state.selectedIssueNumber === null
                ? null
                : this.state.issueDetailsByNumber[this.state.selectedIssueNumber] ?? null}
              .bookmarks=${this.state.bookmarks}
            ></issue-details>
            <issue-comments .resource=${selectedComments}></issue-comments>
          </div>
          <bookmarks-panel .issues=${bookmarkedIssues}></bookmarks-panel>
        </div>
      </main>
    `;
  }
}

customElements.define('github-issues-app', GitHubIssuesApp);
