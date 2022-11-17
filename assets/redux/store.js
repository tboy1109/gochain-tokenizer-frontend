import { createStore } from 'https://cdn.jsdelivr.net/npm/redux@^4.1.2/+esm'
import reducer from './reducers/index.js';

export const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()(1)
);