import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/tags';
import * as types from '../../constants/tags';
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

describe('tags actions', () => {
  // loading actions
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_TAGS_LOADING,
      payload: true,
    };
    expect(actions.loadingTags()).toEqual(startLoadingAction);
  });

  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_TAGS_LOADING,
      payload: false,
    };
    expect(actions.stopTagsLoading()).toEqual(stopLoadingAction);
  });

  // addtags
  it('should create an action to add tags list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addTagsAction = {
      type: types.ADD_TAGS,
      payload: data,
    };
    expect(actions.addTags(data)).toEqual(addTagsAction);
  });

  // add tags request
  it('should create an action to add tags request', () => {
    const data = [{ query: 'query' }];
    const addTagsRequestAction = {
      type: types.ADD_TAGS_REQUEST,
      payload: data,
    };
    expect(actions.addTagsRequest(data)).toEqual(addTagsRequestAction);
  });

  // reset tags
  it('should create an action to reset tags', () => {
    const resetTagsRequestAction = {
      type: types.RESET_TAGS,
    };
    expect(actions.resetTags()).toEqual(resetTagsRequestAction);
  });

  // fetch tags
  it('should create actions to fetch tags success', () => {
    const query = { page: 1, limit: 5 };
    const tags = [{ id: 1, name: 'Tag' }];
    const resp = { data: { nodes: tags, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_TAGS,
        payload: tags,
      },
      {
        type: types.ADD_TAGS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_TAGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getTags(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));

    expect(axios.get).toHaveBeenCalledWith(types.TAGS_API, {
      params: query,
    });
  });

  it('should create actions to fetch tags failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
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
        type: types.SET_TAGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getTags(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.TAGS_API, { params: query, });
  });

  it('should create action when there is no tags in response`', () => {
    const query = { page: 1, limit: 5 };
    const resp = { data: { nodes: [], total: 0 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_TAGS,
        payload: [],
      },
      {
        type: types.ADD_TAGS_REQUEST,
        payload: {
          data: [],
          query: query,
          total: 0,
        },
      },
      {
        type: types.SET_TAGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getTags(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.TAGS_API, { params: query });
  });

  it('should create actions to get tag by id success', () => {
    const id = 1;
    const tag = { id, name: 'Tag' };
    const resp = { data: tag };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
        payload: true,
      },
      {
        type: types.GET_TAG,
        payload: { id, name: 'Tag', description: { json: undefined, html: undefined } },
      },
      {
        type: types.SET_TAGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getTag(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.TAGS_API + '/' + id);
  });
  it('should create actions to get tag by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
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
        type: types.SET_TAGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getTag(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.TAGS_API + '/' + id);
  });

  it('should not create actions for fetching tag when spaceID is 0 ', () => {
    const query = { page: 1, limit: 5 };
    const expectedActions = [];
    const store = mockStore({ ...initialState, spaces: { selected: 0 } });
    store.dispatch(actions.getTags(query));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should create actions to create tag success', () => {
    const tag = { name: 'Tag' };
    const resp = { data: tag };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_TAGS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Tag created',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.createTag(tag))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.TAGS_API, tag);
  });

  it('should create actions to create tag failure', () => {
    const tag = { name: 'Tag' };
    const errorMessage = 'Failed to create tag';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
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
      .dispatch(actions.createTag(tag))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.TAGS_API, tag);
  });
  it('should create actions to update tag success', () => {
    const tag = { id: 1, name: 'Tag' };
    const resp = { data: tag };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
        payload: true,
      },
      {
        type: types.UPDATE_TAG,
        payload: tag,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Tag updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_TAGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateTag(tag))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.TAGS_API + '/1', tag);
  });
  it('should create actions to update tag failure', () => {
    const tag = { id: 1, name: 'Tag' };
    const errorMessage = 'Failed to update tag';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
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
        type: types.SET_TAGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateTag(tag))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.TAGS_API + '/1', tag);
  });
  it('should create actions to delete tag success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_TAGS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Tag deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteTag(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.TAGS_API + '/1');
  });
  it('should create actions to delete tag failure', () => {
    const errorMessage = 'Failed to delete tag';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_TAGS_LOADING,
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
      .dispatch(actions.deleteTag(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.TAGS_API + '/1');
  });
  it('should create actions to add tags list', () => {
    const tags = [
      { id: 1, name: 'Tag' },
      { id: 2, name: 'Tag' },
    ];

    const expectedActions = [
      {
        type: types.ADD_TAGS,
        payload: [
          { id: 1, name: 'Tag' },
          { id: 2, name: 'Tag' },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addTags(tags));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add empty tags list', () => {
    const tags = [];

    const expectedActions = [
      {
        type: types.ADD_TAGS,
        payload: [],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addTags(tags));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
