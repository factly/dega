import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Menu from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../actions/menu', () => ({
  getMenus: jest.fn(),
}));
let state = {
  menus: {
    req: [
      {
        data: [1],
        query: {
          page: 1,
          limit: 5,
        },
        total: 1,
      },
    ],
    details: {
      1: {
        id: 1,
        name: 'Menu 1',
      },
    },
    loading: false,
  },
  spaces: {
    orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11' },
    },
    loading: false,
    selected: 11,
  },
};
describe('Menu component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn();
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    let state2 = {
      menus: {
        req: [],
        details: {},
        loading: false,
      },
      spaces: {
        orgs: [{ id: 1, organisation: 'Organisation 1', spaces: [11] }],
        details: {
          11: { id: 11, name: 'Space 11' },
        },
        loading: false,
        selected: 11,
      },
    };
    store = mockStore(state2);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Menu
            permission={{
              actions: ['admin'],
            }}
          />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data', () => {
    store = mockStore(state);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Menu
            permission={{
              actions: ['admin'],
            }}
          />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
