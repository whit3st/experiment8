import { LitElement, css, html } from 'lit';
import { createBus, createPort } from 'typed-bus';
import { createStore, type Reducer } from 'typed-store';

interface AppPorts {
  'counter:increment-clicked': undefined;
  'counter:reset-clicked': undefined;
}

type CounterAction =
  | { type: 'counter/increment' }
  | { type: 'counter/reset' };

type CounterState = {
  count: number;
  lastAction: string;
};

const bus = createBus<AppPorts>();
const port = createPort<AppPorts>();

const INCREMENT_CLICKED = port('counter:increment-clicked');
const RESET_CLICKED = port('counter:reset-clicked');

const reducer: Reducer<CounterState, CounterAction> = (state, action) => {
  switch (action.type) {
    case 'counter/increment':
      return {
        count: state.count + 1,
        lastAction: 'increment'
      };
    case 'counter/reset':
      return {
        count: 0,
        lastAction: 'reset'
      };
    default:
      return state;
  }
};

const store = createStore(reducer, {
  count: 0,
  lastAction: 'none'
});

bus.on(INCREMENT_CLICKED, () => {
  store.dispatch({ type: 'counter/increment' });
});

bus.on(RESET_CLICKED, () => {
  store.dispatch({ type: 'counter/reset' });
});

class CounterApp extends LitElement {
  static styles = css`
    :host {
      display: grid;
      min-height: 100vh;
      place-items: center;
      background: radial-gradient(circle at top, #22304d, #0d1118 55%);
      color: #eef2f8;
      font-family: Inter, system-ui, sans-serif;
    }

    main {
      width: min(28rem, calc(100vw - 2rem));
      padding: 2rem;
      border-radius: 18px;
      background: rgba(17, 22, 33, 0.9);
      border: 1px solid rgba(136, 154, 187, 0.18);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
    }

    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
    }

    p {
      margin: 0;
      color: #b8c3d6;
      line-height: 1.5;
    }

    .layout {
      display: grid;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .meta {
      margin-bottom: 1.5rem;
      color: #8fa2bf;
      font-size: 0.95rem;
    }

    code {
      color: #9ad1ff;
    }
  `;

  static properties = {
    count: { type: Number },
    lastAction: { type: String }
  };

  count = store.getState().count;
  lastAction = store.getState().lastAction;
  private unsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = store.subscribe((state) => {
      this.count = state.count;
      this.lastAction = state.lastAction;
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    super.disconnectedCallback();
  }

  render() {
    return html`
      <main>
        <h1>typed-bus + typed-store + Lit</h1>
        <p>Two unrelated components communicate only through the bus and store.</p>
        <div class="layout">
          <counter-readout
            .count=${this.count}
            .lastAction=${this.lastAction}
          ></counter-readout>
          <counter-controls></counter-controls>
        </div>
        <p class="meta" style="margin-top: 1rem;">
          Flow: <code>Lit UI -> typed-bus -> typed-store -> Lit render</code>
        </p>
      </main>
    `;
  }
}

class CounterReadout extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem 1.1rem;
      border-radius: 14px;
      background: rgba(10, 14, 22, 0.45);
      border: 1px solid rgba(136, 154, 187, 0.12);
    }

    .count {
      margin: 0 0 0.25rem;
      font-size: 3.25rem;
      font-weight: 700;
      letter-spacing: -0.04em;
    }

    .meta {
      color: #8fa2bf;
      font-size: 0.95rem;
    }
  `;

  static properties = {
    count: { type: Number },
    lastAction: { type: String }
  };

  count = 0;
  lastAction = 'none';

  render() {
    return html`
      <div class="count">${this.count}</div>
      <div class="meta">Last action: ${this.lastAction}</div>
    `;
  }
}

class CounterControls extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem 1.1rem;
      border-radius: 14px;
      background: rgba(10, 14, 22, 0.45);
      border: 1px solid rgba(136, 154, 187, 0.12);
    }

    .actions {
      display: flex;
      gap: 0.75rem;
    }

    button {
      border: 0;
      border-radius: 999px;
      padding: 0.85rem 1.1rem;
      font: inherit;
      cursor: pointer;
    }

    .primary {
      background: #81a8ff;
      color: #08101d;
    }

    .secondary {
      background: #263245;
      color: #eef2f8;
    }
  `;

  private handleIncrement = () => {
    bus.dispatch(INCREMENT_CLICKED, undefined);
  };

  private handleReset = () => {
    bus.dispatch(RESET_CLICKED, undefined);
  };

  render() {
    return html`
      <div class="actions">
        <button class="primary" @click=${this.handleIncrement}>Increment</button>
        <button class="secondary" @click=${this.handleReset}>Reset</button>
      </div>
    `;
  }
}

customElements.define('counter-app', CounterApp);
customElements.define('counter-readout', CounterReadout);
customElements.define('counter-controls', CounterControls);
