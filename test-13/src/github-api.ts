import type { IssueComment, IssueSummary, RepoRef } from './types.js';

type GitHubIssuePayload = {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: { login: string };
  labels: Array<{ name: string }>;
  created_at: string;
  comments: number;
  body: string | null;
  html_url: string;
  pull_request?: object;
};

type GitHubCommentPayload = {
  id: number;
  user: { login: string };
  body: string | null;
  created_at: string;
  html_url: string;
};

export async function fetchIssues(repo: RepoRef) {
  const response = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.name}/issues?state=all&per_page=100`
  );

  if (!response.ok) {
    throw new Error(await readGitHubError(response));
  }

  const payload = await response.json() as GitHubIssuePayload[];
  return payload
    .filter((issue) => issue.pull_request === undefined)
    .map(mapIssueSummary);
}

export async function fetchIssueDetails(repo: RepoRef, issueNumber: number) {
  const response = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.name}/issues/${issueNumber}`
  );

  if (!response.ok) {
    throw new Error(await readGitHubError(response));
  }

  const payload = await response.json() as GitHubIssuePayload;
  return mapIssueSummary(payload);
}

export async function fetchIssueComments(repo: RepoRef, issueNumber: number) {
  const response = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.name}/issues/${issueNumber}/comments?per_page=100`
  );

  if (!response.ok) {
    throw new Error(await readGitHubError(response));
  }

  const payload = await response.json() as GitHubCommentPayload[];
  return payload.map(mapIssueComment);
}

function mapIssueSummary(issue: GitHubIssuePayload): IssueSummary {
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    author: issue.user.login,
    labels: issue.labels.map((label) => label.name),
    createdAt: issue.created_at,
    comments: issue.comments,
    body: issue.body ?? '',
    htmlUrl: issue.html_url
  };
}

function mapIssueComment(comment: GitHubCommentPayload): IssueComment {
  return {
    id: comment.id,
    author: comment.user.login,
    body: comment.body ?? '',
    createdAt: comment.created_at,
    htmlUrl: comment.html_url
  };
}

async function readGitHubError(response: Response) {
  try {
    const payload = await response.json() as { message?: string };
    return payload.message ?? `GitHub API request failed with ${response.status}`;
  } catch {
    return `GitHub API request failed with ${response.status}`;
  }
}
