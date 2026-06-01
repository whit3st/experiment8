import './components/github-issues-app.js';
import { startBookmarksAdapter } from './adapters/bookmarks-adapter.js';
import { startGitHubAdapter } from './adapters/github-adapter.js';
import { bootstrapApp, wireBusToStore } from './bus-store-bridge.js';

wireBusToStore();
startGitHubAdapter();
startBookmarksAdapter();
bootstrapApp();
