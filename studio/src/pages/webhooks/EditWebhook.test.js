import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import EditWebhook from './EditWebhook';
import * as actions from '../../actions/webhooks';
import WebhookEditForm from './components/WebhookForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/webhooks', () => ({
  getWebhooks: jest.fn(),
  addWebhook: jest.fn(),
  getWebhook: jest.fn(),
  updateWebhook: jest.fn(),
}));

let state = {
  webhooks: {
    req: [],
    details: {},
    loading: false,
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

describe('Webhook edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore(state);
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <EditWebhook />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
      let tree;
      store = mockStore({
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
      });
      act(() => {
        tree = mount(
          <Provider store={store}>
            <Router>
              <EditWebhook />
            </Router>
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    state.webhooks = {
      req: [],
      details: {
        1: {
          id: 1,
          name: 'webhook-1',
          url: 'url',
          events: [1],
        },
      },
      loading: false,
    };
    beforeEach(() => {
      store = mockStore(state);
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getWebhook.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditWebhook />
            </Router>
          </Provider>,
        );
      });
      expect(actions.getWebhook).toHaveBeenCalledWith('1');
    });
    it('should call updateWebhook', (done) => {
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      actions.updateWebhook.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditWebhook />
            </Router>
          </Provider>,
        );
      });

      wrapper.find(WebhookEditForm).props().onCreate({ url: 'newurl' });
      setTimeout(() => {
        expect(actions.updateWebhook).toHaveBeenCalledWith({
          id: 1,
          name: 'webhook-1',
          url: 'newurl',
          events: [1],
        });
        expect(push).toHaveBeenCalledWith('/webhooks/1/edit');
        done();
      }, 0);
    });
    it('should display RecordNotFound if webhook not found', () => {
      state.webhooks = {
        req: [],
        details: {
          2: {
            id: 2,
            name: 'webhook-2',
            url: 'url2',
          },
        },
        loading: false,
      };
      store = mockStore(state);
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <EditWebhook />
            </Router>
          </Provider>,
        );
      });
      expect(wrapper.find('RecordNotFound').length).toBe(1);
      expect(wrapper.find(WebhookEditForm).length).toBe(0);
    });
  });
});
