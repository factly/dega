import reducer from '../../reducers/eventsReducer';
import * as types from '../../constants/events';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('events reducer', () => {
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
  it('should handle RESET_EVENTS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'event' }],
          loading: false,
        },
        {
          type: types.RESET_EVENTS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_EVENTS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_EVENTS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_EVENTS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_EVENTS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_EVENTS_REQUEST,
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
  it('should handle ADD_EVENTS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_EVENTS_REQUEST,
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
  it('should handle ADD_EVENTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_EVENTS,
        payload: [
          { id: 1, name: 'Event 1' },
          { id: 2, name: 'Event 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'Event 1' }, 2: { id: 2, name: 'Event 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_EVENTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_EVENTS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_EVENT', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_EVENT,
        payload: { id: 1, name: 'new event' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new event' } },
      loading: true,
    });
  });
  it('should handle ADD_EVENT when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing event' } },
          loading: false,
        },
        {
          type: types.ADD_EVENT,
          payload: { id: 2, name: 'new event' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing event' },
        2: { id: 2, name: 'new event' },
      },
      loading: false,
    });
  });
  it('should handle ADD_EVENT when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing event' },
            2: { id: 2, name: 'new event' },
          },
          loading: false,
        },
        {
          type: types.ADD_EVENT,
          payload: { id: 2, name: 'updated event' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing event' },
        2: { id: 2, name: 'updated event' },
      },
      loading: false,
    });
  });
});
