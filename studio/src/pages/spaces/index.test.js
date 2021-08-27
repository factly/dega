import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import SpacesList from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));

jest.mock('../../actions/spaces', () => ({
  getSpaces: jest.fn(),
  addSpace: jest.fn(),
}));

describe('Spaces List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    store = mockStore({
      spaces: {
        details: {},
        orgs: [],
        selected: 0,
      },
    });
    const tree = mount(
      <Provider store={store}>
        <Router>
          <SpacesList />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data', () => {
    store = mockStore({
      spaces: {
        details: {
          1: {
            id: 1,
            organisation_id: 1,
            name: 'name',
            slug: 'name',
          },
        },
        orgs: [
          {
            id: 1,
            permission: {
              role: 'owner',
            },
            spaces: [1],
          },
        ],
        selected: 1,
        loading: false,
      },
    });
    const tree = mount(
      <Provider store={store}>
        <Router>
          <SpacesList />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
