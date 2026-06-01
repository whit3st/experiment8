import { describe, it, expect } from 'vitest';
import { createBus, createPort } from '../index.js';

describe('createBus', () => {
  it('dispatches and receives typed events', () => {
    interface TestPorts {
      'test:add': { value: number };
      'test:result': { sum: number };
    }

    const bus = createBus<TestPorts>();
    const received: number[] = [];

    bus.on('test:add', ({ value }) => {
      received.push(value);
    });

    bus.dispatch('test:add', { value: 42 });

    expect(received).toEqual([42]);
  });

  it('supports multiple listeners on the same port', () => {
    interface TestPorts {
      'test:ping': {};
    }

    const bus = createBus<TestPorts>();
    const logs: string[] = [];

    bus.on('test:ping', () => logs.push('a'));
    bus.on('test:ping', () => logs.push('b'));

    bus.dispatch('test:ping', {});

    expect(logs).toEqual(['a', 'b']);
  });

  it('unsubscribe stops receiving', () => {
    interface TestPorts {
      'test:msg': { text: string };
    }

    const bus = createBus<TestPorts>();
    const received: string[] = [];

    const unsub = bus.on('test:msg', ({ text }) => {
      received.push(text);
    });

    bus.dispatch('test:msg', { text: 'first' });
    unsub();
    bus.dispatch('test:msg', { text: 'second' });

    expect(received).toEqual(['first']);
  });

  it('does not leak events across different port types', () => {
    interface TestPorts {
      'test:a': { data: string };
      'test:b': { data: number };
    }

    const bus = createBus<TestPorts>();
    let aCalled = false;
    let bCalled = false;

    bus.on('test:a', () => { aCalled = true; });
    bus.on('test:b', () => { bCalled = true; });

    bus.dispatch('test:a', { data: 'hello' });

    expect(aCalled).toBe(true);
    expect(bCalled).toBe(false);
  });
});

describe('createPort', () => {
  it('proves strings are valid port keys at compile time', () => {
    interface AppPorts {
      'app:login': { username: string };
      'app:logout': {};
    }

    const port = createPort<AppPorts>();
    const LOGIN = port('app:login');
    const LOGOUT = port('app:logout');

    expect(LOGIN).toBe('app:login');
    expect(LOGOUT).toBe('app:logout');
  });
});

describe('deterministic behavior', () => {
  it('creates isolated bus instances', () => {
    interface TestPorts {
      'test:x': { v: number };
    }

    const busA = createBus<TestPorts>();
    const busB = createBus<TestPorts>();
    const aReceived: number[] = [];
    const bReceived: number[] = [];

    busA.on('test:x', ({ v }) => aReceived.push(v));
    busB.on('test:x', ({ v }) => bReceived.push(v));

    busA.dispatch('test:x', { v: 1 });
    busB.dispatch('test:x', { v: 2 });

    expect(aReceived).toEqual([1]);
    expect(bReceived).toEqual([2]);
  });
});
