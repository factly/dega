import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/organisationRequests';
import * as types from '../../constants/organisationRequests';
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

describe('Organisation Requests actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_ORGANISATION_REQUESTS_LOADING,
      payload: true,
    };
    expect(actions.loadingOrganisationRequests()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_ORGANISATION_REQUESTS_LOADING,
      payload: false,
    };
    expect(actions.stopOrganisationRequestsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to Add Organisation Requests list', () => {
    const data = [
      { id: 1, spaces: 4 },
      { id: 2, spaces: 3 },
    ];
    const addOrganisationnRequestsAction = {
      type: types.ADD_ORGANISATION_REQUESTS,
      payload: data,
    };
    expect(actions.addOrganisationRequestsList(data)).toEqual(addOrganisationnRequestsAction);
  });
  it('should create an action to Add Organisation Requests request', () => {
    const data = [{ query: 'query' }];
    const addOrganisationnRequestsRequestAction = {
      type: types.ADD_ORGANISATION_REQUESTS_REQUEST,
      payload: data,
    };
    expect(actions.addOrganisationRequestsRequest(data)).toEqual(
      addOrganisationnRequestsRequestAction,
    );
  });
  it('should create an action to reset organisation requests', () => {
    const resetOrganisationRequestsAction = {
      type: types.RESET_ORGANISATION_REQUESTS,
    };
    expect(actions.resetOrganisationRequests()).toEqual(resetOrganisationRequestsAction);
  });
  it('should create an action to add organisation request', () => {
    const data = { id: 1, spaces: 4 };
    const addorganisationRequestAction = {
      type: types.ADD_ORGANISATION_REQUEST,
      payload: data,
    };
    expect(actions.getOrganisationRequestByID(data)).toEqual(addorganisationRequestAction);
  });
  it('should create actions to getOrganisations requests and isAdmin success ', () => {
    const query = { page: 1, limit: 5 };
    const isAdmin = true;
    const organisationRequests = [{ id: 1, spaces: 4 }];
    const resp = { data: { nodes: organisationRequests, total: 1 } };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION_REQUESTS,
        payload: [{ id: 1, spaces: 4 }],
      },
      {
        type: types.ADD_ORGANISATION_REQUESTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getOrganisations(query, isAdmin))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.ORGANISATION_REQUESTS_API, {
      params: query,
    });
  });
  it('should create actions to getOrganisations requests and isAdmin failure ', () => {
    const query = { page: 1, limit: 5 };
    const isAdmin = true;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
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
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getOrganisations(query, isAdmin))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.ORGANISATION_REQUESTS_API, {
      params: query,
    });
  });
  it('should create actions to getOrganisations requests and is not Admin success ', () => {
    const query = { page: 1, limit: 5 };
    const organisationRequests = [{ id: 1, spaces: 4 }];
    const resp = { data: { nodes: organisationRequests, total: 1 } };
    axios.get.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_ORGANISATION_REQUESTS,
        payload: [{ id: 1, spaces: 4 }],
      },
      {
        type: types.ADD_ORGANISATION_REQUESTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getOrganisations(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.ORGANISATION_REQUESTS_API + '/my', {
      params: query,
    });
  });
  it('should create actions to getOrganisations requests and is not Admin failure ', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
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
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.getOrganisations(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.ORGANISATION_REQUESTS_API + '/my', {
      params: query,
    });
  });
  it('should create actions to addOrganisationRequest success', () => {
    const organisationRequest = { spaces: 4 };
    const resp = { data: organisationRequest };
    axios.post.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_ORGANISATION_REQUESTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation Request added',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addOrganisationRequest(organisationRequest))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.ORGANISATION_REQUESTS_CREATE_API,
      organisationRequest,
    );
  });
  it('should create actions to addOrganisationRequest failure', () => {
    const organisationRequest = { spaces: 4 };
    const errorMessage = 'Failed to create Organisation Request';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
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
      .dispatch(actions.addOrganisationRequest(organisationRequest))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.ORGANISATION_REQUESTS_CREATE_API,
      organisationRequest,
    );
  });
  it('should create actions to approveOrganisationRequest `approve` success', () => {
    const request_id = '1';
    const action = 'approve';
    axios.post.mockResolvedValue();
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_ORGANISATION_REQUESTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation Request ' + action + 'ed',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.approveOrganisationRequest(request_id, action))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.ORGANISATION_REQUESTS_API + '/' + request_id + '/' + action,
    );
  });
  it('should create actions to approveOrganisationRequest `approve` failure', () => {
    const request_id = '1';
    const action = 'approve';
    const errorMessage = 'Failed to' + action + 'Organisation Request';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
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
      .dispatch(actions.approveOrganisationRequest(request_id, action))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.ORGANISATION_REQUESTS_API + '/' + request_id + '/' + action,
    );
  });
  it('should create actions to approveOrganisationRequest `reject` success', () => {
    const request_id = '1';
    const action = 'reject';
    axios.post.mockResolvedValue();
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_ORGANISATION_REQUESTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Organisation Request ' + action + 'ed',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.approveOrganisationRequest(request_id, action))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.ORGANISATION_REQUESTS_API + '/' + request_id + '/' + action,
    );
  });
  it('should create actions to approveOrganisationRequest `reject` failure', () => {
    const request_id = '1';
    const action = 'reject';
    const errorMessage = 'Failed to' + action + 'Organisation Request';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_ORGANISATION_REQUESTS_LOADING,
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
      .dispatch(actions.approveOrganisationRequest(request_id, action))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(
      types.ORGANISATION_REQUESTS_API + '/' + request_id + '/' + action,
    );
  });
  it('should create an action to addOrganisationRequests', () => {
    const organisationRequest = [{ id: 1, spaces: 4 }];
    const addOrganisationRequestsAction = [
      {
        type: types.ADD_ORGANISATION_REQUESTS,
        payload: organisationRequest,
      },
    ];
    const store = mockStore({ initialState });
    store.dispatch(actions.addOrganisationRequests(organisationRequest));
    expect(store.getActions()).toEqual(addOrganisationRequestsAction);
  });
});
