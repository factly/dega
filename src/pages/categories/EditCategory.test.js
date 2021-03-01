import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';

import '../../matchMedia.mock';
import EditCategory from './EditCategory';
import * as actions from '../../actions/categories';
import CategoryEditForm from './components/CategoryForm';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('@editorjs/editorjs');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../actions/categories', () => ({
  getCategories: jest.fn(),
  addCategory: jest.fn(),
  getCategory: jest.fn(),
  updateCategory: jest.fn(),
}));

describe('Categories Edit component', () => {
  let store;
  let mockedDispatch;
  store = mockStore({
    categories: {
      req: [
        {
          data: [1, 2],
          query: {
            page: 1,
          },
          total: 2,
        },
      ],
      details: {
        '1': {
          id: 1,
          created_at: '2020-07-17T10:14:44.251814Z',
          updated_at: '2020-07-17T10:14:44.251814Z',
          deleted_at: null,
          name: 'category-1',
          slug: 'category-1',
          description: '',
          parent_id: 0,
          medium_id: 0,
          space_id: 1,
        },
        '2': {
          id: 2,
          created_at: '2020-07-17T10:14:48.173442Z',
          updated_at: '2020-07-17T10:14:48.173442Z',
          deleted_at: null,
          name: 'category-2',
          slug: 'category-2',
          description: '',
          parent_id: 0,
          medium_id: 0,
          space_id: 1,
        },
      },
      loading: true,
    },
    media: {
      req: [],
      details: {},
      loading: true,
    },
  });
  store.dispatch = jest.fn(() => ({}));
  mockedDispatch = jest.fn(() => Promise.resolve({}));
  useDispatch.mockReturnValue(mockedDispatch);

  describe('snapshot testing', () => {
    it('should render the component', () => {
      const tree = mount(
        <Provider store={store}>
          <EditCategory />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match component with empty data', () => {
      store = mockStore({
        categories: {
          req: [],
          details: {},
          loading: false,
        },
        media: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditCategory />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should match skeleton while loading', () => {
    
      store = mockStore({
        categories: {
          req: [],
          details: {},
          loading: true,
        },
      });
      const tree = mount(
        <Provider store={store}>
          <EditCategory />
        </Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
  describe('component testing', () => {
    let wrapper;
    beforeEach(() => {
      store = mockStore({
        categories: {
          req: [
            {
              data: [1, 2],
              query: {
                page: 1,
              },
              total: 2,
            },
          ],
          details: {
            '1': {
              id: 1,
              created_at: '2020-07-17T10:14:44.251814Z',
              updated_at: '2020-07-17T10:14:44.251814Z',
              deleted_at: null,
              name: 'category-1',
              slug: 'category-1',
              description: '',
              parent_id: 0,
              medium_id: 0,
              space_id: 1,
            },
            '2': {
              id: 2,
              created_at: '2020-07-17T10:14:48.173442Z',
              updated_at: '2020-07-17T10:14:48.173442Z',
              deleted_at: null,
              name: 'category-2',
              slug: 'category-2',
              description: '',
              parent_id: 0,
              medium_id: 0,
              space_id: 1,
            },
          },
          loading: false,
        },
        media: {
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
    });
    afterEach(() => {
      wrapper.unmount();
    });
    it('should call get action', () => {
      actions.getCategory.mockReset();
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditCategory />
          </Provider>,
        );
      });
      expect(actions.getCategory).toHaveBeenCalledWith('1');
    });
    it('should call updateCategory', (done) => {
      actions.updateCategory.mockReset();
      const push = jest.fn();
      useHistory.mockReturnValueOnce({ push });
      act(() => {
        wrapper = mount(
          <Provider store={store}>
            <EditCategory />
          </Provider>,
        );
      });
      wrapper.find(CategoryEditForm).props().onCreate({ test: 'test' });
      setTimeout(() => {
        expect(actions.updateCategory).toHaveBeenCalledWith({
          id: 1,
          created_at: '2020-07-17T10:14:44.251814Z',
          updated_at: '2020-07-17T10:14:44.251814Z',
          deleted_at: null,
          name: 'category-1',
          slug: 'category-1',
          description: '',
          parent_id: 0,
          medium_id: 0,
          space_id: 1,
          test: 'test',
        });
        expect(push).toHaveBeenCalledWith('/categories');
        done();
      }, 0);
    });
  });
});
