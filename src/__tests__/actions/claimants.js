import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/claimants';
import * as types from '../../constants/claimants';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_MEDIA } from '../../constants/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('claimants actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_CLAIMANTS_LOADING,
      payload: true,
    };
    expect(actions.loadingClaimants()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_CLAIMANTS_LOADING,
      payload: false,
    };
    expect(actions.stopClaimantsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add claimants list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addClaimantsAction = {
      type: types.ADD_CLAIMANTS,
      payload: data,
    };
    expect(actions.addClaimantsList(data)).toEqual(addClaimantsAction);
  });
  it('should create an action to add claimants request', () => {
    const data = [{ query: 'query' }];
    const addClaimantsRequestAction = {
      type: types.ADD_CLAIMANTS_REQUEST,
      payload: data,
    };
    expect(actions.addClaimantsRequest(data)).toEqual(addClaimantsRequestAction);
  });
  it('should create an action to add claimant', () => {
    const data = { id: 1, name: 'new claimant' };
    const addClaimantsRequestAction = {
      type: types.ADD_CLAIMANT,
      payload: data,
    };
    expect(actions.getClaimantByID(data)).toEqual(addClaimantsRequestAction);
  });
  it('should create an action to reset claimants', () => {
    const resetClaimantsRequestAction = {
      type: types.RESET_CLAIMANTS,
    };
    expect(actions.resetClaimants()).toEqual(resetClaimantsRequestAction);
  });
  it('should create actions to fetch claimants success without media', () => {
    const query = { page: 1, limit: 5 };
    const claimants = [{ id: 1, name: 'Claimant' }];
    const resp = { data: { nodes: claimants, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [{ id: 1, name: 'Claimant', medium: undefined }],
      },
      {
        type: types.ADD_CLAIMANTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimants(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch claimants success not all with media', () => {
    const query = { page: 1, limit: 5 };

    const claimants = [
      { id: 1, name: 'Claimant', medium: { id: 11, medium: 'Medium' } },
      { id: 2, name: 'Claimant 2' },
    ];
    const resp = { data: { nodes: claimants, total: 2 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 11, medium: 'Medium' }],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [
          { id: 1, name: 'Claimant', medium: 11 },
          { id: 2, name: 'Claimant 2', medium: undefined },
        ],
      },
      {
        type: types.ADD_CLAIMANTS_REQUEST,
        payload: {
          data: [1, 2],
          query: query,
          total: 2,
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimants(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch claimants success all with media', () => {
    const query = { page: 1, limit: 5 };

    const claimants = [
      { id: 1, name: 'Claimant', medium: { id: 11, medium: 'Medium' } },
      { id: 2, name: 'Claimant 2', medium: { id: 21, medium: 'Medium 2' } },
    ];
    const resp = { data: { nodes: claimants, total: 2 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [
          { id: 11, medium: 'Medium' },
          { id: 21, medium: 'Medium 2' },
        ],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [
          { id: 1, name: 'Claimant', medium: 11 },
          { id: 2, name: 'Claimant 2', medium: 21 },
        ],
      },
      {
        type: types.ADD_CLAIMANTS_REQUEST,
        payload: {
          data: [1, 2],
          query: query,
          total: 2,
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimants(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch claimants failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimants(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API, {
      params: query,
    });
  });
  it('should create actions to get claimant by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimant(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API + '/' + id);
  });
  it('should create actions to get claimant by id success', () => {
    const id = 1;
    const claimant = { id, name: 'Claimant' };
    const resp = { data: claimant };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_CLAIMANT,
        payload: { id, name: 'Claimant', medium: undefined },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimant(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API + '/' + id);
  });
  it('should create actions to get claimant by id where claimant has medium', () => {
    const id = 1;
    const medium = { id: 1, medium: 'Medium' };
    const claimant = { id, name: 'Claimant', medium };
    const resp = { data: claimant };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_CLAIMANT,
        payload: { id, name: 'Claimant', medium: 1 },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getClaimant(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.CLAIMANTS_API + '/' + id);
  });
  it('should create actions to create claimant success', () => {
    const claimant = { name: 'Claimant' };
    const resp = { data: claimant };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_CLAIMANTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claimant added',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.CLAIMANTS_API, claimant);
  });
  it('should create actions to create claimant failure', () => {
    const claimant = { name: 'Claimant' };
    const errorMessage = 'Failed to create claimant';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
      .dispatch(actions.addClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.CLAIMANTS_API, claimant);
  });
  it('should create actions to update claimant without medium success', () => {
    const claimant = { id: 1, name: 'Claimant' };
    const resp = { data: claimant };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_CLAIMANT,
        payload: { id: 1, name: 'Claimant', medium: undefined },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claimant updated',
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1', claimant);
  });
  it('should create actions to update claimant with medium success', () => {
    const medium = { id: 4, name: 'medium' };
    const claimant = { id: 1, name: 'Claimant', medium: medium };
    const resp = { data: claimant };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_CLAIMANT,
        payload: { id: 1, name: 'Claimant', medium: 4 },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claimant updated',
        },
      },
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1', claimant);
  });
  it('should create actions to update claimant failure', () => {
    const claimant = { id: 1, name: 'Claimant' };
    const errorMessage = 'Failed to update claimant';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
        type: types.SET_CLAIMANTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateClaimant(claimant))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1', claimant);
  });
  it('should create actions to delete claimant success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_CLAIMANTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Claimant deleted',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteClaimant(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1');
  });
  it('should create actions to delete claimant failure', () => {
    const errorMessage = 'Failed to delete claimant';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_CLAIMANTS_LOADING,
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
      .dispatch(actions.deleteClaimant(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.CLAIMANTS_API + '/1');
  });
  it('should create actions to add claimants list', () => {
    const medium = { id: 4, name: 'mediumm' };
    const claimants = [
      { id: 1, name: 'Claimant' },
      { id: 2, name: 'Claimant', medium: medium },
    ];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [
          { id: 1, name: 'Claimant', medium: undefined },
          { id: 2, name: 'Claimant', medium: 4 },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addClaimants(claimants));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add claimants list where no claimant has medium', () => {
    const claimants = [
      { id: 1, name: 'Claimant' },
      { id: 2, name: 'Claimant' },
    ];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [
          { id: 1, name: 'Claimant', medium: undefined },
          { id: 2, name: 'Claimant', medium: undefined },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addClaimants(claimants));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add empty claimants list', () => {
    const claimants = [];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_CLAIMANTS,
        payload: [],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addClaimants(claimants));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
