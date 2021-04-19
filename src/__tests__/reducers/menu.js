import reducer from '../../reducers/menuReducer';
import * as types from '../../constants/menu';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Menu reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, name: 'menu' } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, name: 'menu' } },
      loading: false,
    });
  });
  it('should handle RESET_MENUS', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
          details: [{ id: 1, name: 'menu' }],
          loading: false,
        },
        {
          type: types.RESET_MENUS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_MENUS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_MENUS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_MENUS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_MENUS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MENUS_REQUEST,
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
  it('should handle ADD_MENUS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_MENUS_REQUEST,
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
  it('should handle ADD_MENUS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MENUS,
        payload: [
          { id: 1, name: 'Menu 1' },
          { id: 2, name: 'Menu 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'Menu 1' }, 2: { id: 2, name: 'Menu 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_MENUS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MENUS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_MENU', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MENU,
        payload: { id: 1, name: 'new menu' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new menu' } },
      loading: true,
    });
  });
  it('should handle ADD_MENU when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing menu' } },
          loading: false,
        },
        {
          type: types.ADD_MENU,
          payload: { id: 2, name: 'new menu' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing menu' },
        2: { id: 2, name: 'new menu' },
      },
      loading: false,
    });
  });
  it('should handle ADD_MENU when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing menu' },
            2: { id: 2, name: 'new menu' },
          },
          loading: false,
        },
        {
          type: types.ADD_MENU,
          payload: { id: 2, name: 'updated menu' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing menu' },
        2: { id: 2, name: 'updated menu' },
      },
      loading: false,
    });
  });
});
