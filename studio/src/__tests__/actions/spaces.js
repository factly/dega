import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/spaces';
import * as types from '../../constants/spaces';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  orgs: [],
  details: {},
  loading: true,
  selected: 0,
};

describe('spaces actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.LOADING_SPACES,
    };
    expect(actions.loadingSpaces()).toEqual(startLoadingAction);
  });
  it('should create an action to add spaces list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addSpacesAction = {
      type: types.GET_SPACES_SUCCESS,
      payload: data,
    };
    expect(actions.getSpacesSuccess(data)).toEqual(addSpacesAction);
  });
  it('should create an action to add empty space list', () => {
    const data = [];
    const addSpacesAction = {
      type: types.GET_SPACES_SUCCESS,
      payload: [],
    };
    expect(actions.getSpacesSuccess(data)).toEqual(addSpacesAction);
  });
  it('should create an action to add space', () => {
    const data = { id: 1, name: 'tester 1' };
    const addSpaceAction = {
      type: types.ADD_SPACE_SUCCESS,
      payload: data,
    };
    expect(actions.addSpaceSuccess(data)).toEqual(addSpaceAction);
  });
  it('should create an action to delete space', () => {
    const deleteSpaceAction = {
      type: types.DELETE_SPACE_SUCCESS,
      payload: 1,
    };
    expect(actions.deleteSpaceSuccess(1)).toEqual(deleteSpaceAction);
  });
  it('should create an action to update space', () => {
    const data = { id: 1, name: 'tester 1' };
    const updateSpaceAction = {
      type: types.UPDATE_SPACE_SUCCESS,
      payload: data,
    };
    expect(actions.updateSpaceSuccess(data)).toEqual(updateSpaceAction);
  });
  it('should create actions to fetch spaces success', () => {
    const spaces = [{ id: 1, name: 'Space' }];
    const resp = { data: spaces };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.LOADING_SPACES,
      },
      {
        type: types.GET_SPACES_SUCCESS,
        payload: spaces,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getSpaces())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.API_GET_SPACES);
  });
  it('should create actions to fetch spaces failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.LOADING_SPACES,
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
      .dispatch(actions.getSpaces())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.API_GET_SPACES);
  });
  it('should create actions to create space success', () => {
    const space = { name: 'Space' };
    const resp = { data: space };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.LOADING_SPACES,
      },
      {
        type: types.ADD_SPACE_SUCCESS,
        payload: space,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space added',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addSpace(space))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.API_ADD_SPACE, space);
  });
  it('should create actions to create space failure', () => {
    const space = { name: 'Space' };
    const errorMessage = 'Failed to create space';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.LOADING_SPACES,
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
      .dispatch(actions.addSpace(space))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.API_ADD_SPACE, space);
  });
  it('should create actions to update space success', () => {
    const space = { id: 1, name: 'Space' };
    const resp = { data: space };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.LOADING_SPACES,
      },
      {
        type: types.UPDATE_SPACE_SUCCESS,
        payload: space,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space updated',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateSpace(space))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.API_UPDATE_SPACE + '/1', space);
  });
  it('should create actions to update space failure', () => {
    const space = { id: 1, name: 'Space' };
    const errorMessage = 'Failed to update space';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.LOADING_SPACES,
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
      .dispatch(actions.updateSpace(space))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.API_UPDATE_SPACE + '/1', space);
  });
  it('should create actions to delete space success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.LOADING_SPACES,
      },
      {
        type: types.DELETE_SPACE_SUCCESS,
        payload: 1,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteSpace(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.API_DELETE_SPACE + '/1');
  });
  it('should create actions to delete space failure', () => {
    const errorMessage = 'Failed to delete space';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.LOADING_SPACES,
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
      .dispatch(actions.deleteSpace(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.API_DELETE_SPACE + '/1');
  });
  it('should create actions to set selected space', () => {
    const space = { id: 1, name: 'Space' };

    const expectedActions = [
      {
        type: types.SET_SELECTED_SPACE,
        payload: space,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Space changed',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.setSelectedSpace(space));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
