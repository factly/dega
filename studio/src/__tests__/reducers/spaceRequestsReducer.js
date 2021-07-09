import reducer from '../../reducers/spaceRequestsReducer';
import * as types from '../../constants/spaceRequests';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Space request reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, space_id: 3, posts: 20, media: 40 } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, space_id: 3, posts: 20, media: 40 } },
      loading: false,
    });
  });
  it('should handle RESET_SPACE_REQUESTS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, space_id: 3, posts: 20, media: 40 }],
          loading: false,
        },
        {
          type: types.RESET_SPACE_REQUESTS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_SPACE_REQUESTS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_SPACE_REQUESTS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SPACE_REQUESTS_REQUEST,
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
  it('should handle ADD_SPACE_REQUESTS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_SPACE_REQUESTS_REQUEST,
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
  it('should handle ADD_SPACE_REQUESTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SPACE_REQUESTS,
        payload: [
          { id: 1, space_id: 3, posts: 20, media: 40 },
          { id: 2, space_id: 4, posts: 20, media: 40 },
        ],
      }),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, space_id: 3, posts: 20, media: 40 },
        2: { id: 2, space_id: 4, posts: 20, media: 40 },
      },
      loading: true,
    });
  });
  it('should handle empty payload ADD_SPACE_REQUESTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SPACE_REQUESTS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_SPACE_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SPACE_REQUEST,
        payload: { id: 1, space_id: 3, posts: 20, media: 40 },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, space_id: 3, posts: 20, media: 40 } },
      loading: true,
    });
  });
  it('should handle ADD_SPACE_REQUEST when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, space_id: 3, posts: 20, media: 40 } },
          loading: false,
        },
        {
          type: types.ADD_SPACE_REQUEST,
          payload: { id: 2, space_id: 4, posts: 20, media: 40 },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, space_id: 3, posts: 20, media: 40 },
        2: { id: 2, space_id: 4, posts: 20, media: 40 },
      },
      loading: false,
    });
  });
  it('should handle ADD_SPACE_REQUEST when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, space_id: 3, posts: 20, media: 40 },
            2: { id: 2, space_id: 4, posts: 20, media: 40 },
          },
          loading: false,
        },
        {
          type: types.ADD_SPACE_REQUEST,
          payload: { id: 2, space_id: 4, posts: 30, media: 60 },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, space_id: 3, posts: 20, media: 40 },
        2: { id: 2, space_id: 4, posts: 30, media: 60 },
      },
      loading: false,
    });
  });
});
