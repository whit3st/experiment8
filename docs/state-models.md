# State Models

This repo currently keeps two state models on purpose:

- `typed-store`: reducer-based current-state store
- `typed-store-event-source`: event-sourced store with a full event log

The point is not to pick a winner in the abstract. The point is to use the right model for the domain.

## The Core Difference

### `typed-store`

- stores current truth directly
- updates happen through `dispatch(action)`
- the store remembers what is true now

### `typed-store-event-source`

- stores events as the source of truth
- updates happen through `append(event)`
- current state is a projection derived from the event log
- the store remembers how it got here

Simple framing:

- reducer store: store the latest state
- event-sourced store: store the history, derive the latest state

## Practical Comparison

### Dashboard / Admin App

Examples:

- filters
- selected tab
- open modal
- current list data
- optimistic UI state

Best fit: `typed-store`

Why:

- current truth matters more than history
- reducer updates are easier to maintain
- replay is rarely useful

### Authenticated SPA / App Shell

Examples:

- current user
- session state
- navigation state
- notifications
- loading flags

Best fit: `typed-store`

Why:

- app shell state changes often
- only the latest state usually matters
- event history has low product value

### Kanban / Task Board

Best fit: depends

Use `typed-store` when:

- it is just an interactive board UI
- current truth matters more than audit history

Use `typed-store-event-source` when:

- the activity log matters
- you want replay or auditability
- card moves and edits are meaningful domain events

### Text Editor / Rich Document Tool

Best fit: mixed

Use `typed-store` for:

- side panels
- current mode
- selected document
- app shell state around the editor

Use `typed-store-event-source` only when:

- document history is part of the product
- replay or auditability matters
- high-level domain events are valuable on their own

Important note:

For something like ProseMirror, the editor engine already has its own transaction and history model. It usually makes more sense to integrate with that than to replace it.

### Drawing App / Whiteboard

Best fit: `typed-store-event-source`

Why:

- actions are naturally event-like
- undo/redo matters a lot
- replay can be valuable
- collaboration may align with an append-only log

Tradeoff:

- projections get more complex
- snapshots may become necessary

### Form-Heavy Business App

Best fit: `typed-store`

Why:

- current field values matter more than history
- reducer state is easier to reason about
- event logs add little value for most forms

### Workflow / Approval System

Best fit: `typed-store-event-source`

Why:

- the history is part of the domain
- auditability matters
- current status is naturally derived from past events

### Multiplayer / Collaborative Systems

Best fit: maybe `typed-store-event-source`

Why:

- logs of actions can matter
- projections can be rebuilt
- append-only thinking often fits distributed systems well

Tradeoff:

- complexity rises quickly
- ordering, causality, and reconciliation become real problems

## Undo / Redo

Event sourcing makes undo/redo more approachable, but not free.

Why:

- you already have the history
- but you still need an undo/redo policy

Common approaches:

1. replay only up to a current pointer
2. append compensating events
3. keep a hybrid pointer-based history model

So yes, event sourcing is powerful here, but the feature still needs design.

## Pros And Cons

### `typed-store`

Pros:

- simpler mental model
- easier to teach
- lower ceremony
- strong default for most browser apps

Cons:

- no built-in history
- harder to answer "how did we get here?"
- undo/redo needs extra design

### `typed-store-event-source`

Pros:

- preserves history
- replay is natural
- stronger audit story
- often fits action-heavy domains well

Cons:

- more concepts
- more storage and projection cost
- schema evolution is harder
- overkill for ordinary UI state

## Decision Rule

Use `typed-store` when:

- current truth matters most
- UI state dominates
- simplicity matters more than history

Use `typed-store-event-source` when:

- history matters as much as current state
- replay is meaningful
- auditability is valuable
- domain actions are naturally append-only events

## Demos

- `test-11`: reducer-store example
- `test-12`: event-sourced example with visible event log

Keeping both demos side by side is intentional. The best way to compare these models is with the same general UI shape and different state semantics underneath.
