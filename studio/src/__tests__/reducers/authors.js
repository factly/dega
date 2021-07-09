import reducer from '../../reducers/authorsReducer';
import * as types from '../../constants/authors';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('authors reducer', () => {
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
  it('should handle SET_AUTHORS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_AUTHORS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_AUTHORS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_AUTHORS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_AUTHORS_REQUEST,
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
  it('should handle ADD_AUTHORS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_AUTHORS_REQUEST,
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
  it('should handle ADD_AUTHORS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_AUTHORS,
        payload: [
          { id: 1, author: 'Aut' },
          { id: 2, author: 'hor' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, author: 'Aut' }, 2: { id: 2, author: 'hor' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_AUTHORS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_AUTHORS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
});
