import reducer from '../../reducers/podcastReducer';
import * as types from '../../constants/podcasts';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Podcast reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, title: 'podcast' } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, title: 'podcast' } },
      loading: false,
    });
  });
  it('should handle RESET_PODCASTS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, title: 'podcast' }],
          loading: false,
        },
        {
          type: types.RESET_PODCASTS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_PODCASTS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_PODCASTS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_PODCASTS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_PODCASTS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PODCASTS_REQUEST,
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
  it('should handle ADD_PODCASTS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_PODCASTS_REQUEST,
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
  it('should handle ADD_PODCASTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PODCASTS,
        payload: [
          { id: 1, title: 'Podcast 1' },
          { id: 2, title: 'Podcast 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, title: 'Podcast 1' }, 2: { id: 2, title: 'Podcast 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_PODCASTS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PODCASTS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_PODCAST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PODCAST,
        payload: { id: 1, title: 'new podcast' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, title: 'new podcast' } },
      loading: true,
    });
  });
  it('should handle ADD_PODCAST when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, title: 'existing podcast' } },
          loading: false,
        },
        {
          type: types.ADD_PODCAST,
          payload: { id: 2, title: 'new podcast' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, title: 'existing podcast' },
        2: { id: 2, title: 'new podcast' },
      },
      loading: false,
    });
  });
  it('should handle ADD_PODCAST when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, title: 'existing podcast' },
            2: { id: 2, title: 'new podcast' },
          },
          loading: false,
        },
        {
          type: types.ADD_PODCAST,
          payload: { id: 2, title: 'updated podcast' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, title: 'existing podcast' },
        2: { id: 2, title: 'updated podcast' },
      },
      loading: false,
    });
  });
});
