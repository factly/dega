import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import PolicyList from './PolicyList';
import { getPolicies, deletePolicy } from '../../../actions/policies';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;
const setFilters = jest.fn();
const fetchPolicies = jest.fn();
const filters = {
  page: 1,
  limit: 20,
};
let info = {
  policies: [
    {
      id: '1',
      name: 'Test',
      description: '',
      permissions: [
        {
          resource: 'tags',
          actions: ['get'],
        },
      ],
      users: [
        {
          id: 1,
          created_at: '2020-09-23T11:06:11.308302Z',
          updated_at: '2020-09-23T11:36:09.244259Z',
          deleted_at: null,
          email: 'ross@gmail.com',
          first_name: 'Ross',
          last_name: 'Geller',
          birth_date: '1997-12-23T17:05:55+05:30',
          gender: 'male',
        },
      ],
    },
  ],
  total: 1,
  loading: false,
};
let state = {
  policies: {
    req: [
      {
        data: ['1', '2'],
        query: {
          page: 1,
          limit: 20,
        },
        total: 2,
      },
    ],
    details: {
      1: {
        id: '1',
        name: 'Test',
        description: '',
        permissions: [
          {
            resource: 'tags',
            actions: ['get'],
          },
        ],
        users: [
          {
            id: 1,
            created_at: '2020-09-23T11:06:11.308302Z',
            updated_at: '2020-09-23T11:36:09.244259Z',
            deleted_at: null,
            email: 'ross@gmail.com',
            first_name: 'Ross',
            last_name: 'Geller',
            birth_date: '1997-12-23T17:05:55+05:30',
            gender: 'male',
          },
        ],
      },
      2: {
        id: '2',
        name: 'Test-2',
        description: '',
        permissions: [
          {
            resource: 'categories',
            actions: ['get'],
          },
        ],
        users: [
          {
            id: 2,
            created_at: '2020-10-23T11:06:11.308302Z',
            updated_at: '2020-10-23T11:36:09.244259Z',
            deleted_at: null,
            email: 'ross2@gmail.com',
            first_name: 'Ross',
            last_name: 'Geller',
            birth_date: '1995-12-23T17:05:55+05:30',
            gender: 'male',
          },
        ],
      },
    },
    loading: false,
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/policies', () => ({
  getPolicies: jest.fn(),
  deletePolicy: jest.fn(),
}));

describe('Policies List component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render the component', () => {
      store = mockStore(state);
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <PolicyList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.policies.loading = true;
      store = mockStore(state);
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <PolicyList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with policies', () => {
      state.policies.loading = false;
      store = mockStore(state);
      const tree = shallow(
        <Provider store={store}>
          <Router>
            <PolicyList actions={['update', 'delete']} />
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
              <PolicyList
                setFilters={setFilters}
                fetchPolicies={fetchPolicies}
                filters={filters}
                data={info}
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
    it('should delete policy', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PolicyList
                setFilters={setFilters}
                fetchPolicies={fetchPolicies}
                filters={filters}
                data={info}
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
      expect(deletePolicy).toHaveBeenCalled();
      expect(deletePolicy).toHaveBeenCalledWith('1');
      //  expect(getPolicies).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
    it('should edit policy', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PolicyList
                setFilters={setFilters}
                fetchPolicies={fetchPolicies}
                filters={filters}
                data={info}
                actions={['update', 'delete']}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.text()).toEqual('Test');
      expect(link.prop('to')).toEqual('/members/policies/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        policies: {
          req: [],
        },
      });
      let wrapper;
      const info2 = { ...info };
      info2.policies = [];
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PolicyList
                setFilters={setFilters}
                fetchPolicies={fetchPolicies}
                filters={filters}
                data={info2}
                actions={['update', 'delete']}
              />
            </Router>
          </Provider>,
        );
      });

      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
    });
  });
});
