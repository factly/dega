import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useDispatch, Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../matchMedia.mock';
import EditPolicy from './edit';
import { shallow } from 'enzyme';

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
      policies: {
        req: [],
        details: {
          '1': {
            id: 1,
            name: 'policy',
            description: 'description',
            permissions: [
              {
                resource: 'category',
                actions: ['create'],
              },
            ],
          },
        },
        loading: false,
      },
      authors: {
        req: [{ query: { page: 1 }, total: 1, data: [1] }],
        details: { 1: { id: 1, name: 'Author', email: 'author@aut.co' } },
        loading: false,
      },
    });
    store.dispatch = jest.fn(() => ({}));
    mockedDispatch = jest.fn();
    useDispatch.mockReturnValue(mockedDispatch);
  });
  it('should render the component', () => {
    let tree;
    act(() => {
      tree = shallow(
        <Provider store={store}>
          <EditPolicy />
        </Provider>,
      );
    });
    expect(tree).toMatchSnapshot();
  });
  it('should match component with empty data', () => {
    let tree;
    store = mockStore({
      policies: {
        req: [],
        details: {},
        loading: false,
      },
      authors: {
        req: [],
        details: {},
        loading: false,
      },
    });
    act(() => {
      tree = shallow(
        <Provider store={store}>
          <EditPolicy />
        </Provider>,
      );
    });
    expect(tree).toMatchSnapshot();
  });
  it('should match skeleton while loading', () => {
    let tree;
    store = mockStore({
      policies: {
        req: [],
        details: {},
        loading: true,
      },
      authors: {
        req: [],
        details: {},
        loading: false,
      },
    });
    act(() => {
      tree = shallow(
        <Provider store={store}>
          <EditPolicy />
        </Provider>,
      );
    });
    expect(tree).toMatchSnapshot();
  });
});
