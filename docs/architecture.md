# Architecture

This repo explores hexagonal architecture using browser-native tools and TypeScript.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ports     │────▶│    bus      │────▶│   domain    │
│ (contract)  │     │ (transport) │     │  (logic)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                      │
       └──────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌─────────────┐       ┌─────────────┐
       │  adapters   │       │     UI      │
       │ (effects)   │       │  (render)   │
       └─────────────┘       └─────────────┘
```

## Layers

| Layer | Responsibility |
|-------|----------------|
| **Ports** | The contract. What messages or events exist and what they carry. |
| **Bus** | The transport. A typed event layer for in-app communication. |
| **Domain** | Pure logic. No DOM, no network, no framework runtime. |
| **Adapters** | Side effects and infrastructure: network, storage, analytics, persistence. |
| **UI** | Rendering and user interaction. Dispatches commands and renders current state. |

## Package Roles

### `typed-bus`

`typed-bus` is the transient message layer.

Use it for:

- commands from UI to application logic
- cross-feature communication without direct imports
- app-level events and orchestration

### `typed-store`

`typed-store` is the current-truth layer.

Use it for:

- canonical app state
- explicit reducer-based state transitions
- UI subscriptions when only the latest state matters

### `typed-store-event-source`

`typed-store-event-source` is the historical-truth layer.

Use it for:

- append-only event history
- projecting current state from past events
- replay-oriented or audit-oriented domains

## Typical Flow

With `typed-bus` and `typed-store`:

1. UI dispatches a command through the bus.
2. A bus listener decides what action to dispatch to the store.
3. The store updates current state.
4. UI re-renders from the new state.

With `typed-bus` and `typed-store-event-source`:

1. UI dispatches a command through the bus.
2. A bus listener appends a domain event to the event store.
3. The event store projects the new current state.
4. UI re-renders from the projection.
5. The event log remains available for inspection or replay.

## Why This Shape

The point is not to recreate a framework.

The point is to give browser apps just enough structure so that:

- state is not scattered across random modules
- cross-feature communication does not become direct import soup
- plain HTML, custom elements, and Lit stay maintainable as the app grows
