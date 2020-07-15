import reducer from '../../reducers/ratings';
import * as types from '../../constants/ratings';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('ratings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should handle RESET_RATINGS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'Rating' }],
          loading: false,
        },
        {
          type: types.RESET_RATINGS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_RATINGS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_RATINGS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_RATINGS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_RATINGS_REQUEST,
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
  it('should handle ADD_RATINGS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_RATINGS,
        payload: [
          { id: 1, name: 'rating 1' },
          { id: 2, name: 'rating 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'rating 1' }, 2: { id: 2, name: 'rating 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_RATINGS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_RATINGS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_RATING', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_RATING,
        payload: { id: 1, name: 'new rating' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new rating' } },
      loading: true,
    });
  });
  it('should handle ADD_RATING when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing rating' } },
          loading: false,
        },
        {
          type: types.ADD_RATING,
          payload: { id: 2, name: 'new rating' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing rating' },
        2: { id: 2, name: 'new rating' },
      },
      loading: false,
    });
  });
  it('should handle ADD_RATING when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing rating' },
            2: { id: 2, name: 'new rating' },
          },
          loading: false,
        },
        {
          type: types.ADD_RATING,
          payload: { id: 2, name: 'updated rating' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing rating' },
        2: { id: 2, name: 'updated rating' },
      },
      loading: false,
    });
  });
});
