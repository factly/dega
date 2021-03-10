import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/menu';
import * as types from '../../constants/menu';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('menu actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingActions = {
      type: types.SET_MENUS_LOADING,
      payload: true,
    };
    expect(actions.loadingMenus()).toEqual(startLoadingActions);
  });
  it('should create an action to set loading to false', () => {
    const startLoadingActions = {
      type: types.SET_MENUS_LOADING,
      payload: false,
    };
    expect(actions.stopMenusLoading()).toEqual(startLoadingActions);
  });
  it('should create an action to add menus', () => {
    const data = [
      { id: 1, name: 'menu1'},
      { id: 2, name: 'menu2'},
    ];
    const addMenusAction = {
      type: types.ADD_MENUS,
      payload: data,
    };
    expect(actions.addMenus(data)).toEqual(addMenusAction);
  });
  it('should create an action to add menus request', () => {
    const data = [{ query: 'query'}];
    const addMenusRequestAction = {
      type: types.ADD_MENUS_REQUEST,
      payload: data,
    };
    expect(actions.addMenusRequest(data)).toEqual(addMenusRequestAction);
  });
  it('should create an action to add menu', () => {
    const data = { id: 1, name: 'menu1' };
    const addMenuAction = {
      type: types.ADD_MENU,
      payload: data,
    };
    expect(actions.getMenuById(data)).toEqual(addMenuAction);
  });
  it('should create an action to reset menu', () => {
    const resetMenuAction = {
      type: types.RESET_MENUS,
    };
    expect(actions.resetMenus()).toEqual(resetMenuAction);
  });
  it('should create actions to fetch menus success', () => {
    const query = { page: 1, limit: 5 };
    const menus = [{ id: 1, name: 'menu1' }];
    const resp = { data: { nodes: menus, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MENUS,
        payload: [ { id: 1, name: 'menu1' } ],
      },
      {
        type: types.ADD_MENUS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_MENUS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMenus(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MENUS_API, {
      params: query,
    });
  });
  it('should create actions to fetch menus failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
          time: Date.now(),
        },
      },
      {
        type: types.SET_MENUS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMenus(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MENUS_API, {
      params: query,
    });
  });
  it('should create actions to fetch menu by id success', () => {
    const id = 1;
    const menu = { id: 1, name: 'menu1' };
    const resp = { data: menu };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MENU,
        payload: { id: 1, name: 'menu1' },
      },
      {
        type: types.SET_MENUS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMenu(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MENUS_API + '/' + id);
  });
  it('should create actions to fetch menu by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
          time: Date.now(),
        },
      },
      {
        type: types.SET_MENUS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMenu(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MENUS_API + '/' + id);
  });
  it('should create actions to create menu success', () => {
    const menu = { name: 'menu1' };
    const resp = { data: menu };
    axios.post.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_MENUS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Menu added',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addMenu(menu))
      .then(()=> expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.MENUS_API, menu);
  });
  it('should create actions to create menu failure', () => {
    const menu = { name: 'menu1' };
    const errorMessage = 'Failed to create menu';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addMenu(menu))
      .then(()=> expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.MENUS_API, menu);
  });
  it('should create actions to update menu success', () => {
    const menu = { id: 1, name: 'new menu1' };
    const resp = { data: menu };
    axios.put.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MENU,
        payload: { id: 1, name: 'new menu1'},
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Menu updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_MENUS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateMenu(menu))
      .then(()=> expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.MENUS_API + '/1', menu);
  });
  it('should create actions to update menu failue', () => {
    const menu = { id: 1, name: 'new menu1' };
    const errorMessage = 'Failed to update menu';
    axios.put.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
          time: Date.now(),
        },
      },
      {
        type: types.SET_MENUS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateMenu(menu))
      .then(()=> expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.MENUS_API + '/1', menu);
  });
  it('should create actions to delete menu success', () => {
    axios.delete.mockResolvedValue();
    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_MENUS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Menu deleted',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteMenu(1))
      .then(()=> expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.MENUS_API + '/1');
  });
  it('should create actions to delete menu failure', () => {
    const errorMessage = 'Failed to delete menu';
    axios.delete.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_MENUS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteMenu(1))
      .then(()=> expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.MENUS_API + '/1');
  });
})
