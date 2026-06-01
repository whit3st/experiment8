# Use Cases

These packages are for browser apps that want structure without a framework runtime.

## Plain HTML Apps

Use these packages when you are working from plain HTML and module scripts, but still need:

- shared state
- feature decoupling
- explicit message flow

`test-10` is the smallest example of this.

## Web Components And Lit Apps

Use these packages when components need shared message and state primitives but you do not want to bind them to one framework store.

Examples:

- custom elements dispatch app-level commands
- Lit components render from a shared store
- shell components and feature components avoid direct imports

`test-11` and `test-12` show this pattern.

## UI To Domain Commands

Use the bus when UI code should express intent without importing domain services directly.

Examples:

- login form dispatches `auth:login:requested`
- checkout button dispatches `checkout:started`
- kanban card dispatches `card:move:requested`

This keeps UI components thin. They emit messages, and another layer decides what to do.

## Domain To Adapter Boundaries

Use the bus when domain logic needs to trigger infrastructure work without depending on `fetch`, storage, or framework APIs.

Examples:

- domain emits `auth:session:save`
- domain emits `analytics:event:tracked`
- domain emits `document:save:requested`

Adapters can subscribe and handle the side effects.

## App Shell Coordination

Use the bus for cross-cutting UI concerns where many features need the same shared shell behavior.

Examples:

- any feature dispatches `toast:show`
- any feature dispatches `dialog:open`
- any feature dispatches `nav:go`

This works well when you want one place to own orchestration.

## Feature Decoupling

Use these packages when features should communicate without importing each other directly.

Examples:

- billing emits `plan:changed`
- dashboard listens and refreshes visible data
- editor emits `document:published`
- notifications listens and shows success state

This is useful when direct imports would create tight coupling between features.

## When Not To Use Them

Do not use these packages when:

- a direct function call is simpler
- you need runtime validation of untrusted payloads
- you need observable-style stream operators
- you need backend, worker, server-to-server, or distributed messaging guarantees

They are internal browser-app primitives, not a universal event or data solution.
