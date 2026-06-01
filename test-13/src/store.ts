import { createStore, type Reducer } from 'typed-store';
import { DEFAULT_REPO, type Filters, type IssueComment, type IssueResource, type IssueSummary, type RepoRef } from './types.js';

export type AppState = {
  currentRepo: RepoRef;
  draftRepo: RepoRef;
  filters: Filters;
  issues: {
    items: IssueSummary[];
    loading: boolean;
    error: string | null;
    lastLoadedAt: string | null;
  };
  selectedIssueNumber: number | null;
  issueDetailsByNumber: Record<number, IssueResource<IssueSummary>>;
  commentsByIssueNumber: Record<number, IssueResource<IssueComment[]>>;
  bookmarks: number[];
};

export type Action =
  | { type: 'repo/draft-owner-changed'; owner: string }
  | { type: 'repo/draft-name-changed'; name: string }
  | { type: 'repo/applied'; repo: RepoRef }
  | { type: 'filters/state-changed'; state: Filters['state'] }
  | { type: 'filters/search-changed'; search: string }
  | { type: 'issues/load-requested' }
  | { type: 'issues/load-succeeded'; items: IssueSummary[]; loadedAt: string }
  | { type: 'issues/load-failed'; error: string }
  | { type: 'issue/selected'; issueNumber: number }
  | { type: 'issue-details/load-requested'; issueNumber: number }
  | { type: 'issue-details/load-succeeded'; issueNumber: number; item: IssueSummary }
  | { type: 'issue-details/load-failed'; issueNumber: number; error: string }
  | { type: 'comments/load-requested'; issueNumber: number }
  | { type: 'comments/load-succeeded'; issueNumber: number; items: IssueComment[] }
  | { type: 'comments/load-failed'; issueNumber: number; error: string }
  | { type: 'bookmarks/loaded'; issueNumbers: number[] }
  | { type: 'bookmark/toggled'; issueNumber: number };

const reducer: Reducer<AppState, Action> = (state, action) => {
  switch (action.type) {
    case 'repo/draft-owner-changed':
      return {
        ...state,
        draftRepo: { ...state.draftRepo, owner: action.owner }
      };
    case 'repo/draft-name-changed':
      return {
        ...state,
        draftRepo: { ...state.draftRepo, name: action.name }
      };
    case 'repo/applied':
      return {
        ...state,
        currentRepo: action.repo,
        draftRepo: action.repo,
        selectedIssueNumber: null,
        issueDetailsByNumber: {},
        commentsByIssueNumber: {},
        issues: {
          ...state.issues,
          items: [],
          error: null,
          lastLoadedAt: null
        }
      };
    case 'filters/state-changed':
      return {
        ...state,
        filters: { ...state.filters, state: action.state }
      };
    case 'filters/search-changed':
      return {
        ...state,
        filters: { ...state.filters, search: action.search }
      };
    case 'issues/load-requested':
      return {
        ...state,
        issues: {
          ...state.issues,
          loading: true,
          error: null
        }
      };
    case 'issues/load-succeeded':
      return {
        ...state,
        issues: {
          items: action.items,
          loading: false,
          error: null,
          lastLoadedAt: action.loadedAt
        }
      };
    case 'issues/load-failed':
      return {
        ...state,
        issues: {
          ...state.issues,
          loading: false,
          error: action.error
        }
      };
    case 'issue/selected':
      return {
        ...state,
        selectedIssueNumber: action.issueNumber
      };
    case 'issue-details/load-requested':
      return {
        ...state,
        issueDetailsByNumber: {
          ...state.issueDetailsByNumber,
          [action.issueNumber]: {
            item: state.issueDetailsByNumber[action.issueNumber]?.item ?? null,
            loading: true,
            error: null
          }
        }
      };
    case 'issue-details/load-succeeded':
      return {
        ...state,
        issueDetailsByNumber: {
          ...state.issueDetailsByNumber,
          [action.issueNumber]: {
            item: action.item,
            loading: false,
            error: null
          }
        }
      };
    case 'issue-details/load-failed':
      return {
        ...state,
        issueDetailsByNumber: {
          ...state.issueDetailsByNumber,
          [action.issueNumber]: {
            item: state.issueDetailsByNumber[action.issueNumber]?.item ?? null,
            loading: false,
            error: action.error
          }
        }
      };
    case 'comments/load-requested':
      return {
        ...state,
        commentsByIssueNumber: {
          ...state.commentsByIssueNumber,
          [action.issueNumber]: {
            item: state.commentsByIssueNumber[action.issueNumber]?.item ?? null,
            loading: true,
            error: null
          }
        }
      };
    case 'comments/load-succeeded':
      return {
        ...state,
        commentsByIssueNumber: {
          ...state.commentsByIssueNumber,
          [action.issueNumber]: {
            item: action.items,
            loading: false,
            error: null
          }
        }
      };
    case 'comments/load-failed':
      return {
        ...state,
        commentsByIssueNumber: {
          ...state.commentsByIssueNumber,
          [action.issueNumber]: {
            item: state.commentsByIssueNumber[action.issueNumber]?.item ?? null,
            loading: false,
            error: action.error
          }
        }
      };
    case 'bookmarks/loaded':
      return {
        ...state,
        bookmarks: action.issueNumbers
      };
    case 'bookmark/toggled':
      return {
        ...state,
        bookmarks: state.bookmarks.includes(action.issueNumber)
          ? state.bookmarks.filter((value) => value !== action.issueNumber)
          : [...state.bookmarks, action.issueNumber].sort((a, b) => a - b)
      };
    default:
      return state;
  }
};

export const store = createStore(reducer, {
  currentRepo: DEFAULT_REPO,
  draftRepo: DEFAULT_REPO,
  filters: {
    state: 'open',
    search: ''
  },
  issues: {
    items: [],
    loading: false,
    error: null,
    lastLoadedAt: null
  },
  selectedIssueNumber: null,
  issueDetailsByNumber: {},
  commentsByIssueNumber: {},
  bookmarks: []
});
