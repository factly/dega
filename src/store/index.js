import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

const configureStore = (initialState = {}) => {
  const middleware = [thunk];
  const store = createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware)),
  );

  return store;
};

export default configureStore;
