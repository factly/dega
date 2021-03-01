import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/spaceRequests';
import * as types from '../../constants/spaceRequests';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Space Requests actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_SPACE_REQUESTS_LOADING,
      payload: true,
    };
    expect(actions.loadingSpaceRequests()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_SPACE_REQUESTS_LOADING,
      payload: false,
    };
    expect(actions.stopSpaceRequestsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add space request list', () => {
    const data = [
      {
        id: 1,
        space_id: 3,
        posts: 20,
        media: 40,
      },
    ];
    const addSpaceRequestListAction = {
      type: types.ADD_SPACE_REQUESTS,
      payload: data,
    };
    expect(actions.addSpaceRequestsList(data)).toEqual(addSpaceRequestListAction);
  });
  it('should create an action to add space requests request', () => {
    const data = {
      data: [1,2],
      query: 'query',
      total: 2,
    };
    const addSpaceRequestsRequestAction = {
      type: types.ADD_SPACE_REQUESTS_REQUEST,
      payload: data,
    };
    expect(actions.addSpaceRequestsRequest(data)).toEqual(addSpaceRequestsRequestAction);
  });
  it('should create an action to add space request', () => {
    const data = {
      id: 1,
      space_id: 3,
      posts: 20,
      media: 40,
    };
    const addSpaceRequestAction = {
      type: types.ADD_SPACE_REQUEST,
      payload: data,
    };
    expect(actions.getSpaceRequestByID(data)).toEqual(addSpaceRequestAction);
  });
  it('should create an action to reset space request', () => {
    const resetSpaceRequestAction = {
      type: types.RESET_SPACE_REQUESTS,
    };
    expect(actions.resetSpaceRequests()).toEqual(resetSpaceRequestAction);
  });
  it('should create actions to fetch space request isAdmin success', () => {
    const query = { page: 1, limit: 5} ;
    const isAdmin = true;
    const spaceRequest = [{
      id: 1,
      space_id: 3,
      posts: 20,
      media: 40,
    }];
    const resp = { data: { nodes: spaceRequest, total: 1}};
    axios.get.mockResolvedValue(resp);
    
    const expectedActions = [
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_SPACE_REQUESTS,
        payload: [ { id: 1, space_id: 3, posts: 20, media: 40, } ],
      },
      {
        type: types.ADD_SPACE_REQUESTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getSpaces(query,isAdmin))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.SPACE_REQUESTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch space request isAdmin failure', () => {
    const query = { page: 1, limit: 5} ;
    const isAdmin = true;
    const errorMessage = 'Unable to fetch';    
    axios.get.mockRejectedValue(new Error(errorMessage));    
    const expectedActions = [
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
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
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getSpaces(query,isAdmin))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.SPACE_REQUESTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch space request is not Admin success', () => {
    const query = { page: 1, limit: 5} ;
    const isAdmin = false;
    const spaceRequest = [{
      id: 1,
      space_id: 3,
      posts: 20,
      media: 40,
    }];
    const resp = { data: { nodes: spaceRequest, total: 1}};
    axios.get.mockResolvedValue(resp);
    
    const expectedActions = [
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_SPACE_REQUESTS,
        payload: [ { id: 1, space_id: 3, posts: 20, media: 40, } ],
      },
      {
        type: types.ADD_SPACE_REQUESTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getSpaces(query,isAdmin))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.SPACE_REQUESTS_API + '/my', {
      params: query,
    });
  });
  it('should create actions to create Space request success', () => {
    const spaceRequest = { space_id: 3, posts: 20, media: 40 };
    const resp = { data: spaceRequest};
    axios.post.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_SPACE_REQUESTS
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space Request added',
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addSpaceRequest(spaceRequest))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.SPACE_REQUESTS_CREATE_API,spaceRequest);
  });
  it('should create actions to create Space request failure', () => {
    const spaceRequest = { space_id: 3, posts: 20, media: 40 };
    const errorMessage = 'Failed to create space Request ';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
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
      .dispatch(actions.addSpaceRequest(spaceRequest))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.SPACE_REQUESTS_CREATE_API,spaceRequest);
  });
  it('should create actions to approveSpaceRequest `approve` success', () => {
    const request_id = '1';
    const action = 'approve';
    axios.post.mockResolvedValue();
    const expectedActions = [
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_SPACE_REQUESTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space Request ' + action + 'ed',
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.approveSpaceRequest(request_id,action))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.SPACE_REQUESTS_API + '/' + request_id + '/' + action);
  });
  it('should create actions to approveSpaceRequest `approve` failure', () => {
    const request_id = '1';
    const action = 'approve';
    const errorMessage = 'Failed to' + action + 'Space Request';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_SPACE_REQUESTS_LOADING,
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
      .dispatch(actions.approveSpaceRequest(request_id,action))
      .then(() =>  expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.SPACE_REQUESTS_API + '/' + request_id + '/' + action);
  });
  it('should create action to addSpaceRequests', () => {
    const spaceRequest = [{ id: 1, space_id: 3, posts: 20, media: 40}];
    const addSpaceRequestsAction = [
      {
      type: types.ADD_SPACE_REQUESTS,
      payload : spaceRequest,
      }
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addSpaceRequests(spaceRequest))
    expect(store.getActions()).toEqual(addSpaceRequestsAction);
  });
})