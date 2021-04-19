import reducer from '../../reducers/spacePermissionsReducer';
import * as types from '../../constants/spacePermissions';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('space permission reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: {
          1: {
            id: 1,
            name: 'Space 1',
            organisation_id: 11,
            permission: { id: 7, space_id: 3, posts: 10, media: 20 },
          },
        },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: {
        1: {
          id: 1,
          name: 'Space 1',
          organisation_id: 11,
          permission: { id: 7, space_id: 3, posts: 10, media: 20 },
        },
      },
      loading: false,
    });
  });
  it('should handle RESET_SPACE_PERMISSIONS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [
            {
              id: 1,
              name: 'Space 1',
              organisation_id: 11,
              permission: { id: 7, space_id: 3, posts: 10, media: 20 },
            },
          ],
          loading: false,
        },
        {
          type: types.RESET_SPACE_PERMISSIONS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_SPACE_PERMISSIONS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_SPACE_PERMISSIONS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SPACE_PERMISSIONS_REQUEST,
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
  it('should handle ADD_SPACE_PERMISSIONS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_SPACE_PERMISSIONS_REQUEST,
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
  it('should handle ADD_SPACE_PERMISSIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SPACE_PERMISSIONS,
        payload: [
          {
            id: 1,
            name: 'Space 1',
            organisation_id: 11,
            permission: { id: 7, space_id: 3, posts: 10, media: 20 },
          },
          {
            id: 2,
            name: 'Space 2',
            organisation_id: 12,
            permission: { id: 8, space_id: 4, posts: 15, media: 30 },
          },
        ],
      }),
    ).toEqual({
      req: [],
      details: {
        1: {
          id: 1,
          name: 'Space 1',
          organisation_id: 11,
          permission: { id: 7, space_id: 3, posts: 10, media: 20 },
        },
        2: {
          id: 2,
          name: 'Space 2',
          organisation_id: 12,
          permission: { id: 8, space_id: 4, posts: 15, media: 30 },
        },
      },
      loading: true,
    });
  });
  it('should handle empty payload ADD_SPACE_PERMISSIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SPACE_PERMISSIONS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_SPACE_PERMISSION', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_SPACE_PERMISSION,
        payload: {
          id: 1,
          name: 'Space 1',
          organisation_id: 11,
          permission: { id: 7, space_id: 3, posts: 10, media: 20 },
        },
      }),
    ).toEqual({
      req: [],
      details: {
        1: {
          id: 1,
          name: 'Space 1',
          organisation_id: 11,
          permission: { id: 7, space_id: 3, posts: 10, media: 20 },
        },
      },
      loading: true,
    });
  });
  it('should handle ADD_SPACE_PERMISSION when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: {
              id: 1,
              name: 'Space 1',
              organisation_id: 11,
              permission: { id: 7, space_id: 3, posts: 10, media: 20 },
            },
          },
          loading: false,
        },
        {
          type: types.ADD_SPACE_PERMISSION,
          payload: {
            id: 2,
            name: 'Space 2',
            organisation_id: 12,
            permission: { id: 8, space_id: 4, posts: 15, media: 30 },
          },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: {
          id: 1,
          name: 'Space 1',
          organisation_id: 11,
          permission: { id: 7, space_id: 3, posts: 10, media: 20 },
        },
        2: {
          id: 2,
          name: 'Space 2',
          organisation_id: 12,
          permission: { id: 8, space_id: 4, posts: 15, media: 30 },
        },
      },
      loading: false,
    });
  });
  it('should handle ADD_SPACE_PERMISSION when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: {
              id: 1,
              name: 'Space 1',
              organisation_id: 11,
              permission: { id: 7, space_id: 3, posts: 10, media: 20 },
            },
            2: {
              id: 2,
              name: 'Space 2',
              organisation_id: 12,
              permission: { id: 8, space_id: 4, posts: 15, media: 30 },
            },
          },
          loading: false,
        },
        {
          type: types.ADD_SPACE_PERMISSION,
          payload: {
            id: 2,
            name: 'Space 3',
            organisation_id: 12,
            permission: { id: 9, space_id: 5, posts: 15, media: 30 },
          },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: {
          id: 1,
          name: 'Space 1',
          organisation_id: 11,
          permission: { id: 7, space_id: 3, posts: 10, media: 20 },
        },
        2: {
          id: 2,
          name: 'Space 3',
          organisation_id: 12,
          permission: { id: 9, space_id: 5, posts: 15, media: 30 },
        },
      },
      loading: false,
    });
  });
});
