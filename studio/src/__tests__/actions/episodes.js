import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/episodes';
import * as types from '../../constants/episodes';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_PODCASTS } from '../../constants/podcasts';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('episodes actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_EPISODES_LOADING,
      payload: true,
    };
    expect(actions.loadingEpisodes()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_EPISODES_LOADING,
      payload: false,
    };
    expect(actions.stopEpisodesLoading()).toEqual(stopLoadingAction);
  });

  it('should create an action to add episode request', () => {
    const data = [{ query: 'query' }];
    const addEpisodesRequestAction = {
      type: types.ADD_EPISODES_REQUEST,
      payload: data,
    };
    expect(actions.addEpisodesRequest(data)).toEqual(addEpisodesRequestAction);
  });
  it('should create an action to reset episode', () => {
    const resetEpisodesAction = {
      type: types.RESET_EPISODES,
    };
    expect(actions.resetEpisodes()).toEqual(resetEpisodesAction);
  });
  it('should create actions to fetch episodes success', () => {
    const query = { q: 'episode', sort: 'asc', podcast: [1] };
    const episodes = [
      {
        id: 1,
        title: 'Episode',
        podcast: {
          id: 1,
        },
        description: { "hello": "test" },
        description_html: "<p>test</p>",
      },
    ];
    const resp = { data: { nodes: episodes, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: ADD_PODCASTS,
        payload: [{ id: 1 }],
      },
      {
        type: types.ADD_EPISODES,
        payload: [{ id: 1, title: 'Episode', podcast: 1, description: { json: { "hello": "test" }, html: "<p>test</p>" }, }],
      },
      {
        type: types.ADD_EPISODES_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEpisodes(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
  it('should create actions to fetch episode failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
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
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEpisodes(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.EPISODES_API, {
      params: new URLSearchParams(query),
    });
  });
  it('should create actions to get episode by id success', () => {
    const id = 1;
    const podcast = { id: 1 };
    const episode = { id, title: 'Episode', podcast: podcast, description: { "hello": "test" }, description_html: "<p>test</p>" };
    const resp = { data: episode };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: ADD_PODCASTS,
        payload: [podcast],
      },
      {
        type: types.GET_EPISODE,
        payload: { id, title: 'Episode', podcast: 1, description: { json: { "hello": "test" }, html: "<p>test</p>" }, },
      },
      {
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEpisode(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.EPISODES_API + '/' + id);
  });
  it('should create actions to get episode by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
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
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEpisode(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.EPISODES_API + '/' + id);
  });
  it('should create actions to get episode by id with no podcast no description', () => {
    const id = 1;
    const podcast = {};
    const episode = { id, title: 'Episode', podcast: podcast };
    const resp = { data: episode };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: types.GET_EPISODE,
        payload: { id, title: 'Episode', podcast: undefined, description: { json: undefined, html: undefined }, },
      },
      {
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getEpisode(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.EPISODES_API + '/' + id);
  });
  it('should create actions to create episode success', () => {
    const episode = { title: 'Episode' };
    const resp = { data: episode };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: types.RESET_EPISODES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Episode created',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.createEpisode(episode))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.EPISODES_API, episode);
  });
  it('should create actions to create episode failure', () => {
    const episode = { title: 'Episode' };
    const errorMessage = 'Failed to create episode';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
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
      .dispatch(actions.createEpisode(episode))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.EPISODES_API, episode);
  });
  it('should create actions to update episode success', () => {
    const podcast = { id: 1 };
    const episode = {
      id: 1, title: 'Episode', podcast: podcast, description: { json: { "hello": "test" }, html: "<p>test</p>" }
    };
    const resp = { data: episode };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: ADD_PODCASTS,
        payload: [podcast],
      },
      {
        type: types.UPDATE_EPISODE,
        payload: { id: 1, title: 'Episode', podcast: 1, description: { json: { "hello": "test" }, html: "<p>test</p>" } },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Episode updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateEpisode(episode))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.EPISODES_API + '/1', episode);
  });
  it('should create actions to update episode success with description and html', () => {
    const podcast = { id: 1 };
    const episode = {
      id: 1, title: 'Episode', podcast: podcast, description: { "hello": "test" }, description_html: "<p>test</p>"
    };
    const resp = { data: episode };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: ADD_PODCASTS,
        payload: [podcast],
      },
      {
        type: types.UPDATE_EPISODE,
        payload: { id: 1, title: 'Episode', podcast: 1, description: { json: { "hello": "test" }, html: "<p>test</p>" } },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Episode updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateEpisode(episode))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.EPISODES_API + '/1', episode);
  });
  it('should create actions to update episode success without description and html', () => {
    const podcast = { id: 1 };
    const episode = {
      id: 1, title: 'Episode', podcast: podcast
    };
    const resp = { data: episode };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: ADD_PODCASTS,
        payload: [podcast],
      },
      {
        type: types.UPDATE_EPISODE,
        payload: { id: 1, title: 'Episode', podcast: 1, description: { json: undefined , html: undefined } },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Episode updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateEpisode(episode))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.EPISODES_API + '/1', episode);
  });

  it('should create actions to update episode failure', () => {
    const episode = { id: 1, title: 'Episode' };
    const errorMessage = 'Failed to update episode';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
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
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateEpisode(episode))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.EPISODES_API + '/1', episode);
  });
  it('should create actions to update episode success without podcast and without description ', () => {
    const podcast = {};
    const description = { json: undefined, html: undefined };
    const episode = { id: 1, title: 'Episode', podcast: podcast, description: description };
    const resp = { data: episode };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: types.UPDATE_EPISODE,
        payload: { id: 1, title: 'Episode', podcast: undefined, description: { json: undefined, html: undefined } },
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Episode updated',
          time: Date.now(),
        },
      },
      {
        type: types.SET_EPISODES_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateEpisode(episode))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.EPISODES_API + '/1', episode);
  });
  it('should create actions to delete episode success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
        payload: true,
      },
      {
        type: types.RESET_EPISODES,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Episode deleted',
          time: Date.now(),
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteEpisode(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.EPISODES_API + '/1');
  });
  it('should create actions to delete episode failure', () => {
    const errorMessage = 'Failed to delete Episode';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_EPISODES_LOADING,
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
      .dispatch(actions.deleteEpisode(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.EPISODES_API + '/1');
  });
  it('should create actions to add episode list', () => {
    const episode = [
      { id: 1, title: 'Episode 1' },
      { id: 2, title: 'Episode 2' },
    ];

    const expectedActions = [
      {
        type: types.ADD_EPISODES,
        payload: [
          { id: 1, title: 'Episode 1' },
          { id: 2, title: 'Episode 2' },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addEpisodes(episode));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
