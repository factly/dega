import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/policies';
import * as types from '../../constants/policies';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

describe('policies actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_POLICIES_LOADING,
      payload: true,
    };
    expect(actions.loadingPolicies()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_POLICIES_LOADING,
      payload: false,
    };
    expect(actions.stopPoliciesLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add policies list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addPoliciesAction = {
      type: types.ADD_POLICIES,
      payload: data,
    };
    expect(actions.addPolicies(data)).toEqual(addPoliciesAction);
  });
  it('should create an action to add policies request', () => {
    const data = [{ query: 'query' }];
    const addPoliciesRequestAction = {
      type: types.ADD_POLICIES_REQUEST,
      payload: data,
    };
    expect(actions.addPoliciesRequest(data)).toEqual(addPoliciesRequestAction);
  });
  it('should create an action to reset policies', () => {
    const resetPoliciesRequestAction = {
      type: types.RESET_POLICIES,
    };
    expect(actions.resetPolicies()).toEqual(resetPoliciesRequestAction);
  });
  it('should create actions to fetch policies success', () => {
    const query = { page: 1, limit: 5 };
    const policies = [{ id: 1, name: 'Policy' }];
    const resp = { data: { nodes: policies, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
        payload: true,
      },
      {
        type: types.ADD_POLICIES,
        payload: [{ id: 1, name: 'Policy' }],
      },
      {
        type: types.ADD_POLICIES_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_POLICIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPolicies(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POLICIES_API, {
      params: query,
    });
  });
  it('should create actions to fetch policies failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
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
        type: types.SET_POLICIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPolicies(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POLICIES_API, {
      params: query,
    });
  });
  it('should create actions to get policy by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
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
        type: types.SET_POLICIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPolicy(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POLICIES_API + '/' + id);
  });
  it('should create actions to get policy by id success', () => {
    const id = 1;
    const policy = { id, name: 'Policy' };
    const resp = { data: policy };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
        payload: true,
      },
      {
        type: types.GET_POLICY,
        payload: { id, name: 'Policy' },
      },
      {
        type: types.SET_POLICIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPolicy(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.POLICIES_API + '/' + id);
  });
  it('should create actions to create policy success', () => {
    const policy = { name: 'Policy' };
    const resp = { data: policy };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
        payload: true,
      },
      {
        type: types.RESET_POLICIES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy created',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.createPolicy(policy))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POLICIES_API, policy);
  });
  it('should create actions to create policy failure', () => {
    const policy = { name: 'Policy' };
    const errorMessage = 'Failed to create policy';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
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
      .dispatch(actions.createPolicy(policy))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POLICIES_API, policy);
  });
  it('should create actions to update policy success', () => {
    const policy = { id: 1, name: 'Policy' };
    const resp = { data: policy };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
        payload: true,
      },
      {
        type: types.UPDATE_POLICY,
        payload: { id: 1, name: 'Policy' },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_POLICIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePolicy(policy))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POLICIES_API + '/1', policy);
  });
  it('should create actions to update policy failure', () => {
    const policy = { id: 1, name: 'Policy' };
    const errorMessage = 'Failed to update policy';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
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
        type: types.SET_POLICIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePolicy(policy))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.POLICIES_API + '/1', policy);
  });
  it('should create actions to delete policy success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
        payload: true,
      },
      {
        type: types.RESET_POLICIES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Policy deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deletePolicy(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.POLICIES_API + '/1');
  });
  it('should create actions to delete policy failure', () => {
    const errorMessage = 'Failed to delete policy';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
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
      .dispatch(actions.deletePolicy(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.POLICIES_API + '/1');
  });
  it('should create actions to add policies list', () => {
    const policies = [
      { id: 1, name: 'Policy' },
      { id: 2, name: 'Policy' },
    ];

    const expectedActions = [
      {
        type: types.ADD_POLICIES,
        payload: [
          { id: 1, name: 'Policy' },
          { id: 2, name: 'Policy' },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addPolicies(policies));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add empty policies list', () => {
    const policies = [];

    const expectedActions = [
      {
        type: types.ADD_POLICIES,
        payload: [],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addPolicies(policies));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add default policies success', () => {
    const policies = [{ id: 1, name: 'Policy' }];
    const resp = { data: policies };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
        payload: true,
      },
      {
        type: types.ADD_POLICIES,
        payload: [{ id: 1, name: 'Policy' }],
      },
      {
        type: types.ADD_POLICIES_REQUEST,
        payload: {
          data: [1],
          total: 1,
        },
      },
      {
        type: types.SET_POLICIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addDefaultPolicies())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POLICIES_API + '/default');
  });
  it('should create actions to add default policies failure', () => {
    const errorMessage = 'Failed to add default policy';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_POLICIES_LOADING,
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
        type: types.SET_POLICIES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addDefaultPolicies())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.POLICIES_API + '/default');
  });
});
