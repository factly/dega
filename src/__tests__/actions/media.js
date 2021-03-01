import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/media';
import * as types from '../../constants/media';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

describe('media actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_MEDIA_LOADING,
      payload: true,
    };
    expect(actions.loadingMedia()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_MEDIA_LOADING,
      payload: false,
    };
    expect(actions.stopMediaLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add media list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addMediaAction = {
      type: types.ADD_MEDIA,
      payload: data,
    };
    expect(actions.addMediaList(data)).toEqual(addMediaAction);
  });
  it('should create an action to add media request', () => {
    const data = [{ query: 'query' }];
    const addMediaRequestAction = {
      type: types.ADD_MEDIA_REQUEST,
      payload: data,
    };
    expect(actions.addMediaRequest(data)).toEqual(addMediaRequestAction);
  });
  it('should create an action to add medium', () => {
    const data = { id: 1, name: 'new medium' };
    const addMediaRequestAction = {
      type: types.ADD_MEDIUM,
      payload: data,
    };
    expect(actions.getMediumByID(data)).toEqual(addMediaRequestAction);
  });
  it('should create an action to reset media', () => {
    const resetMediaRequestAction = {
      type: types.RESET_MEDIA,
    };
    expect(actions.resetMedia()).toEqual(resetMediaRequestAction);
  });
  it('should create actions to fetch media success', () => {
    const query = { page: 1, limit: 5 };
    const media = [{ id: 1, name: 'Medium' }];
    const resp = { data: { nodes: media, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MEDIA,
        payload: [{ id: 1, name: 'Medium', medium: undefined }],
      },
      {
        type: types.ADD_MEDIA_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMedia(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API, {
      params: query,
    });
  });
  it('should create actions to fetch media success with media', () => {
    const query = { page: 1, limit: 5 };
    const media = [{ id: 1, name: 'Medium' }];
    const resp = { data: { nodes: media, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MEDIA,
        payload: [{ id: 1, name: 'Medium' }],
      },
      {
        type: types.ADD_MEDIA_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMedia(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API, {
      params: query,
    });
  });
  it('should create actions to fetch media failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMedia(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API, {
      params: query,
    });
  });
  it('should create actions to get medium by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMedium(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API + '/' + id);
  });
  it('should create actions to get medium by id success', () => {
    const id = 1;
    const medium = { id, name: 'Medium' };
    const resp = { data: medium };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MEDIUM,
        payload: { id, name: 'Medium', medium: undefined },
      },
      {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMedium(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API + '/' + id);
  });
  it('should create actions to get medium by id where medium has medium', () => {
    const id = 1;
    const medium = { id, name: 'Medium' };
    const resp = { data: medium };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MEDIUM,
        payload: { id, name: 'Medium' },
      },
      {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getMedium(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.MEDIA_API + '/' + id);
  });
  it('should create actions to create medium success', () => {
    const medium = { name: 'Medium' };
    const resp = { data: medium };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.RESET_MEDIA,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Medium added',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addMedium(medium))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.MEDIA_API, medium);
  });
  it('should create actions to create medium failure', () => {
    const medium = { name: 'Medium' };
    const errorMessage = 'Failed to create medium';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
      .dispatch(actions.addMedium(medium))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.MEDIA_API, medium);
  });
  it('should create actions to update medium success', () => {
    const medium = { id: 1, name: 'Medium' };
    const resp = { data: medium };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.ADD_MEDIUM,
        payload: { id: 1, name: 'Medium' },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Medium updated',
        },
      },
      {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateMedium(medium))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.MEDIA_API + '/1', medium);
  });
  it('should create actions to update medium failure', () => {
    const medium = { id: 1, name: 'Medium' };
    const errorMessage = 'Failed to update medium';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
        type: types.SET_MEDIA_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateMedium(medium))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.MEDIA_API + '/1', medium);
  });
  it('should create actions to delete medium success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      },
      {
        type: types.RESET_MEDIA,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Medium deleted',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteMedium(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.MEDIA_API + '/1');
  });
  it('should create actions to delete medium failure', () => {
    const errorMessage = 'Failed to delete medium';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_MEDIA_LOADING,
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
      .dispatch(actions.deleteMedium(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.MEDIA_API + '/1');
  });
  it('should create actions to add media', () => {
    const media = [
      { id: 1, name: 'Medium' },
      { id: 2, name: 'Medium' },
    ];

    const expectedActions = [
      {
        type: types.ADD_MEDIA,
        payload: [
          { id: 1, name: 'Medium' },
          { id: 2, name: 'Medium' },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addMedia(media));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add empty media', () => {
    const media = [];

    const expectedActions = [
      {
        type: types.ADD_MEDIA,
        payload: [],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addMedia(media));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
