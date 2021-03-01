import React from 'react';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Table } from 'antd';
 
import '../../../../matchMedia.mock';
import PermissionList from './PermissionList';
import { getOrganisations } from '../../../../actions/organisations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  organisations: {
    req: [
      { 
        data: [1,2],
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
        title: 'Org 1',
        permission : {
          id: 2,
          organisation_id: 1,
          spaces: 2,
        },
      },
      '2': {
        id: 2,
        title: 'Org 2',
        permission : {
          id: 3,
          organisation_id: 2,
          spaces: 4,
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
            <PermissionList />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.organisations.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <PermissionList />
        </Provider>
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with organisations', () => {
      state.organisations.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store = {store}>
          <PermissionList />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(getOrganisations).toHaveBeenCalledWith({ page: 1, limit: 5});
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
            <PermissionList />
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
        expect(getOrganisations).toHaveBeenCalledWith({ page: 3, limit: 5});
      }, 0);
    });
  })
});