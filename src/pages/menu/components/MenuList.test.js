import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import MenuList from './MenuList';
import { getMenus, deleteMenu } from '../../../actions/menu';
import { deleteCategory } from '../../../actions/categories';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

let state = {
  menu: {
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
        name: 'Menu 1',
      },
      2: {
        id: 2,
        name: 'Menu 2',
      },
    },
    loading: false,
  },
};
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/menu', () => ({
  getMenus: jest.fn(),
  deleteMenu: jest.fn(),
}));

describe('Menu List component', () => {
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
            <MenuList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.menu.loading = true;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <MenuList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with menus', () => {
      state.menu.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <MenuList actions={['update', 'delete']} />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(getMenus).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });
  describe('component testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedDispatch = jest.fn(() => new Promise((resolve) => resolve(true)));
      useDispatch.mockReturnValue(mockedDispatch);
    });
    it('should change the page', () => {
      getMenus.mockReset();
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <MenuList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      wrapper.find(Table).props().pagination.onChange(2);
      wrapper.update();
      expect(wrapper.find(Table).props().pagination.current).toEqual(2);
    });
    it('should delete menu', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <MenuList actions={['update', 'delete']} />
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
      expect(deleteMenu).toHaveBeenCalled();
      expect(deleteMenu).toHaveBeenCalledWith(1);
      expect(getMenus).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
    it('should edit menu', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <MenuList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      const button = link.find(Button).at(0);
      expect(button.text(0)).toEqual('Edit');
      expect(link.prop('to')).toEqual('/menus/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        menu: {
          req: [],
          details: {},
          loading: false,
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <MenuList actions={['update', 'delete']} />
            </Router>
          </Provider>,
        );
      });
      const button = wrapper.find(Button);
      expect(button.length).toEqual(0);
      expect(wrapper.find('Empty').length).toBe(1);
    });
  });
});
