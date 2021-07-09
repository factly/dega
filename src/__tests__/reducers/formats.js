import reducer from '../../reducers/formatsReducer';
import * as types from '../../constants/formats';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('formats reducer', () => {
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
  it('should handle RESET_FORMATS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'format' }],
          loading: false,
        },
        {
          type: types.RESET_FORMATS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_FORMATS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_FORMATS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_FORMATS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_FORMATS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_FORMATS_REQUEST,
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
  it('should handle ADD_FORMATS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_FORMATS_REQUEST,
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
  it('should handle ADD_FORMATS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_FORMATS,
        payload: [
          { id: 1, name: 'format 1' },
          { id: 2, name: 'format 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'format 1' }, 2: { id: 2, name: 'format 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_FORMATS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_FORMATS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_FORMAT', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_FORMAT,
        payload: { id: 1, name: 'new format' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new format' } },
      loading: true,
    });
  });
  it('should handle ADD_FORMAT when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing format' } },
          loading: false,
        },
        {
          type: types.ADD_FORMAT,
          payload: { id: 2, name: 'new format' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing format' },
        2: { id: 2, name: 'new format' },
      },
      loading: false,
    });
  });
  it('should handle ADD_FORMAT when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing format' },
            2: { id: 2, name: 'new format' },
          },
          loading: false,
        },
        {
          type: types.ADD_FORMAT,
          payload: { id: 2, name: 'updated format' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing format' },
        2: { id: 2, name: 'updated format' },
      },
      loading: false,
    });
  });
});
