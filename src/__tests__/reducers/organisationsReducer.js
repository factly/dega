import reducer from '../../reducers/organisationsReducer';
import * as types from '../../constants/organisations';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('organisation reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, organisation_id: 18, spaces: 3} },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, organisation_id: 18, spaces: 3} },
      loading: false,
    });
  });
  it('should handle RESET_ORGANISATION_PERMISSIONS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, organisation_id: 18, spaces: 3}],
          loading: false,
        },
        {
          type: types.RESET_ORGANISATION_PERMISSIONS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_ORGANISATION_PERMISSIONS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_ORGANISATION_PERMISSIONS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_PERMISSIONS_REQUEST,
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
  it('should handle ADD_ORGANISATION_PERMISSIONS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_ORGANISATION_PERMISSIONS_REQUEST,
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
  it('should handle ADD_ORGANISATION_PERMISSIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_PERMISSIONS,
        payload: [
          { id: 1, organisation_id: 18, spaces: 3},
          { id: 2, organisation_id: 20, spaces: 2},
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, organisation_id: 18, spaces: 3}, 2: { id: 2, organisation_id: 20, spaces: 2} },
      loading: true,
    });
  });
  it('should handle empty payload ADD_ORGANISATION_PERMISSIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_PERMISSIONS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_ORGANISATION_PERMISSION', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_PERMISSION,
        payload: { id: 1, organisation_id: 18, spaces: 3},
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, organisation_id: 18, spaces: 3} },
      loading: true,
    });
  });
  it('should handle ADD_ORGANISATION_PERMISSION when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, organisation_id: 18, spaces: 3} },
          loading: false,
        },
        {
          type: types.ADD_ORGANISATION_PERMISSION,
          payload: { id: 2, organisation_id: 20, spaces: 2},
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, organisation_id: 18, spaces: 3},
        2: { id: 2, organisation_id: 20, spaces: 2},
      },
      loading: false,
    });
  });
  it('should handle ADD_ORGANISATION_PERMISSION when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, organisation_id: 18, spaces: 3},
            2: { id: 2, organisation_id: 20, spaces: 2},
          },
          loading: false,
        },
        {
          type: types.ADD_ORGANISATION_PERMISSION,
          payload: { id: 2, organisation_id: 20, spaces: 4},
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, organisation_id: 18, spaces: 3},
        2: { id: 2, organisation_id: 20, spaces: 4},
      },
      loading: false,
    });
  });
});