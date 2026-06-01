# browser-native app primitives

This repo explores a simple idea: building rich browser apps with native web platform tools instead of a framework runtime.

Core packages:

- `typed-bus`: typed in-app messaging built on native `EventTarget`
- `typed-store`: minimal reducer-based state for browser apps
- `typed-store-event-source`: minimal event-sourced state for browser apps

The goal is not to compete with React, Redux, Zustand, or Vue stores. The goal is to make plain HTML, Web Components, and Lit apps easier to structure without leaving the platform.

## What This Solves

These packages are for browser apps that need:

- typed message contracts for app-level events
- shared state without a framework runtime
- explicit boundaries between UI, domain, and adapters
- architecture that works in plain HTML, Web Components, or Lit

They are intentionally small. They do not try to be a full frontend framework.

## Packages

### `typed-bus`

- typed event contracts
- browser-native message transport
- good for decoupling UI, domain, and adapters

### `typed-store`

- reducer-based current-state store
- `getState()`, `dispatch()`, `subscribe()`
- good default when current truth matters more than history

### `typed-store-event-source`

- append-only event log with projected current state
- `getState()`, `getEvents()`, `append()`, `replay()`, `subscribe()`
- useful when history itself matters

## Docs

- [Architecture](docs/architecture.md)
- [Use Cases](docs/use-cases.md)
- [State Models](docs/state-models.md)

## Repo Map

| Directory | What it demonstrates |
|-----------|----------------------|
| `test-1` | Vanilla JS web component with autonomous custom elements |
| `test-2` | Error scenarios: bad payloads, missing adapters, broken wiring |
| `test-3` | TypeScript port with `tsgo` compiler |
| `test-4` | Deterministic typed bus without `as` assertions in app code |
| `test-5` | Same architecture using Lit |
| `test-6` | Auth SPA with Vite, cookie-based session, guarded routes |
| `test-7` | Kanban board with JSON persistence via Vite dev server proxy |
| `typed-bus` | `typed-bus` package: `createBus()`, `createPort()` |
| `typed-store` | `typed-store` package: `createStore()` |
| `typed-store-event-source` | Event-sourced store package: `createEventStore()` |
| `test-9` | Consumer app importing `typed-bus` via `pnpm link` |
| `test-10` | Plain HTML demo using `typed-bus` and `typed-store` together |
| `test-11` | Lit + Vite + TypeScript demo using two unrelated components with `typed-bus` and `typed-store` |
| `test-12` | Lit + Vite + TypeScript demo using `typed-bus` and `typed-store-event-source` with an event log |

## Quick Usage

### `typed-bus`

```typescript
import { createBus, createPort } from 'typed-bus';

interface MyPorts {
  'app:login': { username: string };
}

const bus = createBus<MyPorts>();
const port = createPort<MyPorts>();
const LOGIN = port('app:login');

bus.on(LOGIN, ({ username }) => {
  console.log(username);
});

bus.dispatch(LOGIN, { username: 'Alex' });
```

### `typed-store`

```typescript
import { createStore } from 'typed-store';

type CounterAction =
  | { type: 'counter/increment' }
  | { type: 'counter/reset' };

const store = createStore(
  (state: { count: number }, action: CounterAction) => {
    switch (action.type) {
      case 'counter/increment':
        return { count: state.count + 1 };
      case 'counter/reset':
        return { count: 0 };
      default:
        return state;
    }
  },
  { count: 0 }
);

store.dispatch({ type: 'counter/increment' });
```

### `typed-store-event-source`

```typescript
import { createEventStore } from 'typed-store-event-source';

type CounterEvent =
  | { type: 'counter/incremented'; amount: number }
  | { type: 'counter/reset' };

const store = createEventStore(
  (state: { count: number }, event: CounterEvent) => {
    switch (event.type) {
      case 'counter/incremented':
        return { count: state.count + event.amount };
      case 'counter/reset':
        return { count: 0 };
      default:
        return state;
    }
  },
  { count: 0 }
);

store.append({ type: 'counter/incremented', amount: 1 });
```

## Development

```bash
# Build typed-bus
cd typed-bus
pnpm install
pnpm build

# Build typed-store
cd ../typed-store
pnpm install
pnpm build

# Build typed-store-event-source
cd ../typed-store-event-source
pnpm install
pnpm build

# Run the Lit reducer-store demo
cd ../test-11
pnpm install
pnpm dev

# Run the Lit event-sourced demo
cd ../test-12
pnpm install
pnpm dev
```

## Philosophy

- **Native**: built on browser primitives first
- **Typed**: compile-time contracts instead of framework conventions
- **Decoupled**: UI, domain, and adapters should not collapse into one layer
- **Small**: minimal APIs with clear responsibilities
