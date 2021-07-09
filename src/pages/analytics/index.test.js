import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import '../../matchMedia.mock';
import Analytics from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

let state = {
  spaces: {
    orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
    details: {
      11: {
        id: 11,
        name: 'Space 11',
        analytics: {
          plausible: {
            domain: 'domain',
            embed_code: 'embed-code',
            server_url: 'url',
          },
        },
      },
    },
    loading: false,
    selected: 11,
  },
};

describe('Analytics Component', () => {
  let store;
  let mockedDispatch;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Analytics />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component when loading', () => {
      const state2 = { ...state };
      state2.spaces.loading = true;
      const store2 = mockStore(state2);
      const tree = mount(
        <Provider store={store2}>
          <Router>
            <Analytics />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });

  it('should render the component when no embed_code found', () => {
    const state2 = { ...state };
    state2.spaces = {
      orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
      details: {
        11: {
          id: 11,
          name: 'Space 11',
          analytics: {
            plausible: {
              domain: 'domain',
              server_url: 'url',
            },
          },
        },
      },
      loading: false,
      selected: 11,
    };
    const store2 = mockStore(state2);
    const tree = mount(
      <Provider store={store2}>
        <Router>
          <Analytics />
        </Router>
      </Provider>,
    );
    expect(tree).toMatchSnapshot();
  });
});
