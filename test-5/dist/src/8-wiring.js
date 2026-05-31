import { appBus } from './2-bus.js';
import { startAdapter } from './4-adapter.js';
import { TodoApp } from './5-ui.js';
customElements.define('todo-app', TodoApp);
startAdapter(appBus);
