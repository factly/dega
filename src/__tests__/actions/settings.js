import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/settings';
import * as types from '../../constants/settings';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const initialState = {};

describe('settings actions', () => {
  it('should create an action to toggle slider', () => {
    const toggleSiderActions = [
      {
        type: types.TOGGLE_SIDER,
      },
    ];
    const store = mockStore({ initialState });
    store.dispatch(actions.toggleSider());
    expect(store.getActions()).toEqual(toggleSiderActions);
  });
});
