import reducer from '../../reducers/organisationRequestsReducer';
import * as types from '../../constants/organisationRequests';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('organisation requests reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, spaces: 4, organisation_id: 2 } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, spaces: 4, organisation_id: 2 } },
      loading: false,
    });
  });
  it('should handle RESET_ORGANISATION_REQUESTS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, spaces: 4, organisation_id: 2 }],
          loading: false,
        },
        {
          type: types.RESET_ORGANISATION_REQUESTS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_ORGANISATION_REQUESTS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_ORGANISATION_REQUESTS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_REQUESTS_REQUEST,
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
  it('should handle ADD_ORGANISATION_REQUESTS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_ORGANISATION_REQUESTS_REQUEST,
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
  it('should handle ADD_ORGANISATION_REQUESTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_REQUESTS,
        payload: [
          { id: 1, spaces: 4, organisation_id: 2 },
          { id: 2, spaces: 2, organisation_id: 5 },
        ],
      }),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, spaces: 4, organisation_id: 2 },
        2: { id: 2, spaces: 2, organisation_id: 5 },
      },
      loading: true,
    });
  });
  it('should handle empty payload ADD_ORGANISATION_REQUESTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_REQUESTS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_ORGANISATION_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_REQUEST,
        payload: { id: 1, spaces: 4, organisation_id: 2 },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, spaces: 4, organisation_id: 2 } },
      loading: true,
    });
  });
  it('should handle ADD_ORGANISATION_REQUEST when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, spaces: 4, organisation_id: 2 } },
          loading: false,
        },
        {
          type: types.ADD_ORGANISATION_REQUEST,
          payload: { id: 2, spaces: 2, organisation_id: 5 },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, spaces: 4, organisation_id: 2 },
        2: { id: 2, spaces: 2, organisation_id: 5 },
      },
      loading: false,
    });
  });
  it('should handle ADD_ORGANISATION_REQUEST when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, spaces: 4, organisation_id: 2 },
            2: { id: 2, spaces: 2, organisation_id: 5 },
          },
          loading: false,
        },
        {
          type: types.ADD_ORGANISATION_REQUEST,
          payload: { id: 2, spaces: 6, organisation_id: 5 },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, spaces: 4, organisation_id: 2 },
        2: { id: 2, spaces: 6, organisation_id: 5 },
      },
      loading: false,
    });
  });
});
