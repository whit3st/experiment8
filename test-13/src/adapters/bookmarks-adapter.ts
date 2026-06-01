import { BOOKMARKS_LOADED, bus } from '../ports.js';
import { store } from '../store.js';
import { LOCAL_BOOKMARKS_KEY } from '../types.js';

export function startBookmarksAdapter() {
  bus.dispatch(BOOKMARKS_LOADED, { issueNumbers: readBookmarks() });

  let previousBookmarks = JSON.stringify(store.getState().bookmarks);
  store.subscribe((state) => {
    const nextBookmarks = JSON.stringify(state.bookmarks);
    if (nextBookmarks === previousBookmarks) {
      return;
    }

    previousBookmarks = nextBookmarks;
    window.localStorage.setItem(LOCAL_BOOKMARKS_KEY, nextBookmarks);
  });
}

function readBookmarks() {
  try {
    const raw = window.localStorage.getItem(LOCAL_BOOKMARKS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is number => typeof value === 'number');
  } catch {
    return [];
  }
}
