import reducer from '../../reducers/postsReducer';
import * as types from '../../constants/posts';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('posts reducer', () => {
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
  it('should handle RESET_POSTS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'Post' }],
          loading: false,
        },
        {
          type: types.RESET_POSTS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_POSTS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_POSTS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_POSTS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_POSTS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_POSTS_REQUEST,
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
  it('should handle ADD_POSTS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_POSTS_REQUEST,
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
  it('should handle ADD_POSTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_POSTS,
        payload: [
          { id: 1, name: 'Post 1' },
          { id: 2, name: 'Post 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'Post 1' }, 2: { id: 2, name: 'Post 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_POSTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_POSTS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_POST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_POST,
        payload: { id: 1, name: 'new post' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new post' } },
      loading: true,
    });
  });
  it('should handle ADD_POST when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing post' } },
          loading: false,
        },
        {
          type: types.ADD_POST,
          payload: { id: 2, name: 'new post' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing post' },
        2: { id: 2, name: 'new post' },
      },
      loading: false,
    });
  });
  it('should handle ADD_POST when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing post' },
            2: { id: 2, name: 'new post' },
          },
          loading: false,
        },
        {
          type: types.ADD_POST,
          payload: { id: 2, name: 'updated post' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing post' },
        2: { id: 2, name: 'updated post' },
      },
      loading: false,
    });
  });
});
