import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import Policies from './index';
import { shallow } from 'enzyme';

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

jest.mock('../../actions/policies', () => ({
  getPolicies: jest.fn(),
  addPolicy: jest.fn(),
}));

describe('Policies List component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({
      spaces: {
        orgs: [{ id: 1, title: 'Org 1', spaces: [1] }],
        details: {
          1: {
            sid: 1,
            name: 'Space 1',
          }
        },
        loading: false,
        selected: 1,
      },
      policies: {
        req: [{
          data: ['Editor'],
          query: {
            page: 1,
            limit: 5,
          },
          total: 1,
        }],
        details: {
          'Editor' : {
            id: 'Editor',
            users: [],
          }
        },
        loading: false,
      }
    });
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    store=mockStore({
      spaces: {
        orgs: [{ id: 1, title: 'Org 1', spaces: [1] }],
        details: {
          1: {
            sid: 1,
            name: 'Space 1',
          }
        },
        loading: false,
        selected: 1,
      },
      policies: {
        req: [],
        details: {},
        loading: false,
      }
    })
    const tree = mount(
      <Provider store={store}>
        <Router>
          <Policies permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
  it('should render the component with data', () => {
    const tree = shallow(
      <Provider store={store}>
        <Router>
          <Policies permission={{ actions: ['create'] }} />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
