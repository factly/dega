import reducer from '../../reducers/webhooksReducer';
import * as types from '../../constants/webhooks';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('webhooks reducer', () => {
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
  it('should handle RESET_WEBHOOKS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'webhook' }],
          loading: false,
        },
        {
          type: types.RESET_WEBHOOKS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_WEBHOOKS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_WEBHOOKS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_WEBHOOKS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_WEBHOOKS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_WEBHOOKS_REQUEST,
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
  it('should handle ADD_WEBHOOKS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_WEBHOOKS_REQUEST,
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
  it('should handle ADD_WEBHOOKS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_WEBHOOKS,
        payload: [
          { id: 1, name: 'Webhook 1' },
          { id: 2, name: 'Webhook 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'Webhook 1' }, 2: { id: 2, name: 'Webhook 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_WEBHOOKS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_WEBHOOKS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_WEBHOOK', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_WEBHOOK,
        payload: { id: 1, name: 'new webhook' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new webhook' } },
      loading: true,
    });
  });
  it('should handle ADD_WEBHOOK when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing webhook' } },
          loading: false,
        },
        {
          type: types.ADD_WEBHOOK,
          payload: { id: 2, name: 'new webhook' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing webhook' },
        2: { id: 2, name: 'new webhook' },
      },
      loading: false,
    });
  });
  it('should handle ADD_WEBHOOK when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing webhook' },
            2: { id: 2, name: 'new webhook' },
          },
          loading: false,
        },
        {
          type: types.ADD_WEBHOOK,
          payload: { id: 2, name: 'updated webhook' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing webhook' },
        2: { id: 2, name: 'updated webhook' },
      },
      loading: false,
    });
  });
});
