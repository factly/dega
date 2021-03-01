import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Table } from 'antd';

import '../../../../matchMedia.mock';
import PermissionList from './PermissionList';
import { getSpaces } from '../../../../actions/spacePermissions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  spacePermissions: {
    req: [
      {
        data: [1, 2],
        query: {
          page: 1,
          limit: 5,
        },
        total: 2,
      },
    ],
    details: {
      '1': {
        id: 1,
        name: 'Space 1',
        organisation_id: 9,
        permission: {
          id: 1,
          fact_check: true,
          media: -1,
          posts: -1,  
        }, 
      },
      '2': {
        id: 2,
        name: 'Space 2',
        organisation_id: 4,
        permission: {
          id: 2,
          fact_check: false,
          media: 20,
          posts: 20,  
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
jest.mock('../../../../actions/spacePermissions', () => ({
  getSpaces: jest.fn(),
}));

describe('Space Permission List component', () => {
  describe('snapshot testing', () => {
    beforeEach(() => {
      store = mockStore({});
      store.dispatch = jest.fn();
      mockedDispatch = jest.fn();
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should render component', () => {
      store = mockStore(state);
      const tree = mount(
        <Provider store = {store}>
          <PermissionList />
        </Provider>
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.spacePermissions.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <PermissionList />
        </Provider>
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with spaces', () => {
      state.spacePermissions.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store = {store}>
          <PermissionList />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(getSpaces).toHaveBeenCalledWith({ page: 1, limit: 5});
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change page', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <PermissionList />
          </Provider>,
        );
      });
      const table = wrapper.find(Table);
      table.props().pagination.onChange(3);
      wrapper.update();
      const updatedTable = wrapper.find(Table);
      expect(updatedTable.props().pagination.current).toEqual(3);
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
    });
  });
});