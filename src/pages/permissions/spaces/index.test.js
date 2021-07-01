import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../../matchMedia.mock';

import SpacePermission from './index';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../../actions/spacePermissions', () => ({
  getSpaces: jest.fn(),
}));
let state = {
  spacePermissions: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 5,
        },
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        name: 'Space 1',
        organisation_id: 9,
        permission: {
          id: 1,
          fact_check: true,
          media: -1,
          posts: -1,
        },
      },
      2: {
        id: 2,
        name: 'Space 2',
        organisation_id: 4,
        permission: {
          id: 2,
          fact_check: false,
          media: 20,
          posts: 20,
        },
      },
    },
    loading: false,
  },
  admin: {
    organisation: {
      id: 2,
      spaces: 4,
      is_admin: true,
    },
    loading: false,
  },
};
describe('Space Permission component', () => {
  let store;
  let mockedDispatch;
  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    const state2 = {
      spacePermissions: {
        req: [],
        details: {},
        loading: false,
      },
      admin: {
        organisation: {
          id: 2,
          spaces: 4,
          is_admin: true,
        },
        loading: false,
      },
    };
    store = mockStore(state2);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <SpacePermission />
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
          <SpacePermission />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with not admin', () => {
    const state2 = {
      spacePermissions: {
        req: [
          {
            data: [1, 2],
            query: {
              page: 1,
              limit: 5,
            },
            total: 2,
          },
        ],
        details: {
          1: {
            id: 1,
            name: 'Space 1',
            organisation_id: 9,
            permission: {
              id: 1,
              fact_check: true,
              media: -1,
              posts: -1,
            },
          },
          2: {
            id: 2,
            name: 'Space 2',
            organisation_id: 4,
            permission: {
              id: 2,
              fact_check: false,
              media: 20,
              posts: 20,
            },
          },
        },
        loading: false,
      },
      admin: {
        organisation: {
          id: 2,
          spaces: 4,
        },
        loading: false,
      },
    };
    store = mockStore(state2);
    const tree = mount(
      <Provider store={store}>
        <Router>
          <SpacePermission />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
