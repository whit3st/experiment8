import {
  BOOKMARKS_LOADED,
  BOOKMARK_TOGGLED,
  bus,
  COMMENTS_LOAD_FAILED,
  COMMENTS_LOAD_REQUESTED,
  COMMENTS_LOAD_SUCCEEDED,
  FILTERS_SEARCH_CHANGED,
  FILTERS_STATE_CHANGED,
  ISSUES_LOAD_FAILED,
  ISSUES_LOAD_REQUESTED,
  ISSUES_LOAD_SUCCEEDED,
  ISSUE_DETAILS_LOAD_FAILED,
  ISSUE_DETAILS_LOAD_REQUESTED,
  ISSUE_DETAILS_LOAD_SUCCEEDED,
  ISSUE_SELECTED,
  REPO_APPLY_REQUESTED,
  REPO_NAME_INPUT,
  REPO_OWNER_INPUT
} from './ports.js';
import { store } from './store.js';
import { normalizeRepo } from './utils.js';

export function wireBusToStore() {
  bus.on(REPO_OWNER_INPUT, ({ owner }) => {
    store.dispatch({ type: 'repo/draft-owner-changed', owner });
  });

  bus.on(REPO_NAME_INPUT, ({ name }) => {
    store.dispatch({ type: 'repo/draft-name-changed', name });
  });

  bus.on(REPO_APPLY_REQUESTED, () => {
    const draftRepo = normalizeRepo(store.getState().draftRepo);
    if (draftRepo.owner === '' || draftRepo.name === '') {
      return;
    }

    store.dispatch({ type: 'repo/applied', repo: draftRepo });
    bus.dispatch(ISSUES_LOAD_REQUESTED, undefined);
  });

  bus.on(FILTERS_STATE_CHANGED, ({ state }) => {
    store.dispatch({ type: 'filters/state-changed', state });
  });

  bus.on(FILTERS_SEARCH_CHANGED, ({ search }) => {
    store.dispatch({ type: 'filters/search-changed', search });
  });

  bus.on(ISSUES_LOAD_REQUESTED, () => {
    store.dispatch({ type: 'issues/load-requested' });
  });

  bus.on(ISSUES_LOAD_SUCCEEDED, ({ items, loadedAt }) => {
    store.dispatch({ type: 'issues/load-succeeded', items, loadedAt });

    const selectedIssueNumber = store.getState().selectedIssueNumber;
    if (selectedIssueNumber === null && items.length > 0) {
      bus.dispatch(ISSUE_SELECTED, { issueNumber: items[0].number });
    }
  });

  bus.on(ISSUES_LOAD_FAILED, ({ error }) => {
    store.dispatch({ type: 'issues/load-failed', error });
  });

  bus.on(ISSUE_SELECTED, ({ issueNumber }) => {
    store.dispatch({ type: 'issue/selected', issueNumber });

    const state = store.getState();
    const details = state.issueDetailsByNumber[issueNumber];
    if (!details?.item && !details?.loading) {
      bus.dispatch(ISSUE_DETAILS_LOAD_REQUESTED, { issueNumber });
    }

    const comments = state.commentsByIssueNumber[issueNumber];
    if (!comments?.item && !comments?.loading) {
      bus.dispatch(COMMENTS_LOAD_REQUESTED, { issueNumber });
    }
  });

  bus.on(ISSUE_DETAILS_LOAD_REQUESTED, ({ issueNumber }) => {
    store.dispatch({ type: 'issue-details/load-requested', issueNumber });
  });

  bus.on(ISSUE_DETAILS_LOAD_SUCCEEDED, ({ issueNumber, item }) => {
    store.dispatch({ type: 'issue-details/load-succeeded', issueNumber, item });
  });

  bus.on(ISSUE_DETAILS_LOAD_FAILED, ({ issueNumber, error }) => {
    store.dispatch({ type: 'issue-details/load-failed', issueNumber, error });
  });

  bus.on(COMMENTS_LOAD_REQUESTED, ({ issueNumber }) => {
    store.dispatch({ type: 'comments/load-requested', issueNumber });
  });

  bus.on(COMMENTS_LOAD_SUCCEEDED, ({ issueNumber, items }) => {
    store.dispatch({ type: 'comments/load-succeeded', issueNumber, items });
  });

  bus.on(COMMENTS_LOAD_FAILED, ({ issueNumber, error }) => {
    store.dispatch({ type: 'comments/load-failed', issueNumber, error });
  });

  bus.on(BOOKMARKS_LOADED, ({ issueNumbers }) => {
    store.dispatch({ type: 'bookmarks/loaded', issueNumbers });
  });

  bus.on(BOOKMARK_TOGGLED, ({ issueNumber }) => {
    store.dispatch({ type: 'bookmark/toggled', issueNumber });
  });
}

export function bootstrapApp() {
  bus.dispatch(ISSUES_LOAD_REQUESTED, undefined);
}
