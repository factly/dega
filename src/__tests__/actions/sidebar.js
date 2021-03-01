import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/sidebar';
import * as types from '../../constants/sidebar';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const initialState = {
  collapsed: false,
};

describe('sidebar reducer', () => {
  it('should create an action to SET_COLLAPSE to true',() => {
    const collapsed  =  true;
    const setCollapseAction = [
      {
      type: types.SET_COLLAPSE,
      payload: true,
      }
    ];
    const store = mockStore({ initialState });
    store.dispatch(actions.setCollapse(collapsed))
    expect(store.getActions()).toEqual(setCollapseAction);
  });
  it('should create an action to SET_COLLAPSE to false',() => {
    const collapsed  =  false;
    const setCollapseAction = [
      {
      type: types.SET_COLLAPSE,
      payload: false,
      }
    ];
    const store = mockStore({ initialState });
    store.dispatch(actions.setCollapse(collapsed))
    expect(store.getActions()).toEqual(setCollapseAction);
  });
})