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
const setFilters = jest.fn();
const fetchWebhooks = () => {
  dispatch(getWebhooks(filters));
};
let store, mockedDispatch;
let data = {
  webhooks: [
    {
      id: 2,
      created_at: '2020-09-25T07:24:11.008257Z',
      updated_at: '2020-09-25T07:24:11.008257Z',
      deleted_at: null,
      name: 'Webhook2',
      url: 'webhook2url',
      events: [1],
    },
    {
      id: 1,
      created_at: '2020-09-25T07:23:38.40006Z',
      updated_at: '2020-09-25T07:23:38.40006Z',
      deleted_at: null,
      name: 'Webhook1',
      url: 'webhook1url',
      events: [1],
      enabled: true,
    },
  ],
  total: 2,
  loading: false,
};
let filters = {
  page: 1,
  limit: 20,
};

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
            <WebhookList
              setFilters={setFilters}
              filters={filters}
              data={data}
              actions={['update', 'delete']}
            />
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
            <WebhookList
              setFilters={setFilters}
              filters={filters}
              data={data}
              actions={['update', 'delete']}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
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
              <WebhookList
                setFilters={setFilters}
                filters={filters}
                data={data}
                actions={['update', 'delete']}
              />
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
              <WebhookList
                fetchWebhooks={fetchWebhooks}
                setFilters={setFilters}
                filters={filters}
                data={data}
                actions={['update', 'delete']}
              />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button).at(0);
      expect(button.text()).toEqual('');

      button.simulate('click');
      const popconfirm = wrapper.find(Popconfirm);
      popconfirm
        .findWhere((item) => item.type() === 'button' && item.text() === 'OK')
        .simulate('click');

      expect(deleteWebhook).toHaveBeenCalled();
      expect(deleteWebhook).toHaveBeenCalledWith(2);
    });
    it('should edit webhook', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <WebhookList
                setFilters={setFilters}
                filters={filters}
                data={data}
                actions={['update', 'delete']}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.text()).toEqual('Webhook2');
      expect(link.prop('to')).toEqual('/advanced/webhooks/2/edit');
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
              <WebhookList
                setFilters={setFilters}
                filters={filters}
                data={{ webhooks: [], loading: false, total: 0 }}
                actions={['update', 'delete']}
              />
            </Router>
          </Provider>,
        );
      });

      const button = wrapper.find('Button');
      expect(button.length).toEqual(0);
    });
  });
});
