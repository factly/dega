import reducer from '../../reducers/claimantsReducer';
import * as types from '../../constants/claimants';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('claimants reducer', () => {
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
  it('should handle RESET_CLAIMANTS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'claimant' }],
          loading: false,
        },
        {
          type: types.RESET_CLAIMANTS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_CLAIMANTS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_CLAIMANTS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CLAIMANTS_REQUEST,
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
  it('should handle ADD_CLAIMANTS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_CLAIMANTS_REQUEST,
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
  it('should handle ADD_CLAIMANTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CLAIMANTS,
        payload: [
          { id: 1, name: 'claimant 1' },
          { id: 2, name: 'claimant 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'claimant 1' }, 2: { id: 2, name: 'claimant 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_CLAIMANTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_CLAIMANTS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle GET_CLAIMANT', () => {
    expect(
      reducer(initialState, {
        type: types.GET_CLAIMANT,
        payload: { id: 1, name: 'new claimant' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new claimant' } },
      loading: true,
    });
  });
  it('should handle GET_CLAIMANT when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing claimant' } },
          loading: false,
        },
        {
          type: types.GET_CLAIMANT,
          payload: { id: 2, name: 'new claimant' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing claimant' },
        2: { id: 2, name: 'new claimant' },
      },
      loading: false,
    });
  });
  it('should handle UPDATE_CLAIMANT when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing claimant' },
            2: { id: 2, name: 'new claimant' },
          },
          loading: false,
        },
        {
          type: types.UPDATE_CLAIMANT,
          payload: { id: 2, name: 'updated claimant' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing claimant' },
        2: { id: 2, name: 'updated claimant' },
      },
      loading: false,
    });
  });
});
