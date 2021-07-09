import React from 'react';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import '../../matchMedia.mock';
import CreateWebhook from './CreateWebhook';
import * as actions from '../../actions/webhooks';
import WebhookCreateForm from './components/WebhookForm';

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

describe('Webhook create component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
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
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);
  describe('snapshot testing', () => {
    it('should render the component', () => {
      let tree;
      act(() => {
        tree = mount(
          <Provider store={store}>
            <CreateWebhook />
          </Provider>,
        );
      });
      expect(tree).toMatchSnapshot();
      tree.unmount();
    });
  });
  describe('component testing', () => {
    let wrapper;
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call addWebhook', (done) => {
      actions.addWebhook.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CreateWebhook />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(WebhookCreateForm).props().onCreate({ id: 1, name: 'test', url: 'url' });
      setTimeout(() => {
        expect(actions.addWebhook).toHaveBeenCalledWith({ id: 1, name: 'test', url: 'url' });
        done();
      }, 0);
    });
  });
});
