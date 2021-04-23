import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/spacePermissions';
import * as types from '../../constants/spacePermissions';
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

describe('spacePermission actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_SPACE_PERMISSIONS_LOADING,
      payload: true,
    };
    expect(actions.loadingSpacePermissions()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_SPACE_PERMISSIONS_LOADING,
      payload: false,
    };
    expect(actions.stopSpacePermissionsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add space permission list', () => {
    const data = [
      {
        id: 1,
        organisation_id: 10,
        name: 'Space 3',
        permission: {
          id: 5,
          space_id: 3,
          posts: 20,
          media: 40,
        },
      },
      {
        id: 2,
        organisation_id: 11,
        name: 'Space 2',
        permission: {
          id: 7,
          space_id: 2,
          posts: 10,
          media: 20,
        },
      },
    ];
    const addSpacePermissionListAction = {
      type: types.ADD_SPACE_PERMISSIONS,
      payload: data,
    };
    expect(actions.addSpacePermissionsList(data)).toEqual(addSpacePermissionListAction);
  });
  it('should create an action to add space permission requests', () => {
    const data = {
      data: [1, 2],
      query: 'query',
      total: 2,
    };
    const addSpacePermissionRequestAction = {
      type: types.ADD_SPACE_PERMISSIONS_REQUEST,
      payload: data,
    };
    expect(actions.addSpacePermissionsRequest(data)).toEqual(addSpacePermissionRequestAction);
  });
  it('should create an action to add space permission', () => {
    const data = {
      id: 2,
      organisation_id: 11,
      name: 'Space 2',
      permission: {
        id: 7,
        space_id: 3,
        posts: 10,
        media: 20,
      },
    };
    const addSpacePermissionAction = {
      type: types.ADD_SPACE_PERMISSION,
      payload: data,
    };
    expect(actions.getSpacePermissionByID(data)).toEqual(addSpacePermissionAction);
  });
  it('should create an action to reset space permission', () => {
    const resetSpacePermissionAction = {
      type: types.RESET_SPACE_PERMISSIONS,
    };
    expect(actions.resetSpacePermissions()).toEqual(resetSpacePermissionAction);
  });
  it('should create actions to fetch space permission success', () => {
    const query = { page: 1, limit: 5 };
    const spacePermission = [
      {
        id: 2,
        organisation_id: 11,
        name: 'Space 2',
        permission: {
          id: 7,
          space_id: 3,
          posts: 10,
          media: 20,
        },
      },
    ];
    const resp = { data: { nodes: spacePermission, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_SPACE_PERMISSIONS,
        payload: [
          {
            id: 2,
            organisation_id: 11,
            name: 'Space 2',
            permission: { id: 7, space_id: 3, posts: 10, media: 20 },
          },
        ],
      },
      {
        type: types.ADD_SPACE_PERMISSIONS_REQUEST,
        payload: {
          data: [2],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getSpaces(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.SPACE_PERMISSIONS_API, {
      params: query,
    });
  });
  it('should create actions to fetch space permission failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
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
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getSpaces(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.SPACE_PERMISSIONS_API, {
      params: query,
    });
  });
  it('should create actions to create Space permission success', () => {
    const spacePermission = { space_id: 3, posts: 10, media: 20 };
    const resp = { data: spacePermission };
    axios.post.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_SPACE_PERMISSIONS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space Permission added',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addSpacePermission(spacePermission))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.SPACE_PERMISSIONS_API, spacePermission);
  });
  it('should create actions to create Space permission failure', () => {
    const spacePermission = { space_id: 3, posts: 10, media: 20 };
    const errorMessage = 'Failed to create space Permission ';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
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
      .dispatch(actions.addSpacePermission(spacePermission))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.SPACE_PERMISSIONS_API, spacePermission);
  });
  it('should create actions to update space  permission success', () => {
    const spacePermission = { id: 2, space_id: 2, posts: 10, media: 20 };
    const resp = { data: spacePermission };
    axios.put.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_SPACE_PERMISSION,
        payload: { id: 2, space_id: 2, posts: 10, media: 20 },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space Permission updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateSpacePermission(spacePermission))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.SPACE_PERMISSIONS_API + '/2', spacePermission);
  });
  it('should create actions to update space  permission failure', () => {
    const spacePermission = { id: 2, space_id: 2, posts: 10, media: 20 };
    const errorMessage = 'Failed to update space Permission ';
    axios.put.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
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
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateSpacePermission(spacePermission))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.SPACE_PERMISSIONS_API + '/2', spacePermission);
  });
  it('should create actions to delete space permission success', () => {
    axios.delete.mockResolvedValue();
    const expectedActions = [
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_SPACE_PERMISSIONS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space Permission deleted',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteSpacePermission(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.SPACE_PERMISSIONS_API + '/1');
  });
  it('should create actions to delete space permission failure', () => {
    const errorMessage = 'Failed to delete space Permission';
    axios.delete.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_SPACE_PERMISSIONS_LOADING,
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
      .dispatch(actions.deleteSpacePermission(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.SPACE_PERMISSIONS_API + '/1');
  });
  it('should create action to addSpacePermissions', () => {
    const spacePermission = [{ id: 2, space_id: 2, posts: 10, media: 20 }];
    const addSpacePermissionsAction = [
      {
        type: types.ADD_SPACE_PERMISSIONS,
        payload: spacePermission,
      },
    ];
    const store = mockStore({ initialState });
    store.dispatch(actions.addSpacePermissions(spacePermission));
    expect(store.getActions()).toEqual(addSpacePermissionsAction);
  });
});
