import reducer from '../../reducers/claimsReducer';
import * as types from '../../constants/claims';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('claims reducer', () => {
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
  it('should handle RESET_CLAIMS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'claim' }],
          loading: false,
        },
        {
          type: types.RESET_CLAIMS,
          payload: {},
        },
      ),
    ).toEqual({
      req: [],
      loading: true,
      details: [{ id: 1, name: 'claim' }],
    });
  });
  it('should handle SET_CLAIMS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_CLAIMS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_CLAIMS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_CLAIMS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CLAIMS_REQUEST,
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
  it('should handle ADD_CLAIMS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_CLAIMS_REQUEST,
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
  it('should handle ADD_CLAIMS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CLAIMS,
        payload: [
          { id: 1, name: 'claim 1' },
          { id: 2, name: 'claim 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'claim 1' }, 2: { id: 2, name: 'claim 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_CLAIMS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CLAIMS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_CLAIM', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CLAIM,
        payload: { id: 1, name: 'new claim' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new claim' } },
      loading: true,
    });
  });
  it('should handle ADD_CLAIM when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing claim' } },
          loading: false,
        },
        {
          type: types.ADD_CLAIM,
          payload: { id: 2, name: 'new claim' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing claim' },
        2: { id: 2, name: 'new claim' },
      },
      loading: false,
    });
  });
  it('should handle ADD_CLAIM when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing claim' },
            2: { id: 2, name: 'new claim' },
          },
          loading: false,
        },
        {
          type: types.ADD_CLAIM,
          payload: { id: 2, name: 'updated claim' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing claim' },
        2: { id: 2, name: 'updated claim' },
      },
      loading: false,
    });
  });
});
