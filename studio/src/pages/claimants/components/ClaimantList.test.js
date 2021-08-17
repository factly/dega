import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import ClaimantList from './ClaimantList';
import { getClaimants, deleteClaimant } from '../../../actions/claimants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

const filters = {
  page: 1,
  limit: 20,
};
const setFilters = jest.fn();
const fetchClaimants = jest.fn();
const info = {
  claimants: [
    {
      id: 1,
      created_at: '2020-09-09T06:51:15.770644Z',
      updated_at: '2020-09-09T06:51:15.770644Z',
      deleted_at: null,
      name: 'Whatsapp',
      slug: 'whatsapp',
      description: '',
      tag_line: '',
      medium_id: 0,
      space_id: 1,
    },
    {
      id: 2,
      created_at: '2020-09-09T06:51:22.237778Z',
      updated_at: '2020-09-09T06:51:22.237778Z',
      deleted_at: null,
      name: 'Facebook',
      slug: 'facebook',
      description: '',
      tag_line: '',
      medium_id: 0,
      space_id: 1,
    },
  ],
  total: 2,
  loading: false,
};
let state = {
  claimants: {
    req: [
      {
        data: [1, 2],
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
        created_at: '2020-09-09T06:51:15.770644Z',
        updated_at: '2020-09-09T06:51:15.770644Z',
        deleted_at: null,
        name: 'Whatsapp',
        slug: 'whatsapp',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
      2: {
        id: 2,
        created_at: '2020-09-09T06:51:22.237778Z',
        updated_at: '2020-09-09T06:51:22.237778Z',
        deleted_at: null,
        name: 'Facebook',
        slug: 'facebook',
        description: '',
        tag_line: '',
        medium_id: 0,
        space_id: 1,
      },
    },
    loading: false,
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/claimants', () => ({
  getClaimants: jest.fn(),
  deleteClaimant: jest.fn(),
}));

describe('Claimants List component', () => {
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
            <ClaimantList
              actions={['update', 'delete']}
              data={{ claimants: [], total: 0, loading: false }}
              filters={filters}
              setFilters={setFilters}
              fetchClaimants={fetchClaimants}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.claimants.loading = true;
      const info2 = {
        claimants: [
          {
            id: 1,
            created_at: '2020-09-09T06:51:15.770644Z',
            updated_at: '2020-09-09T06:51:15.770644Z',
            deleted_at: null,
            name: 'Whatsapp',
            slug: 'whatsapp',
            description: '',
            tag_line: '',
            medium_id: 0,
            space_id: 1,
          },
          {
            id: 2,
            created_at: '2020-09-09T06:51:22.237778Z',
            updated_at: '2020-09-09T06:51:22.237778Z',
            deleted_at: null,
            name: 'Facebook',
            slug: 'facebook',
            description: '',
            tag_line: '',
            medium_id: 0,
            space_id: 1,
          },
        ],
        total: 2,
        loading: true,
      };
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ClaimantList
              actions={['update', 'delete']}
              data={info2}
              filters={filters}
              setFilters={setFilters}
              fetchClaimants={fetchClaimants}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with claimants', () => {
      state.claimants.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <ClaimantList
              actions={['update', 'delete']}
              data={info}
              filters={filters}
              setFilters={setFilters}
              fetchClaimants={fetchClaimants}
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
              <ClaimantList
                actions={['update', 'delete']}
                data={info}
                filters={{ page: 1, limit: 1 }}
                setFilters={setFilters}
                fetchClaimants={fetchClaimants}
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
    it('should delete claimant', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimantList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchClaimants={fetchClaimants}
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
      setTimeout(() => {
        expect(deleteClaimant).toHaveBeenCalled();
        expect(deleteClaimant).toHaveBeenCalledWith(1);
        expect(getClaimants).toHaveBeenCalledWith({ page: 1, limit: 20 });
      });
    });
    it('should edit claimant', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimantList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchClaimants={fetchClaimants}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.text()).toEqual('Whatsapp');
      expect(link.prop('to')).toEqual('/claimants/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        claimants: {
          req: [],
        },
      });
      const info2 = {
        claimants: [],
        total: 0,
        loading: false,
      };
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <ClaimantList
                actions={['update', 'delete']}
                data={info2}
                filters={filters}
                setFilters={setFilters}
                fetchClaimants={fetchClaimants}
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
