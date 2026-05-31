import { appBus } from './2-bus.js';
import { startAdapter } from './4-adapter.js';
import { startRouter } from './6-router.js';

const mount = document.querySelector<HTMLDivElement>('#app')!;

startAdapter(appBus);
startRouter(appBus, mount);
