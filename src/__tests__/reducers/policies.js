import reducer from '../../reducers/policies';
import * as types from '../../constants/policies';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('policies reducer', () => {
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
  it('should handle RESET_POLICIES', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'policy' }],
          loading: false,
        },
        {
          type: types.RESET_POLICIES,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_POLICIES_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_POLICIES_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_POLICIES_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_POLICIES_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_POLICIES_REQUEST,
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
  it('should handle ADD_POLICIES_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_POLICIES_REQUEST,
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
  it('should handle ADD_POLICIES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_POLICIES,
        payload: [
          { id: 1, name: 'policy 1' },
          { id: 2, name: 'policy 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'policy 1' }, 2: { id: 2, name: 'policy 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_POLICIES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_POLICIES,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_POLICY', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_POLICY,
        payload: { id: 1, name: 'new policy' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new policy' } },
      loading: true,
    });
  });
  it('should handle ADD_POLICY when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing policy' } },
          loading: false,
        },
        {
          type: types.ADD_POLICY,
          payload: { id: 2, name: 'new policy' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing policy' },
        2: { id: 2, name: 'new policy' },
      },
      loading: false,
    });
  });
  it('should handle ADD_POLICY when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing policy' },
            2: { id: 2, name: 'new policy' },
          },
          loading: false,
        },
        {
          type: types.ADD_POLICY,
          payload: { id: 2, name: 'updated policy' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing policy' },
        2: { id: 2, name: 'updated policy' },
      },
      loading: false,
    });
  });
});
