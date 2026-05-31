# typed-bus

A lightweight, deterministic, typed pub/sub bus built on native browser APIs. Zero dependencies. Zero runtime overhead beyond a single `as` assertion.

## Architecture

This project explores **hexagonal architecture** (ports and adapters) using nothing but the web platform and TypeScript.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   1-ports   │────▶│   2-bus     │────▶│  3-domain   │
│  (contract) │     │  (pub/sub)  │     │  (logic)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                      │
       └──────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │ 4-adapter   │       │ 5-ui        │
       │ (wires)     │       │ (renders)   │
       └─────────────┘       └─────────────┘
```

| Layer | Responsibility |
|-------|--------------|
| **Ports** | The contract. What events exist and what they carry. |
| **Bus** | The transport. Typed `EventTarget` wrapper. |
| **Domain** | Pure logic. No DOM, no network. |
| **Adapter** | Bridges domain commands to the bus. |
| **UI** | Visual shell. Dispatches commands, listens to state. |

## Tests

| Directory | What it demonstrates |
|-----------|----------------------|
| `test-1` | Vanilla JS web component with autonomous custom elements |
| `test-2` | Error scenarios: bad payloads, missing adapters, broken wiring |
| `test-3` | TypeScript port with `tsgo` compiler |
| `test-4` | Deterministic typed bus without `as` assertions in app code |
| `test-5` | Same architecture using Lit |
| `test-6` | Auth SPA with Vite, cookie-based session, guarded routes |
| `test-7` | Kanban board with JSON persistence via Vite dev server proxy |
| `test-8` | `typed-bus` package: `createBus()`, `createPort()`, `observePort()` |
| `test-9` | Consumer app importing `typed-bus` via `pnpm link` |

## Usage

```typescript
import { createBus, createPort } from 'typed-bus';

// 1. Define your contract
interface MyPorts {
  'app:login':  { username: string };
  'app:logout': {};
}

// 2. Create the bus
const bus = createBus<MyPorts>();

// 3. Create type-safe port names
const port = createPort<MyPorts>();
const LOGIN = port('app:login');

// 4. Use it
bus.on(LOGIN, ({ username }) => {
  console.log(`User ${username} logged in`);
});

bus.dispatch(LOGIN, { username: 'Alex' });
```

## Development

```bash
# Build the library
cd test-8
pnpm install
pnpm build

# Link to consumer app
cd ../test-9
pnpm install
pnpm dev
```

## Philosophy

- **Deterministic**: Given a port name and payload, the output is predictable.
- **Native**: `EventTarget`, `CustomEvent`, `HTMLElement`, ES Modules.
- **Typed**: Compile-time contracts via TypeScript generics. No runtime validation overhead.
- **Decoupled**: The domain doesn't know about the DOM. The UI doesn't know about the domain.
