import reducer from '../../reducers/rolesReducer';
import * as types from '../../constants/roles';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('roles reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(reducer(initialState, { type: 'NON_EXISTING', payload: {} })).toEqual(initialState);
  });
  it('should return the state when action is empty', () => {
    expect(reducer(initialState)).toEqual(initialState);
  });
  it('should handle SET_ROLES_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_ROLES_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
    expect(
      reducer(initialState, {
        type: types.SET_ROLES_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle RESET_ROLES', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'roles' }],
          loading: false,
        },
        {
          type: types.RESET_ROLES,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle ADD_ROLES_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ROLES_REQUEST,
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
  it('should handle ADD_ROLES_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_ROLES_REQUEST,
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
  it('should handle ADD_ROLES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ROLES,
        payload: [
          { id: 1, name: 'role 1' },
          { id: 2, name: 'role 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'role 1' }, 2: { id: 2, name: 'role 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_ROLES', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ROLES,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle GET_ROLE', () => {
    expect(
      reducer(initialState, {
        type: types.GET_ROLE,
        payload: { id: 1, name: 'new role' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new role' } },
      loading: true,
    });
  });
  it('should handle GET_ROLE when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing role' } },
          loading: false,
        },
        {
          type: types.GET_ROLE,
          payload: { id: 2, name: 'new role' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing role' },
        2: { id: 2, name: 'new role' },
      },
      loading: false,
    });
  });
  it('should handle UPDATE_ROLE when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing role' },
            2: { id: 2, name: 'new role' },
          },
          loading: false,
        },
        {
          type: types.UPDATE_ROLE,
          payload: { id: 2, name: 'updated role' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing role' },
        2: { id: 2, name: 'updated role' },
      },
      loading: false,
    });
  });
});
