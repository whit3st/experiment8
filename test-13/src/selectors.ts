import type { AppState } from './store.js';

export function selectVisibleIssues(state: AppState) {
  const search = state.filters.search.trim().toLowerCase();

  return state.issues.items.filter((issue) => {
    const matchesState = state.filters.state === 'all' || issue.state === state.filters.state;
    const matchesSearch = search === ''
      || issue.title.toLowerCase().includes(search)
      || issue.body.toLowerCase().includes(search)
      || issue.labels.some((label) => label.toLowerCase().includes(search))
      || String(issue.number).includes(search);

    return matchesState && matchesSearch;
  });
}

export function selectSelectedIssue(state: AppState) {
  if (state.selectedIssueNumber === null) {
    return null;
  }

  return state.issueDetailsByNumber[state.selectedIssueNumber]?.item
    ?? state.issues.items.find((issue) => issue.number === state.selectedIssueNumber)
    ?? null;
}

export function selectSelectedComments(state: AppState) {
  if (state.selectedIssueNumber === null) {
    return null;
  }

  return state.commentsByIssueNumber[state.selectedIssueNumber] ?? null;
}

export function selectBookmarkedIssues(state: AppState) {
  return state.bookmarks
    .map((issueNumber) => state.issues.items.find((issue) => issue.number === issueNumber))
    .filter((issue): issue is NonNullable<typeof issue> => issue !== undefined);
}
