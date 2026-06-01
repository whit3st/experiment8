import { createBus, createPort } from '../typed-bus/dist/index.js';
import { createStore } from '../typed-store/dist/index.js';

const countNode = document.querySelector('#count');
const incrementButton = document.querySelector('#increment');
const resetButton = document.querySelector('#reset');

const bus = createBus();
const port = createPort();

const INCREMENT_CLICKED = port('counter:increment-clicked');
const RESET_CLICKED = port('counter:reset-clicked');

const store = createStore(counterReducer, { count: 0 });

bus.on(INCREMENT_CLICKED, () => {
  store.dispatch({ type: 'counter/increment' });
});

bus.on(RESET_CLICKED, () => {
  store.dispatch({ type: 'counter/reset' });
});

incrementButton.addEventListener('click', () => {
  bus.dispatch(INCREMENT_CLICKED, undefined);
});

resetButton.addEventListener('click', () => {
  bus.dispatch(RESET_CLICKED, undefined);
});

store.subscribe(render);
render(store.getState());

function counterReducer(state, action) {
  switch (action.type) {
    case 'counter/increment':
      return { count: state.count + 1 };
    case 'counter/reset':
      return { count: 0 };
    default:
      return state;
  }
}

function render(state) {
  countNode.textContent = String(state.count);
}
