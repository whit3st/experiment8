import { LitElement, css, html } from 'lit';
import { createBus, createPort } from 'typed-bus';
import {
  createEventStore,
  type EventProjector
} from 'typed-store-event-source';

interface AppPorts {
  'counter:increment-clicked': undefined;
  'counter:reset-clicked': undefined;
}

type CounterEvent =
  | { type: 'counter/incremented'; amount: number }
  | { type: 'counter/reset' };

type CounterState = {
  count: number;
  lastEvent: string;
};

const bus = createBus<AppPorts>();
const port = createPort<AppPorts>();

const INCREMENT_CLICKED = port('counter:increment-clicked');
const RESET_CLICKED = port('counter:reset-clicked');

const projector: EventProjector<CounterState, CounterEvent> = (state, event) => {
  switch (event.type) {
    case 'counter/incremented':
      return {
        count: state.count + event.amount,
        lastEvent: `incremented +${event.amount}`
      };
    case 'counter/reset':
      return {
        count: 0,
        lastEvent: 'reset'
      };
    default:
      return state;
  }
};

const store = createEventStore(projector, {
  count: 0,
  lastEvent: 'none'
});

bus.on(INCREMENT_CLICKED, () => {
  store.append({ type: 'counter/incremented', amount: 1 });
});

bus.on(RESET_CLICKED, () => {
  store.append({ type: 'counter/reset' });
});

class CounterEventApp extends LitElement {
  static styles = css`
    :host {
      display: grid;
      min-height: 100vh;
      place-items: center;
      background: radial-gradient(circle at top, #3f2335, #101118 55%);
      color: #f3eef6;
      font-family: Inter, system-ui, sans-serif;
    }

    main {
      width: min(42rem, calc(100vw - 2rem));
      padding: 2rem;
      border-radius: 18px;
      background: rgba(24, 18, 30, 0.92);
      border: 1px solid rgba(199, 148, 255, 0.16);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);
    }

    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
    }

    p {
      margin: 0;
      color: #d3bfdc;
      line-height: 1.5;
    }

    .layout {
      display: grid;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .meta {
      margin-top: 1rem;
      color: #b99dca;
      font-size: 0.95rem;
    }

    code {
      color: #f8b3ff;
    }
  `;

  static properties = {
    count: { type: Number },
    lastEvent: { type: String },
    eventLog: { type: Array }
  };

  count = store.getState().count;
  lastEvent = store.getState().lastEvent;
  eventLog = [...store.getEvents()];
  private unsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = store.subscribe((state) => {
      this.count = state.count;
      this.lastEvent = state.lastEvent;
      this.eventLog = [...store.getEvents()];
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
        <h1>typed-bus + event-sourced store + Lit</h1>
        <p>
          The controls do not know the readout or log. They only emit bus commands.
          The store keeps the full event history and projects current state from it.
        </p>
        <div class="layout">
          <counter-event-readout
            .count=${this.count}
            .lastEvent=${this.lastEvent}
          ></counter-event-readout>
          <counter-event-controls></counter-event-controls>
          <counter-event-log .events=${this.eventLog}></counter-event-log>
        </div>
        <p class="meta">
          Flow: <code>Lit UI -> typed-bus -> typed-store-event-source -> Lit render</code>
        </p>
      </main>
    `;
  }
}

class CounterEventReadout extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem 1.1rem;
      border-radius: 14px;
      background: rgba(10, 8, 14, 0.38);
      border: 1px solid rgba(199, 148, 255, 0.12);
    }

    .count {
      margin: 0 0 0.25rem;
      font-size: 3.25rem;
      font-weight: 700;
      letter-spacing: -0.04em;
    }

    .meta {
      color: #c8b0d5;
      font-size: 0.95rem;
    }
  `;

  static properties = {
    count: { type: Number },
    lastEvent: { type: String }
  };

  count = 0;
  lastEvent = 'none';

  render() {
    return html`
      <div class="count">${this.count}</div>
      <div class="meta">Last projected event: ${this.lastEvent}</div>
    `;
  }
}

class CounterEventControls extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem 1.1rem;
      border-radius: 14px;
      background: rgba(10, 8, 14, 0.38);
      border: 1px solid rgba(199, 148, 255, 0.12);
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
      background: #f3a2ff;
      color: #1b0720;
    }

    .secondary {
      background: #34253f;
      color: #f3eef6;
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

class CounterEventLog extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem 1.1rem;
      border-radius: 14px;
      background: rgba(10, 8, 14, 0.38);
      border: 1px solid rgba(199, 148, 255, 0.12);
    }

    h2 {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      color: #f3eef6;
    }

    ol {
      margin: 0;
      padding-left: 1.25rem;
      color: #c8b0d5;
    }

    li + li {
      margin-top: 0.35rem;
    }

    .empty {
      color: #9d87ab;
      font-size: 0.95rem;
    }
  `;

  static properties = {
    events: { type: Array }
  };

  events: CounterEvent[] = [];

  render() {
    return html`
      <h2>Event log</h2>
      ${this.events.length === 0
        ? html`<div class="empty">No events yet.</div>`
        : html`
            <ol>
              ${this.events.map((event) => html`
                <li>${formatEvent(event)}</li>
              `)}
            </ol>
          `}
    `;
  }
}

function formatEvent(event: CounterEvent) {
  switch (event.type) {
    case 'counter/incremented':
      return `${event.type} (+${event.amount})`;
    case 'counter/reset':
      return event.type;
    default:
      return event.type;
  }
}

customElements.define('counter-event-app', CounterEventApp);
customElements.define('counter-event-readout', CounterEventReadout);
customElements.define('counter-event-controls', CounterEventControls);
customElements.define('counter-event-log', CounterEventLog);
