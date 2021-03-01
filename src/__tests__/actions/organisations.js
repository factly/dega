import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/organisations';
import * as types from '../../constants/organisations';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe(' organisations actions' ,() => {
  it('should create action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
      payload: true,
    };
    expect(actions.loadingOrganisationPermissions()).toEqual(startLoadingAction);
  });
  it('should create action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
      payload: false,
    };
    expect(actions.stopOrganisationPermissionsLoading()).toEqual(stopLoadingAction);
  });
  it('should  create an action to add organisation Permission list', () => {
    const data = [
      { 
        id: 1, 
        title: 'Org', 
        permission: {
          id: 5,
          organisation_id: 18,
          spaces: 3
        }
      },
      { 
        id: 2, 
        title: 'Org 2', 
        permission: {
          id: 6,
          organisation_id: 12,
          spaces: 5
        }
      },
    ];
    const addOrganisationPermissionAction = {
      type: types.ADD_ORGANISATION_PERMISSIONS,
      payload: data,
    };
    expect(actions.addOrganisationPermissionsList(data)).toEqual(addOrganisationPermissionAction);
  });
  it('should create an action to add organisation Permission request',() => {
    const data= {
      data: [1],
      query: 'query',
      total: 1,
    }
    const addOrganisationPermissionRequestAction = {
      type: types.ADD_ORGANISATION_PERMISSIONS_REQUEST,
      payload: data,
    };
    expect(actions.addOrganisationPermissionsRequest(data)).toEqual(addOrganisationPermissionRequestAction);
  });
  it('should create an action to add organisation Permission', () => {
    const data = { 
      id: 1, 
      title: 'Org', 
      permission: {
        id: 5,
        organisation_id: 18,
        spaces: 3
      }
    };
    const addOrganisationPermissionAction = {
      type: types.ADD_ORGANISATION_PERMISSION,
      payload: data,
    };
    expect(actions.getOrganisationPermissionByID(data)).toEqual(addOrganisationPermissionAction);
  });
  it('should create an action to reset organisation permission', () => {
    const resetOrganisationPermissionAction = {
      type: types.RESET_ORGANISATION_PERMISSIONS,
    };
    expect(actions.resetOrganisationPermissions()).toEqual(resetOrganisationPermissionAction);
  });
  it('should create actions to fetch organisation permission success', () => {
    const query = { page: 1, limit: 5} ;
    const organisationPermission = [{id: 1, 
      title: 'Org', 
      permission: {
        id: 5,
        organisation_id: 18,
        spaces: 3
      }}];
    const resp = { data: { nodes: organisationPermission, total: 1}};
    axios.get.mockResolvedValue(resp);
    
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION_PERMISSIONS,
        payload: [{id: 1, title: 'Org', permission: { id: 5, organisation_id: 18, spaces: 3}}],
      },
      {
        type: types.ADD_ORGANISATION_PERMISSIONS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getOrganisations(query))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.ORGANISATION_PERMISSIONS_API, {
      params: query,
    });
  });
  it('should create actions to fetch organisation permission failure', () => {
    const query = { page: 1, limit: 5} ;
    const errorMessage = 'Unable to fetch';    
    axios.get.mockRejectedValue(new Error(errorMessage));
    
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getOrganisations(query))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.ORGANISATION_PERMISSIONS_API, {
      params: query,
    });
  });
  it('should create actions to create organisation permission success', () => {
    const organisationPermission = { organisation_id: 18, spaces: 3};
    const resp = { data: organisationPermission};
    axios.post.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_ORGANISATION_PERMISSIONS
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation Permission added',
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addOrganisationPermission(organisationPermission))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.ORGANISATION_PERMISSIONS_API,organisationPermission);
  });
  it('should create actions to create organisation permission failure', () => {
    const organisationPermission = { organisation_id: 18, spaces: 3};
    const errorMessage = 'Failed to create organisation Permission ';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addOrganisationPermission(organisationPermission))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.ORGANISATION_PERMISSIONS_API,organisationPermission);
  });
  it('should create actions to update organisation permission success', () => {
    const organisationPermission = { id: 1, organisation_id: 18, spaces: 3};
    const resp = { data: organisationPermission};
    axios.put.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION_PERMISSION,
        payload: { id: 1, organisation_id: 18, spaces: 3},
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation Permission updated',
        },
      },
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateOrganisationPermission(organisationPermission))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.ORGANISATION_PERMISSIONS_API + '/1',organisationPermission);
  });
  it('should create actions to update organisation permission failure', () => {
    const organisationPermission = { id: 1, organisation_id: 18, spaces: 3};
    const errorMessage = 'Failed to update organisation permission';
    axios.put.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateOrganisationPermission(organisationPermission))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.ORGANISATION_PERMISSIONS_API + '/1',organisationPermission);
  });
  it('should create actions to delete organisation permission success', () => {
    axios.delete.mockResolvedValue();
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_ORGANISATION_PERMISSIONS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation Permission deleted',
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteOrganisationPermission(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.ORGANISATION_PERMISSIONS_API + '/1');  
  });
  it('should create actions to delete organisation permission failure', () => {
    const errorMessage = 'Failed to delete organisation Permission';
    axios.delete.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_PERMISSIONS_LOADING,
        payload: true,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: errorMessage,
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteOrganisationPermission(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.ORGANISATION_PERMISSIONS_API + '/1');  
  })
  it('should create action to addOrganisationPermissions', () => {
    const organisationPermission = [{ organisation_id: 18, spaces: 3}];
    const addOrganisationPermissionsAction = [
      {
      type: types.ADD_ORGANISATION_PERMISSIONS,
      payload : organisationPermission,
      }
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addOrganisationPermissions(organisationPermission))
    expect(store.getActions()).toEqual(addOrganisationPermissionsAction);
  });
})