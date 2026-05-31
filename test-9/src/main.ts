import { LitElement, html, css } from 'lit';
import { createBus, createPort, observePort } from 'typed-bus';

// 1. Define the contract
interface AppPorts {
  'app:click': { count: number };
  'app:log':   { message: string };
}

// 2. Create the bus (shared across the app)
const bus = createBus<AppPorts>();

// 3. Create type-safe port names
const port = createPort<AppPorts>();
const CLICK = port('app:click');
const LOG   = port('app:log');

class ConsumerApp extends LitElement {
  static styles = css`
    :host { display: block; font-family: system-ui, sans-serif; padding: 2rem; }
    button { padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; white-space: pre-wrap; }
  `;

  static properties = {
    logs: { type: Array }
  };

  logs: string[] = [];
  private counter = 0;

  connectedCallback() {
    super.connectedCallback();
    observePort(bus, LOG, 'LOG');
    observePort(bus, CLICK, 'CLICK');
    bus.dispatch(LOG, { message: 'typed-bus + Lit consumer loaded' });
  }

  private handleClick = () => {
    this.counter++;
    bus.dispatch(CLICK, { count: this.counter });
  };

  render() {
    return html`
      <h1>typed-bus + Lit consumer</h1>
      <button @click=${this.handleClick}>Click me</button>
      <pre>${this.logs.join('\n')}</pre>
    `;
  }
}

customElements.define('consumer-app', ConsumerApp);
