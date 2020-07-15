import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/ratings';
import * as types from '../../constants/ratings';
import { ADD_NOTIFICATION } from '../../constants/notifications';
import { ADD_MEDIA } from '../../constants/media';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');

const initialState = {
  req: [],
  details: {},
  loading: true,
  total: 0,
};

describe('ratings actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_RATINGS_LOADING,
      payload: true,
    };
    expect(actions.loadingRatings()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_RATINGS_LOADING,
      payload: false,
    };
    expect(actions.stopRatingsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add ratings list', () => {
    const data = [
      { id: 1, name: 'tester 1' },
      { id: 2, name: 'testing 2' },
    ];

    const addRatingsAction = {
      type: types.ADD_RATINGS,
      payload: data,
    };
    expect(actions.addRatingsList(data)).toEqual(addRatingsAction);
  });
  it('should create an action to add ratings request', () => {
    const data = [{ query: 'query' }];
    const addRatingsRequestAction = {
      type: types.ADD_RATINGS_REQUEST,
      payload: data,
    };
    expect(actions.addRatingsRequest(data)).toEqual(addRatingsRequestAction);
  });
  it('should create an action to add rating', () => {
    const data = { id: 1, name: 'new rating' };
    const addRatingAction = {
      type: types.ADD_RATING,
      payload: data,
    };
    expect(actions.getRatingByID(data)).toEqual(addRatingAction);
  });
  it('should create an action to reset ratings', () => {
    const resetRatingsAction = {
      type: types.RESET_RATINGS,
    };
    expect(actions.resetRatings()).toEqual(resetRatingsAction);
  });
  it('should create actions to fetch ratings success', () => {
    const query = { page: 1, limit: 5 };
    const ratings = [{ id: 1, name: 'Rating' }];
    const resp = { data: { nodes: ratings, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_RATINGS,
        payload: [{ id: 1, name: 'Rating', medium: undefined }],
      },
      {
        type: types.ADD_RATINGS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_RATINGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getRatings(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.RATINGS_API, {
      params: query,
    });
  });
  it('should create actions to fetch ratings success with media', () => {
    const query = { page: 1, limit: 5 };
    const medium = { id: 3, medium: 'Medium' };
    const ratings = [{ id: 1, name: 'Rating', medium }];
    const resp = { data: { nodes: ratings, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_RATINGS,
        payload: [{ id: 1, name: 'Rating', medium: 3 }],
      },
      {
        type: types.ADD_RATINGS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_RATINGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getRatings(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.RATINGS_API, {
      params: query,
    });
  });
  it('should create actions to fetch ratings failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
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
      .dispatch(actions.getRatings(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.RATINGS_API, {
      params: query,
    });
  });
  it('should create actions to get rating by id failure', () => {
    const id = 1;
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
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
      .dispatch(actions.getRating(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.RATINGS_API + '/' + id);
  });
  it('should create actions to get rating by id success', () => {
    const id = 1;
    const rating = { id, name: 'Rating' };
    const resp = { data: rating };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_RATING,
        payload: { id, name: 'Rating', medium: undefined },
      },
      {
        type: types.SET_RATINGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getRating(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.RATINGS_API + '/' + id);
  });
  it('should create actions to get rating by id where rating has medium', () => {
    const id = 1;
    const medium = { id: 1, medium: 'Medium' };
    const rating = { id, name: 'Rating', medium };
    const resp = { data: rating };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_RATING,
        payload: { id, name: 'Rating', medium: 1 },
      },
      {
        type: types.SET_RATINGS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getRating(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.RATINGS_API + '/' + id);
  });
  it('should create actions to create rating success', () => {
    const rating = { name: 'Rating' };
    const resp = { data: rating };
    axios.post.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_RATINGS,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Rating added',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.addRating(rating))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.RATINGS_API, rating);
  });
  it('should create actions to create rating failure', () => {
    const rating = { name: 'Rating' };
    const errorMessage = 'Failed to create rating';
    axios.post.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
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
      .dispatch(actions.addRating(rating))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(types.RATINGS_API, rating);
  });
  it('should create actions to update rating without medium success', () => {
    const rating = { id: 1, name: 'Rating' };
    const resp = { data: rating };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_RATING,
        payload: { id: 1, name: 'Rating', medium: undefined },
      },
      {
        type: types.SET_RATINGS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Rating updated',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateRating(rating))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.RATINGS_API + '/1', rating);
  });
  it('should create actions to update rating with medium success', () => {
    const medium = { id: 4, name: 'mediumm' };
    const rating = { id: 1, name: 'Rating', medium: medium };
    const resp = { data: rating };
    axios.put.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      },
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_RATING,
        payload: { id: 1, name: 'Rating', medium: 4 },
      },
      {
        type: types.SET_RATINGS_LOADING,
        payload: false,
      },
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Rating updated',
        },
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.updateRating(rating))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.RATINGS_API + '/1', rating);
  });
  it('should create actions to update rating failure', () => {
    const rating = { id: 1, name: 'Rating' };
    const errorMessage = 'Failed to update rating';
    axios.put.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
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
      .dispatch(actions.updateRating(rating))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.put).toHaveBeenCalledWith(types.RATINGS_API + '/1', rating);
  });
  it('should create actions to delete rating success', () => {
    axios.delete.mockResolvedValue();

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
        payload: true,
      },
      {
        type: types.RESET_RATINGS,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.deleteRating(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.RATINGS_API + '/1');
  });
  it('should create actions to delete rating failure', () => {
    const errorMessage = 'Failed to delete rating';
    axios.delete.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_RATINGS_LOADING,
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
      .dispatch(actions.deleteRating(1))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.delete).toHaveBeenCalledWith(types.RATINGS_API + '/1');
  });
  it('should create actions to add ratings list', () => {
    const medium = { id: 4, name: 'mediumm' };
    const ratings = [
      { id: 1, name: 'Rating' },
      { id: 2, name: 'Rating', medium: medium },
    ];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [medium],
      },
      {
        type: types.ADD_RATINGS,
        payload: [
          { id: 1, name: 'Rating', medium: undefined },
          { id: 2, name: 'Rating', medium: 4 },
        ],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addRatings(ratings));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create actions to add empty ratings list', () => {
    const ratings = [];

    const expectedActions = [
      {
        type: ADD_MEDIA,
        payload: [],
      },
      {
        type: types.ADD_RATINGS,
        payload: [],
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addRatings(ratings));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
