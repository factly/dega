import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/formats';
import * as types from '../../constants/formats';
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

describe('formats actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_FORMATS_LOADING,
      payload: true,
    };
    expect(actions.loadingFormats()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_FORMATS_LOADING,
      payload: false,
    };
    expect(actions.stopFormatsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add formats list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addFormatsAction = {
      type: types.ADD_FORMATS,
      payload: data,
    };
    expect(actions.addFormats(data)).toEqual(addFormatsAction);
  });
  it('should create an action to add formats request', () => {
    const data = [{ query: 'query' }];
    const addFormatsRequestAction = {
      type: types.ADD_FORMATS_REQUEST,
      payload: data,
    };
    expect(actions.addFormatsRequest(data)).toEqual(addFormatsRequestAction);
  });
  it('should create an action to add format', () => {
    const data = { id: 1, name: 'new format' };
    const addFormatsRequestAction = {
      type: types.ADD_FORMAT,
      payload: data,
    };
    expect(actions.getFormatByID(data)).toEqual(addFormatsRequestAction);
  });
  it('should create an action to reset formats', () => {
    const resetFormatsRequestAction = {
      type: types.RESET_FORMATS,
    };
    expect(actions.resetFormats()).toEqual(resetFormatsRequestAction);
  });

  it('should create actions to fetch formats success', () => {
    const query = { page: 1, limit: 5 };
    const formats = [{ id: 1, name: 'Format' }];
    const resp = { data: { nodes: formats, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_FORMATS,
        payload: [{ id: 1, name: 'Format' }],
      },
      {
        type: types.ADD_FORMATS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_FORMATS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getFormats(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.FORMATS_API, {
      params: query,
    });
  });
  it('should create actions to fetch formats failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch formats';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
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
        type: types.SET_FORMATS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getFormats(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.FORMATS_API, {
      params: query,
    });
  });
  it('should create actions to get format by id success', () => {
    const id = 1;
    const format = { id, name: 'Format' };
    const resp = { data: format };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_FORMAT,
        payload: { id, name: 'Format' },
      },
      {
        type: types.SET_FORMATS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getFormat(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.FORMATS_API + '/' + id);
  });
  it('should create actions to get format by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch format';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
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
        type: types.SET_FORMATS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getFormat(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.FORMATS_API + '/' + id);
  });
  it('should create actions to create format success', () => {
    const format = { name: 'Format' };
    const resp = { data: format };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_FORMATS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Format added',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addFormat(format))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.FORMATS_API, format);
  });
  it('should create actions to create format failure', () => {
    const format = { name: 'Format' };
    const errorMessage = 'Failed to create format';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
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
      .dispatch(actions.addFormat(format))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.FORMATS_API, format);
  });
  it('should create actions to update format success', () => {
    const format = { id: 1, name: 'Format' };
    const resp = { data: format };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_FORMAT,
        payload: { id: 1, name: 'Format' },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Format updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_FORMATS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateFormat(format))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.FORMATS_API + '/1', format);
  });
  it('should create actions to update format failure', () => {
    const format = { id: 1, name: 'Format' };
    const errorMessage = 'Failed to update format';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
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
        type: types.SET_FORMATS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateFormat(format))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.FORMATS_API + '/1', format);
  });
  it('should create actions to delete format success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_FORMATS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Format deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteFormat(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.FORMATS_API + '/1');
  });
  it('should create actions to delete format failure', () => {
    const errorMessage = 'Failed to delete format';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
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
      .dispatch(actions.deleteFormat(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.FORMATS_API + '/1');
  });
  it('should create actions to add default formats', () => {
    const formats = [{ id: 1, name: 'Format' }];
    const resp = { data: { nodes: formats, total: 1 } };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_FORMATS,
        payload: [{ id: 1, name: 'Format' }],
      },
      {
        type: types.ADD_FORMATS_REQUEST,
        payload: {
          data: [1],
          total: 1,
        },
      },
      {
        type: types.SET_FORMATS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addDefaultFormats())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.FORMATS_API + '/default');
  });
  it('should create actions to add default formats failure', () => {
    const errorMessage = 'Failed to add default format';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
      {
        type: types.SET_FORMATS_LOADING,
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
        type: types.SET_FORMATS_LOADING,
        payload: false,
      },
    ];
    const store = mockStore({ initialState });
    store
      .dispatch(actions.addDefaultFormats())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.FORMATS_API + '/default');
  });
});
