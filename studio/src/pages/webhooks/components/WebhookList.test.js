import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { Popconfirm, Button, Table } from 'antd';
import { act } from 'react-dom/test-utils';

import '../../../matchMedia.mock';
import WebhookList from './WebhookList';
import { getWebhooks, deleteWebhook } from '../../../actions/webhooks';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/webhooks', () => ({
  getWebhooks: jest.fn(),
  deleteWebhook: jest.fn(),
}));

let store, mockedDispatch;

let state = {
  webhooks: {
    req: [
      {
        data: [2, 1],
        query: {
          page: 1,
          limit: 20,
        },
        total: 2,
      },
    ],
    details: {
      1: {
        id: 1,
        created_at: '2020-09-25T07:23:38.40006Z',
        updated_at: '2020-09-25T07:23:38.40006Z',
        deleted_at: null,
        name: 'Webhook1',
        url: 'webhook1url',
        events: [1],
        enabled: true,
      },
      2: {
        id: 2,
        created_at: '2020-09-25T07:24:11.008257Z',
        updated_at: '2020-09-25T07:24:11.008257Z',
        deleted_at: null,
        name: 'Webhook2',
        url: 'webhook2url',
        events: [1],
      },
    },
    loading: false,
  },
  events: {
    req: [],
    loading: false,
    details: {
      1: {
        id: 1,
        name: 'event',
      },
    },
  },
};

describe('Webhook List component', () => {
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
            <WebhookList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.webhooks.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <WebhookList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with webhooks', () => {
      state.webhooks.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <WebhookList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);

      expect(getWebhooks).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <WebhookList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(1);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(1);
    });
    it('should delete webhook', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <WebhookList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(1);
      expect(button.text()).toEqual('Delete');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deleteWebhook).toHaveBeenCalled();
      expect(deleteWebhook).toHaveBeenCalledWith(2);
      expect(getWebhooks).toHaveBeenCalledWith({ page: 1 });
    });
    it('should edit webhook', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <WebhookList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text()).toEqual('Edit');
      expect(link.prop('to')).toEqual('/webhooks/2/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        webhooks: {
          req: [],
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <WebhookList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
