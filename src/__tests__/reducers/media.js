import reducer from '../../reducers/media';
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
  it('should handle RESET_MEDIA', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'cat' }],
          loading: false,
        },
        {
          type: types.RESET_MEDIA,
          payload: {},
        },
      ),
    ).toEqual(initialState);
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
  it('should handle ADD_MEDIA', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIA,
        payload: [
          { id: 1, name: 'Cat 1' },
          { id: 2, name: 'Cat 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'Cat 1' }, 2: { id: 2, name: 'Cat 2' } },
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
  it('should handle ADD_MEDIUM', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIUM,
        payload: { id: 1, name: 'new medium' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new medium' } },
      loading: true,
    });
  });
  it('should handle ADD_MEDIUM when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing medium' } },
          loading: false,
        },
        {
          type: types.ADD_MEDIUM,
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
  it('should handle ADD_MEDIUM when already exists', () => {
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
          type: types.ADD_MEDIUM,
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
