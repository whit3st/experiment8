import {
  bus,
  COMMENTS_LOAD_FAILED,
  COMMENTS_LOAD_REQUESTED,
  COMMENTS_LOAD_SUCCEEDED,
  ISSUES_LOAD_FAILED,
  ISSUES_LOAD_REQUESTED,
  ISSUES_LOAD_SUCCEEDED,
  ISSUE_DETAILS_LOAD_FAILED,
  ISSUE_DETAILS_LOAD_REQUESTED,
  ISSUE_DETAILS_LOAD_SUCCEEDED
} from '../ports.js';
import { store } from '../store.js';
import { fetchIssueComments, fetchIssueDetails, fetchIssues } from '../github-api.js';
import { toMessage } from '../utils.js';

export function startGitHubAdapter() {
  bus.on(ISSUES_LOAD_REQUESTED, async () => {
    const repo = store.getState().currentRepo;

    try {
      const items = await fetchIssues(repo);
      bus.dispatch(ISSUES_LOAD_SUCCEEDED, {
        items,
        loadedAt: new Date().toISOString()
      });
    } catch (error) {
      bus.dispatch(ISSUES_LOAD_FAILED, {
        error: toMessage(error)
      });
    }
  });

  bus.on(ISSUE_DETAILS_LOAD_REQUESTED, async ({ issueNumber }) => {
    const repo = store.getState().currentRepo;

    try {
      const item = await fetchIssueDetails(repo, issueNumber);
      bus.dispatch(ISSUE_DETAILS_LOAD_SUCCEEDED, { issueNumber, item });
    } catch (error) {
      bus.dispatch(ISSUE_DETAILS_LOAD_FAILED, {
        issueNumber,
        error: toMessage(error)
      });
    }
  });

  bus.on(COMMENTS_LOAD_REQUESTED, async ({ issueNumber }) => {
    const repo = store.getState().currentRepo;

    try {
      const items = await fetchIssueComments(repo, issueNumber);
      bus.dispatch(COMMENTS_LOAD_SUCCEEDED, { issueNumber, items });
    } catch (error) {
      bus.dispatch(COMMENTS_LOAD_FAILED, {
        issueNumber,
        error: toMessage(error)
      });
    }
  });
}
