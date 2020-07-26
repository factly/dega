import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import EditCategory from './edit';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

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

describe('Categories List component', () => {
  let store;
  let mockedDispatch;

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
        loading: true,
      },
      media: {
        req: [],
        details: {},
        loading: true,
      },
    });
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    let component;
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditCategory />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match component with empty data', () => {
    let component;
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
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditCategory />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should match skeleton while loading', () => {
    let component;
    store = mockStore({
      categories: {
        req: [],
        details: {},
        loading: true,
      },
    });
    act(() => {
      component = renderer.create(
        <Provider store={store}>
          <EditCategory />
        </Provider>,
      );
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
