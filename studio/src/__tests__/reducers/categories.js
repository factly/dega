import reducer from '../../reducers/categoriesReducer';
import * as types from '../../constants/categories';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('categories reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, name: 'entity' } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, name: 'entity' } },
      loading: false,
    });
  });
  it('should handle RESET_CATEGORIES', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'category' }],
          loading: false,
        },
        {
          type: types.RESET_CATEGORIES,
          payload: {},
        },
      ),
    ).toEqual({
      req: [],
      loading: true,
      details: [{ id: 1, name: 'category' }],
    });
  });
  it('should handle SET_CATEGORIES_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_CATEGORIES_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_CATEGORIES_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_CATEGORIES_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CATEGORIES_REQUEST,
        payload: {
          data: [1, 2, 3],
          query: { page: 1, limit: 5 },
          total: 3,
        },
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_CATEGORIES_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_CATEGORIES_REQUEST,
          payload: {
            data: [1, 2, 3],
            query: { page: 1, limit: 5 },
            total: 3,
          },
        },
      ),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_CATEGORIES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CATEGORIES,
        payload: [
          { id: 1, name: 'Category 1' },
          { id: 2, name: 'Category 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'Category 1' }, 2: { id: 2, name: 'Category 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_CATEGORIES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CATEGORIES,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle GET_CATEGORY', () => {
    expect(
      reducer(initialState, {
        type: types.GET_CATEGORY,
        payload: { id: 1, name: 'new category' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new category' } },
      loading: true,
    });
  });
  it('should handle GET_CATEGORY when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing category' } },
          loading: false,
        },
        {
          type: types.GET_CATEGORY,
          payload: { id: 2, name: 'new category' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing category' },
        2: { id: 2, name: 'new category' },
      },
      loading: false,
    });
  });
  it('should handle UPDATE_CATEGORY when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing category' },
            2: { id: 2, name: 'new category' },
          },
          loading: false,
        },
        {
          type: types.UPDATE_CATEGORY,
          payload: { id: 2, name: 'updated category' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing category' },
        2: { id: 2, name: 'updated category' },
      },
      loading: false,
    });
  });
});
