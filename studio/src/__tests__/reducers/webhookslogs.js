import webhooklogsReducer from '../../reducers/webhooklogsReducer';
import * as types from '../../constants/webhooklogs';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('webhooklogsReducer', () => {
  it('should return the initial state', () => {
    expect(webhooklogsReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle RESET_WEBHOOKS', () => {
    expect(
      webhooklogsReducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'webhook' }],
          loading: false,
        },
        {
          type: types.RESET_WEBHOOKLOGS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });

  it('should handle SET_WEBHOOKLOGS_LOADING', () => {
    expect(webhooklogsReducer(initialState, {
      type: types.SET_WEBHOOKLOGS_LOADING,
      payload: false,
    })).toEqual({
      req: [],
      details: {},
      loading: false,
    });

    expect(webhooklogsReducer(initialState, {
      type: types.SET_WEBHOOKLOGS_LOADING,
      payload: true,
    })).toEqual({
      req: [],
      details: {},
      loading: true,
    })
  });

  it('should handle ADD_WEBHOOKLOGS_REQUEST', () => {
    expect(
      webhooklogsReducer(initialState, {
        type: types.ADD_WEBHOOKLOGS_REQUEST,
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

  it('should handle ADD_WEBHOOKLOGS_REQUEST when req already exists', () => {
    expect(
      webhooklogsReducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_WEBHOOKLOGS_REQUEST,
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

  it('should handle ADD_WEBHOOKLOGS', () => {
    expect(
      webhooklogsReducer(initialState, {
        type: types.ADD_WEBHOOKLOGS,
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

  it('should handle empty payload ADD_WEBHOOKLOGS', () => {
    expect(
      webhooklogsReducer(initialState, {
        type: types.ADD_WEBHOOKLOGS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });

  it('should handle ADD_WEBHOOKLOGS', () => {
    expect(
      webhooklogsReducer(initialState, {
        type: types.ADD_WEBHOOKLOGS,
        payload: [{ id: 1, name: 'new webhook' }],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new webhook' } },
      loading: true,
    });
  });

  it('should handle ADD_WEBHOOKLOGS when details is non-empty', () => {
    expect(
      webhooklogsReducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing webhook' } },
          loading: false,
        },
        {
          type: types.ADD_WEBHOOKLOGS,
          payload: [{ id: 2, name: 'new webhook' }],
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

  it('should handle ADD_WEBHOOKLOGS when already exists', () => {
    expect(
      webhooklogsReducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing webhook' },
            2: { id: 2, name: 'new webhook' },
          },
          loading: false,
        },
        {
          type: types.ADD_WEBHOOKLOGS,
            payload: [{ id: 2, name: 'updated webhook' }],
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
