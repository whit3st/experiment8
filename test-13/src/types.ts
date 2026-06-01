export type RepoRef = {
  owner: string;
  name: string;
};

export type IssueSummary = {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: string;
  labels: string[];
  createdAt: string;
  comments: number;
  body: string;
  htmlUrl: string;
};

export type IssueComment = {
  id: number;
  author: string;
  body: string;
  createdAt: string;
  htmlUrl: string;
};

export type IssueResource<T> = {
  item: T | null;
  loading: boolean;
  error: string | null;
};

export type Filters = {
  state: 'open' | 'closed' | 'all';
  search: string;
};

export const DEFAULT_REPO: RepoRef = {
  owner: 'epistola-app',
  name: 'epistola-suite'
};

export const LOCAL_BOOKMARKS_KEY = 'test-13:bookmarks';
