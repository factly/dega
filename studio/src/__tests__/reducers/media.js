import reducer from '../../reducers/mediaReducer';
import * as types from '../../constants/media';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('media reducer', () => {
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
  it('should handle RESET_MEDIA', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'media' }],
          loading: false,
        },
        {
          type: types.RESET_MEDIA,
          payload: {},
        },
      ),
    ).toEqual({
      req: [],
      details: [{ id: 1, name: 'media' }],
      loading: true,
    });
  });
  it('should handle SET_MEDIA_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_MEDIA_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIA_REQUEST,
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
  it('should handle ADD_MEDIA_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_MEDIA_REQUEST,
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
  it('should handle ADD_MEDIA', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIA,
        payload: [
          { id: 1, name: 'Media 1' },
          { id: 2, name: 'Media 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'Media 1' }, 2: { id: 2, name: 'Media 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_MEDIA', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIA,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle GET_MEDIUM', () => {
    expect(
      reducer(initialState, {
        type: types.GET_MEDIUM,
        payload: { id: 1, name: 'new medium' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new medium' } },
      loading: true,
    });
  });
  it('should handle GET_MEDIUM when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing medium' } },
          loading: false,
        },
        {
          type: types.GET_MEDIUM,
          payload: { id: 2, name: 'new medium' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing medium' },
        2: { id: 2, name: 'new medium' },
      },
      loading: false,
    });
  });
  it('should handle UPDATE_MEDIUM when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing medium' },
            2: { id: 2, name: 'new medium' },
          },
          loading: false,
        },
        {
          type: types.UPDATE_MEDIUM,
          payload: { id: 2, name: 'updated medium' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing medium' },
        2: { id: 2, name: 'updated medium' },
      },
      loading: false,
    });
  });
});
