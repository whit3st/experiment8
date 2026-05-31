import { appBus } from './2-bus.js';
import { startApiAdapter } from './3-api-adapter.js';
import { startLogger } from './7-logger.js';
import './4-ui.js';

startApiAdapter(appBus);
startLogger(appBus);
