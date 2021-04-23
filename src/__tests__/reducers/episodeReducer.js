import reducer from '../../reducers/episodesReducer';
import * as types from '../../constants/episodes';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Episode reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, title: 'episode' } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, title: 'episode' } },
      loading: false,
    });
  });
  it('should handle RESET_EPISODES', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, title: 'episode' }],
          loading: false,
        },
        {
          type: types.RESET_EPISODES,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_EPISODES_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_EPISODES_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_EPISODES_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_EPISODES_REQUEST,
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
  it('should handle ADD_EPISODES_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_EPISODES_REQUEST,
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
  it('should handle ADD_EPISODES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_EPISODES,
        payload: [
          { id: 1, title: 'Episode 1' },
          { id: 2, title: 'Episode 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, title: 'Episode 1' }, 2: { id: 2, title: 'Episode 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_EPISODES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_EPISODES,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_EPISODE', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_EPISODE,
        payload: { id: 1, title: 'new episode' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, title: 'new episode' } },
      loading: true,
    });
  });
  it('should handle ADD_EPISODE when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, title: 'existing episode' } },
          loading: false,
        },
        {
          type: types.ADD_EPISODE,
          payload: { id: 2, title: 'new episode' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, title: 'existing episode' },
        2: { id: 2, title: 'new episode' },
      },
      loading: false,
    });
  });
  it('should handle ADD_EPISODE when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, title: 'existing episode' },
            2: { id: 2, title: 'new episode' },
          },
          loading: false,
        },
        {
          type: types.ADD_EPISODE,
          payload: { id: 2, title: 'updated episode' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, title: 'existing episode' },
        2: { id: 2, title: 'updated episode' },
      },
      loading: false,
    });
  });
});
