import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import Webhooks from './index';
import { mount } from 'enzyme';
import { getWebhooks } from '../../actions/webhooks';

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

jest.mock('../../actions/webhooks', () => ({
  getWebhooks: jest.fn(),
  addWebhook: jest.fn(),
}));
let state = {
  webhooks: {
    req: [],
    details: {},
    loading: true,
  },
  events: {
    req: [],
    details: {},
    loading: true,
  },
  spaces: {
    orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
    details: {
      11: { id: 11, name: 'Space 11' },
    },
    loading: false,
    selected: 11,
  },
};
describe('Webhook component', () => {
  let store;
  let mockedDispatch;
  beforeEach(() => {
    store = mockStore(state);
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <Router>
            <Webhooks permission={{ actions: ['admin'] }} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with data', () => {
      const store2 = mockStore({
        webhooks: {
          req: [
            {
              data: [1],
              query: {
                page: 1,
                limit: 20,
              },
              total: 1,
            },
          ],
          details: {
            1: {
              id: 1,
              name: 'Webhook-1',
              events: [1],
              url: 'url',
            },
          },
          loading: false,
        },
        events: {
          req: [],
          details: {
            1: {
              id: 1,
              name: 'event',
            },
          },
        },
        spaces: {
          orgs: [{ id: 1, organazation: 'Organization 1', spaces: [11] }],
          details: {
            11: { id: 11, name: 'Space 11' },
          },
          loading: false,
          selected: 11,
        },
        sidebar: {
          collapsed: false,
        },
      });
      const tree = mount(
        <Provider store={store2}>
          <Router>
            <Webhooks permission={{ actions: ['admin'] }} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(getWebhooks).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });
});
