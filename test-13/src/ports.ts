import { createBus, createPort } from 'typed-bus';
import type { Filters, IssueComment, IssueSummary } from './types.js';

export interface AppPorts {
  'repo:owner-input': { owner: string };
  'repo:name-input': { name: string };
  'repo:apply-requested': undefined;
  'filters:state-changed': { state: Filters['state'] };
  'filters:search-changed': { search: string };
  'issues:load-requested': undefined;
  'issues:load-succeeded': { items: IssueSummary[]; loadedAt: string };
  'issues:load-failed': { error: string };
  'issue:selected': { issueNumber: number };
  'issue-details:load-requested': { issueNumber: number };
  'issue-details:load-succeeded': { issueNumber: number; item: IssueSummary };
  'issue-details:load-failed': { issueNumber: number; error: string };
  'comments:load-requested': { issueNumber: number };
  'comments:load-succeeded': { issueNumber: number; items: IssueComment[] };
  'comments:load-failed': { issueNumber: number; error: string };
  'bookmark:toggled': { issueNumber: number };
  'bookmarks:loaded': { issueNumbers: number[] };
}

export const bus = createBus<AppPorts>();
const port = createPort<AppPorts>();

export const REPO_OWNER_INPUT = port('repo:owner-input');
export const REPO_NAME_INPUT = port('repo:name-input');
export const REPO_APPLY_REQUESTED = port('repo:apply-requested');
export const FILTERS_STATE_CHANGED = port('filters:state-changed');
export const FILTERS_SEARCH_CHANGED = port('filters:search-changed');
export const ISSUES_LOAD_REQUESTED = port('issues:load-requested');
export const ISSUES_LOAD_SUCCEEDED = port('issues:load-succeeded');
export const ISSUES_LOAD_FAILED = port('issues:load-failed');
export const ISSUE_SELECTED = port('issue:selected');
export const ISSUE_DETAILS_LOAD_REQUESTED = port('issue-details:load-requested');
export const ISSUE_DETAILS_LOAD_SUCCEEDED = port('issue-details:load-succeeded');
export const ISSUE_DETAILS_LOAD_FAILED = port('issue-details:load-failed');
export const COMMENTS_LOAD_REQUESTED = port('comments:load-requested');
export const COMMENTS_LOAD_SUCCEEDED = port('comments:load-succeeded');
export const COMMENTS_LOAD_FAILED = port('comments:load-failed');
export const BOOKMARK_TOGGLED = port('bookmark:toggled');
export const BOOKMARKS_LOADED = port('bookmarks:loaded');
