import reducer from '../../reducers/permissionsReducer';
import * as types from '../../constants/permissions';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

const permission = {
  data: [
    {
      resource: 'categories',
      actions: ['get', 'create', 'update', 'delete'],
    },
    {
      resource: 'tags',
      actions: ['get', 'create'],
    },
    {
      resource: 'formats',
      actions: ['update'],
    },
    {
      resource: 'media',
      actions: ['create'],
    },
    {
      resource: 'tags',
      actions: ['get'],
    },
  ],
  user_id: 1,
};

describe('permissions reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [permission],
        details: { 1: permission },
        loading: false,
      }),
    ).toEqual({
      req: [permission],
      details: { 1: permission },
      loading: false,
    });
  });
  it('should handle SET_PERMISSIONS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_PERMISSIONS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_PERMISSIONS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_PERMISSIONS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PERMISSIONS_REQUEST,
        payload: [1],
      }),
    ).toEqual({
      req: [1],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_PERMISSIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PERMISSIONS,
        payload: permission,
      }),
    ).toEqual({
      req: [],
      details: { 1: permission.data },
      loading: true,
    });
  });
  it('should handle empty payload ADD_PERMISSIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PERMISSIONS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
});
