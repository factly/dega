import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/authors';
import * as types from '../../constants/authors';
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

describe('authors actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_AUTHORS_LOADING,
      payload: true,
    };
    expect(actions.loadingAuthors()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_AUTHORS_LOADING,
      payload: false,
    };
    expect(actions.stopAuthorsLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add authors list', () => {
    const data = [
      { id: 1, author: 'tester t' },
      { id: 2, author: 'testing 2' },
    ];

    const addAuthorsAction = {
      type: types.ADD_AUTHORS,
      payload: data,
    };
    expect(actions.addAuthorsList(data)).toEqual(addAuthorsAction);
  });
  it('should create an action to add authors', () => {
    const data = [
      { id: 1, author: 'tester t' },
      { id: 2, author: 'testing 2' },
    ];

    const expectedActions = [
      {
        type: types.ADD_AUTHORS,
        payload: data,
      },
    ];

    const store = mockStore({ initialState });
    store.dispatch(actions.addAuthors(data));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should create an action to add authors request', () => {
    const data = [{ query: 'query' }];
    const addAuthorsRequestAction = {
      type: types.ADD_AUTHORS_REQUEST,
      payload: data,
    };
    expect(actions.addAuthorsRequest(data)).toEqual(addAuthorsRequestAction);
  });
  it('should create actions to fetch authors success', () => {
    const query = { page: 1, limit: 5 };
    const authors = [{ id: 1, name: 'Author' }];
    const resp = { data: { nodes: authors, total: 1 } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_AUTHORS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_AUTHORS,
        payload: authors,
      },
      {
        type: types.ADD_AUTHORS_REQUEST,
        payload: {
          data: [1],
          query: query,
          total: 1,
        },
      },
      {
        type: types.SET_AUTHORS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getAuthors(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.AUTHORS_API, {
      params: query,
    });
  });
  it('should create actions to fetch authors failure', () => {
    const query = { page: 1, limit: 5 };
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_AUTHORS_LOADING,
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
      .dispatch(actions.getAuthors(query))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.AUTHORS_API, {
      params: query,
    });
  });
});
