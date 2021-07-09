import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Dashboard from './index';
import { getInfo } from '../../actions/info';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../actions/info', () => ({
  getInfo: jest.fn(),
}));
jest.mock('./components/Features', () => {
  const Features = () => <div />;
  return Features;
});

let store, mockedDispatch;
let state = {
  spaces: {
    orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11', permissions: [{ resource: 'admin', actions: ['admin'] }] },
    },
    loading: false,
    selected: 11,
  },
  info: {
    categories: 5,
    episodes: 4,
    podcasts: 2,
    article: {
      draft: 38,
      template: 3,
      publish: 21,
      ready: 13,
    },
    factCheck: {
      draft: 31,
      template: 6,
      publish: 5,
      ready: 4,
    },
    posts: [],
    tags: 10,
  },
};

describe('Dashboard component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Dashboard />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getInfo).toHaveBeenCalled();
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should hide default feature option if not admin', () => {
      const state2 = { ...state };
      state2.spaces.details = {
        11: { id: 11, name: 'Space 11' },
      };
      const store2 = mockStore(state2);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store2}>
            <Router>
              <Dashboard />
            </Router>
          </Provider>,
        );
      });
    });
  });
});
