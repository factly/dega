import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/podcasts';
import * as types from '../../constants/podcasts';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_EPISODES } from '../../constants/episodes';
import { ADD_CATEGORIES } from '../../constants/categories';
import { ADD_MEDIA } from '../../constants/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);
const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('Podcast actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_PODCASTS_LOADING,
      payload: true,
    };
    expect(actions.loadingPodcasts()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_PODCASTS_LOADING,
      payload: false,
    };
    expect(actions.stopPodcastsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add podcast list', () => {
    const data = [
      { id: 1, title: 'podcast 1' },
      { id: 2, title: 'podcast 2' },
    ];

    const addPodcastsAction = {
      type: types.ADD_PODCASTS,
      payload: data,
    };
    expect(actions.addPodcastsList(data)).toEqual(addPodcastsAction);
  });
  it('should create an action to add podcast request', () => {
    const data = [{ query: 'query' }];
    const addPodcastsRequestAction = {
      type: types.ADD_PODCASTS_REQUEST,
      payload: data,
    };
    expect(actions.addPodcastsRequest(data)).toEqual(addPodcastsRequestAction);
  });
  it('should create an action to add podcast', () => {
    const data = { id: 1, title: 'new podcast' };
    const addPodcastAction = {
      type: types.ADD_PODCAST,
      payload: data,
    };
    expect(actions.getPodcastByID(data)).toEqual(addPodcastAction);
  });
  it('should create an action to reset podcast', () => {
    const resetPodcastsAction = {
      type: types.RESET_PODCASTS,
    };
    expect(actions.resetPodcasts()).toEqual(resetPodcastsAction);
  });
  it('should create actions to fetch podcasts success', () => {
    const query = { page: 1, limit: 5 };
    const podcasts = [
      {
        id: 1,
        title: 'Podcast',
        episodes: [{ id: 1 }],
        categories: [{ id: 1, medium: { id: 1 } }],
      },
    ];
    const resp = { data: { nodes: podcasts, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 1 }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [{ id: 1, medium: 1 }],
      },
      {
        type: ADD_EPISODES,
        payload: [{ id: 1 }],
      },
      {
        type: types.ADD_PODCASTS,
        payload: [{ id: 1, title: 'Podcast', episodes: [1], categories: [1] }],
      },
      {
        type: types.ADD_PODCASTS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_PODCASTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPodcasts(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PODCASTS_API, {
      params: query,
    });
  });
  it('should create actions to fetch podcasts failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
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
        type: types.SET_PODCASTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPodcasts(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PODCASTS_API, {
      params: query,
    });
  });
  it('should create actions to get podcast by id success', () => {
    const id = 1;
    const podcast = {
      id,
      title: 'Podcast',
      episodes: [{ id: 1 }],
      categories: [{ id: 1, medium: { id: 1 } }],
    };
    const resp = { data: podcast };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
        payload: true,
      },
      {
        type: ADD_EPISODES,
        payload: [{ id: 1 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 1 }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [{ id: 1, medium: 1 }],
      },
      {
        type: types.ADD_PODCAST,
        payload: {
          id,
          title: 'Podcast',
          episodes: [1],
          categories: [1],
        },
      },
      {
        type: types.SET_PODCASTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPodcast(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PODCASTS_API + '/' + id);
  });
  it('should create actions to get podcast by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
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
        type: types.SET_PODCASTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getPodcast(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.PODCASTS_API + '/' + id);
  });
  it('should create actions to create podcast success', () => {
    const podcast = { title: 'Podcast' };
    const resp = { data: podcast };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_PODCASTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Podcast added',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addPodcast(podcast))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.PODCASTS_API, podcast);
  });
  it('should create actions to create podcast failure', () => {
    const podcast = { title: 'Podcast' };
    const errorMessage = 'Failed to create podcast';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
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
      .dispatch(actions.addPodcast(podcast))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.PODCASTS_API, podcast);
  });
  it('should create actions to update podcast success', () => {
    const podcast = {
      id: 1,
      title: 'Podcast',
      episodes: [{ id: 1 }],
      categories: [{ id: 1, medium: { id: 1 } }],
    };
    const resp = { data: podcast };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
        payload: true,
      },
      {
        type: ADD_EPISODES,
        payload: [{ id: 1 }],
      },
      {
        type: ADD_MEDIA,
        payload: [{ id: 1 }],
      },
      {
        type: ADD_CATEGORIES,
        payload: [{ id: 1, medium: 1 }],
      },
      {
        type: types.ADD_PODCAST,
        payload: { id: 1, title: 'Podcast', episodes: [1], categories: [1] },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Podcast updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_PODCASTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePodcast(podcast))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PODCASTS_API + '/1', podcast);
  });
  it('should create actions to update podcast failure', () => {
    const podcast = { id: 1, title: 'Podcast' };
    const errorMessage = 'Failed to update podcast';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
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
        type: types.SET_PODCASTS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updatePodcast(podcast))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.PODCASTS_API + '/1', podcast);
  });
  it('should create actions to delete podcast success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_PODCASTS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Podcast deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deletePodcast(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.PODCASTS_API + '/1');
  });
  it('should create actions to delete podcast failure', () => {
    const errorMessage = 'Failed to delete podcast';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_PODCASTS_LOADING,
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
      .dispatch(actions.deletePodcast(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.PODCASTS_API + '/1');
  });
  it('should create actions to add podcast list', () => {
    const podcast = [
      { id: 1, title: 'Podcast 1' },
      { id: 2, title: 'Podcast 2' },
    ];

    const expectedActions = [
      {
        type: types.ADD_PODCASTS,
        payload: [
          { id: 1, title: 'Podcast 1' },
          { id: 2, title: 'Podcast 2' },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addPodcasts(podcast));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
