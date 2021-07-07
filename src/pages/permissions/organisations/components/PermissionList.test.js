import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Table, Button, Popconfirm } from 'antd';

import '../../../../matchMedia.mock';
import PermissionList from './PermissionList';
import { getOrganisations, deleteOrganisationPermission } from '../../../../actions/organisations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  organisations: {
    req: [
      {
        data: [1, 2, 3, 4],
        query: {
          page: 1,
          limit: 20,
        },
        total: 4,
      },
    ],
    details: {
      1: {
        id: 1,
        title: 'Org 1',
        permission: {
          id: 2,
          organisation_id: 1,
          spaces: -1,
        },
      },
      2: {
        id: 2,
        title: 'Org 2',
        permission: {
          id: 3,
          organisation_id: 2,
          spaces: 4,
        },
      },
      3: {
        id: 1,
        title: 'Org 3',
      },
      4: {
        id: 4,
        title: 'Org 4',
        permission: {
          id: 5,
          organisation_id: 4,
        },
      },
    },
    loading: false,
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../../actions/organisations', () => ({
  getOrganisations: jest.fn(),
  deleteOrganisationPermission: jest.fn(),
}));

describe('Organisation Permission List component ', () => {
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
            <PermissionList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the component with no data', () => {
      store = mockStore({
        organisations: {
          req: [],
          details: {},
          loading: false,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PermissionList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.organisations.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PermissionList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with organisations', () => {
      state.organisations.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <PermissionList />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(getOrganisations).toHaveBeenCalledWith({ page: 1, limit: 20 });
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
              <PermissionList />
            </Router>
          </Provider>,
        );
      });

      const table = wrapper.find(Table);
      table.props().pagination.onChange(3);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(3);
      setTimeout(() => {
        expect(mockedDispatch).toHaveBeenCalledTimes(1);
        expect(getOrganisations).toHaveBeenCalledWith({ page: 3, limit: 20 });
      }, 0);
    });
    it('should delete organisation permission', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <PermissionList />
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
      expect(deleteOrganisationPermission).toHaveBeenCalled();
      expect(deleteOrganisationPermission).toHaveBeenCalledWith(2);
      expect(getOrganisations).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });
});
