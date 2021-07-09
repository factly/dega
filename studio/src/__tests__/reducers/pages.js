import reducer from '../../reducers/pagesReducer';
import * as types from '../../constants/pages';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('pages reducer', () => {
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
  it('should handle RESET_PAGES', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'category' }],
          loading: false,
        },
        {
          type: types.RESET_PAGES,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_PAGES_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_PAGES_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_PAGES_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_PAGES_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PAGES_REQUEST,
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
  it('should handle ADD_PAGES_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_PAGES_REQUEST,
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
  it('should handle ADD_PAGES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PAGES,
        payload: [
          { id: 1, title: 'Page 1' },
          { id: 2, title: 'Page 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, title: 'Page 1' }, 2: { id: 2, title: 'Page 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_PAGES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PAGES,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_PAGE', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PAGE,
        payload: { id: 1, title: 'new page' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, title: 'new page' } },
      loading: true,
    });
  });
  it('should handle ADD_PAGE when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, title: 'existing page' } },
          loading: false,
        },
        {
          type: types.ADD_PAGE,
          payload: { id: 2, title: 'new page' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, title: 'existing page' },
        2: { id: 2, title: 'new page' },
      },
      loading: false,
    });
  });
  it('should handle ADD_PAGE when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, title: 'existing page' },
            2: { id: 2, title: 'new page' },
          },
          loading: false,
        },
        {
          type: types.ADD_PAGE,
          payload: { id: 2, title: 'updated page' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, title: 'existing page' },
        2: { id: 2, title: 'updated page' },
      },
      loading: false,
    });
  });
});
