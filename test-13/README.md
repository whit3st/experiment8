# test-13

A read-only GitHub issue dashboard for `epistola-app/epistola-suite` built with:

- `typed-bus`
- `typed-store`
- Lit
- Vite
- TypeScript

## What It Does

The app loads GitHub issues for a repository and lets the user:

- change the owner/repo
- filter issues by `open`, `closed`, or `all`
- search issues by number, title, body, or label
- select an issue
- read issue details
- read issue comments
- save bookmarks locally

The app is intentionally read-only. It uses the public GitHub REST API and local `localStorage` for bookmarks.

## Why This App Exists

This app is a realistic test of the architecture in this repo.

It has:

- async API loading
- loading and error states
- shared state across unrelated UI parts
- local persistence
- multiple independent components that still need to coordinate

That makes it a better test than a counter or toy demo.

## Main UI Parts

- `repo-picker`
- `issue-filters`
- `issue-list`
- `issue-details`
- `issue-comments`
- `bookmarks-panel`

These components do not import each other or pass callbacks across the tree.

## Architecture

### `typed-bus`

The bus handles user intent and app-level events.

Examples:

- `repo:apply-requested`
- `issue:selected`
- `issues:load-requested`
- `comments:load-succeeded`

### `typed-store`

The store holds current truth.

That includes:

- current repo
- draft repo input
- filters
- loaded issues
- selected issue number
- issue details by issue number
- comments by issue number
- bookmarks

### Adapters

Two adapters sit at the edge:

- GitHub API adapter
- bookmarks `localStorage` adapter

The UI does not call `fetch()` directly.

## Data Flow

Example flow for selecting an issue:

1. `issue-list` dispatches `issue:selected`
2. the bus/store bridge updates `selectedIssueNumber`
3. if details or comments are missing, it dispatches load-request events
4. the GitHub adapter fetches data
5. success/failure events come back through the bus
6. the store updates current truth
7. `issue-details` and `issue-comments` re-render from state

This keeps components independent while still letting them coordinate.

## File Structure

```text
src/
  adapters/
    bookmarks-adapter.ts
    github-adapter.ts
  components/
    bookmarks-panel.ts
    github-issues-app.ts
    issue-comments.ts
    issue-details.ts
    issue-filters.ts
    issue-list.ts
    repo-picker.ts
    shared.ts
  bus-store-bridge.ts
  github-api.ts
  main.ts
  ports.ts
  selectors.ts
  store.ts
  types.ts
  utils.ts
```

## Real-World Notes

- the GitHub issues endpoint also returns pull requests, so the app filters those out
- search is client-side over the loaded issues, not GitHub search API
- bookmarks are local only
- public GitHub API rate limits still apply

## Comparison

### If We Remove `typed-bus`

We would most likely replace bus events with direct function calls.

That would simplify some paths, but it would also create tighter coupling.

Likely result:

- `issue-list` would need to know who handles selection
- `repo-picker` would need direct access to load logic
- components would start importing application services directly
- unrelated parts of the UI would become connected through callbacks or module imports

For a small app, that can be fine. For this app, it would make the boundaries less explicit.

### If We Remove `typed-store`

We would still need some shared state mechanism.

Likely replacements:

- a mutable module-level object
- manual `render()` coordination
- ad hoc subscriptions
- component-local state plus custom synchronization code

That would work, but we would be reinventing a store informally.

Problems would show up in:

- keeping issue list, details, comments, and bookmarks in sync
- loading/error state consistency
- cache-like maps such as `issueDetailsByNumber`
- reasoning about current truth after async events

### If We Remove Both

The app would probably drift toward:

- direct `fetch()` calls inside components
- shared mutable state in a module
- component-to-component coupling through imports
- duplicated loading logic
- more implicit behavior

It would still be buildable, but the architecture would become much less visible and much easier to tangle over time.

### Honest Tradeoff

Using `typed-bus` and `typed-store` adds structure and ceremony.

That cost is worth it here because the app has:

- multiple unrelated UI parts
- async data loading
- cached subresources
- persistent local state

For a smaller app, the packages may be unnecessary.

For this app, they make the boundaries clearer and the behavior easier to reason about.
