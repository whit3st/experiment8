import { LitElement, html } from 'lit';
import { REPO_APPLY_REQUESTED, REPO_NAME_INPUT, REPO_OWNER_INPUT, bus } from '../ports.js';
import { DEFAULT_REPO, type RepoRef } from '../types.js';
import { panelStyles } from './shared.js';

export class RepoPicker extends LitElement {
  static styles = panelStyles;

  static properties = {
    draftRepo: { attribute: false },
    currentRepo: { attribute: false },
    loading: { type: Boolean }
  };

  draftRepo: RepoRef = DEFAULT_REPO;
  currentRepo: RepoRef = DEFAULT_REPO;
  loading = false;

  render() {
    return html`
      <section class="panel">
        <div class="panel-title">Repository</div>
        <div class="subtle">Read-only GitHub API view. Public rate limits apply.</div>
        <div class="field-row" style="margin-top: 0.9rem;">
          <label>
            <span>Owner</span>
            <input .value=${this.draftRepo.owner} @input=${this.handleOwnerInput}>
          </label>
          <label>
            <span>Name</span>
            <input .value=${this.draftRepo.name} @input=${this.handleNameInput}>
          </label>
          <button class="primary" ?disabled=${this.loading} @click=${this.handleApply}>Load</button>
        </div>
        <div class="subtle" style="margin-top: 0.75rem;">
          Current: <code>${this.currentRepo.owner}/${this.currentRepo.name}</code>
        </div>
      </section>
    `;
  }

  private handleOwnerInput = (event: Event) => {
    bus.dispatch(REPO_OWNER_INPUT, {
      owner: (event.target as HTMLInputElement).value
    });
  };

  private handleNameInput = (event: Event) => {
    bus.dispatch(REPO_NAME_INPUT, {
      name: (event.target as HTMLInputElement).value
    });
  };

  private handleApply = () => {
    bus.dispatch(REPO_APPLY_REQUESTED, undefined);
  };
}

customElements.define('repo-picker', RepoPicker);
