import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Popconfirm, Button, Table } from 'antd';

import '../../../matchMedia.mock';
import CategoriesList from './CategoryList';
import { deleteCategory } from '../../../actions/categories';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let mockedDispatch, store;

const info = {
  total: 2,
  loading: false,
  categories: [
    {
      id: 1,
      created_at: '2020-09-09T06:49:36.566567Z',
      updated_at: '2020-09-09T06:49:36.566567Z',
      deleted_at: null,
      name: 'Andhra Pradesh',
      slug: 'andhra-pradesh',
      description: '',
      parent_id: 0,
      medium_id: 0,
      space_id: 1,
      posts: null,
    },
    {
      id: 2,
      created_at: '2020-09-09T06:49:54.027402Z',
      updated_at: '2020-09-09T06:49:54.027402Z',
      deleted_at: null,
      name: 'Telangana',
      slug: 'telangana',
      description: '',
      parent_id: 0,
      medium_id: 0,
      space_id: 1,
      posts: null,
    },
  ],
};
const filters = {
  page: 1,
  limit: 20,
};
const setFilters = jest.fn();
const fetchCategories = jest.fn();
let state = {
  categories: {
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
        created_at: '2020-09-09T06:49:36.566567Z',
        updated_at: '2020-09-09T06:49:36.566567Z',
        deleted_at: null,
        name: 'Andhra Pradesh',
        slug: 'andhra-pradesh',
        description: '',
        parent_id: 0,
        medium_id: 0,
        space_id: 1,
        posts: null,
      },
      2: {
        id: 2,
        created_at: '2020-09-09T06:49:54.027402Z',
        updated_at: '2020-09-09T06:49:54.027402Z',
        deleted_at: null,
        name: 'Telangana',
        slug: 'telangana',
        description: '',
        parent_id: 0,
        medium_id: 0,
        space_id: 1,
        posts: null,
      },
    },
    loading: false,
  },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('../../../actions/categories', () => ({
  getCategories: jest.fn(),
  deleteCategory: jest.fn(),
}));

describe('Categories List component', () => {
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
            <CategoriesList
              actions={['update', 'delete']}
              data={{ categories: [], loading: false, total: 0 }}
              filters={filters}
              setFilters={setFilters}
              fetchCategories={fetchCategories}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component when loading', () => {
      state.categories.loading = true;
      store = mockStore(state);
      const info2 = { ...info };
      info2.loading = true;
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CategoriesList
              actions={['update', 'delete']}
              data={info2}
              filters={filters}
              setFilters={setFilters}
              fetchCategories={fetchCategories}
            />
          </Router>
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with categories', () => {
      state.categories.loading = false;
      store = mockStore(state);
      const tree = mount(
        <Provider store={store}>
          <Router>
            <CategoriesList
              actions={['update', 'delete']}
              data={info}
              filters={filters}
              setFilters={setFilters}
              fetchCategories={fetchCategories}
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
              <CategoriesList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchCategories={fetchCategories}
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
    it('should delete category', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CategoriesList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchCategories={fetchCategories}
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
      expect(deleteCategory).toHaveBeenCalled();
      expect(deleteCategory).toHaveBeenCalledWith(1);
    });
    it('should edit category', () => {
      store = mockStore(state);
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CategoriesList
                actions={['update', 'delete']}
                data={info}
                filters={filters}
                setFilters={setFilters}
                fetchCategories={fetchCategories}
              />
            </Router>
          </Provider>,
        );
      });
      const link = wrapper.find(Link).at(0);
      expect(link.text()).toEqual('Andhra Pradesh');
      expect(link.prop('to')).toEqual('/categories/1/edit');
    });
    it('should have no delete and edit buttons', () => {
      store = mockStore({
        categories: {
          req: [],
        },
      });
      let wrapper;
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <Router>
              <CategoriesList
                actions={['update', 'delete']}
                data={{ categories: [], loading: false, total: 0 }}
                filters={filters}
                setFilters={setFilters}
                fetchCategories={fetchCategories}
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
