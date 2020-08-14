import reducer from '../../reducers/tagsReducer';
import * as types from '../../constants/tags';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('tags reducer', () => {
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
  it('should handle RESET_TAGS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'tag' }],
          loading: false,
        },
        {
          type: types.RESET_TAGS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_TAGS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_TAGS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_TAGS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_TAGS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_TAGS_REQUEST,
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
  it('should handle ADD_TAGS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_TAGS_REQUEST,
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
  it('should handle ADD_TAGS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_TAGS,
        payload: [
          { id: 1, name: 'tag 1' },
          { id: 2, name: 'tag 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'tag 1' }, 2: { id: 2, name: 'tag 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_TAGS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_TAGS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_TAG', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_TAG,
        payload: { id: 1, name: 'new tag' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new tag' } },
      loading: true,
    });
  });
  it('should handle ADD_TAG when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing tag' } },
          loading: false,
        },
        {
          type: types.ADD_TAG,
          payload: { id: 2, name: 'new tag' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing tag' },
        2: { id: 2, name: 'new tag' },
      },
      loading: false,
    });
  });
  it('should handle ADD_TAG when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing tag' },
            2: { id: 2, name: 'new tag' },
          },
          loading: false,
        },
        {
          type: types.ADD_TAG,
          payload: { id: 2, name: 'updated tag' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing tag' },
        2: { id: 2, name: 'updated tag' },
      },
      loading: false,
    });
  });
});
