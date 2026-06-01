import type { RepoRef } from './types.js';

export function normalizeRepo(repo: RepoRef) {
  return {
    owner: repo.owner.trim(),
    name: repo.name.trim()
  };
}

export function toMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}
