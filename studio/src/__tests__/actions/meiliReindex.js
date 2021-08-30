import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/meiliReindex';
import { MEILI_REINDEX_API } from '../../constants/meiliReindex';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

describe('meiliReindex actions', () => {
  it('should create actions to reindex space', () => {
    const id = 1;
    const resp = { status: 200 };
    axios.post.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Successfully Reindexed',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({});
    store
      .dispatch(actions.reindexSpace(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(MEILI_REINDEX_API + '/space/' + id);
  });
  it('should create actions to reindex space without succes status', () => {
    const id = 1;
    const resp = { status: 404 };
    axios.post.mockResolvedValue(resp);
    const expectedActions = [];
    const store = mockStore({});
    store
      .dispatch(actions.reindexSpace(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.post).toHaveBeenCalledWith(MEILI_REINDEX_API + '/space/' + id);
  });
  it('should create actions to reindex space failure', () => {
    const id = 1;
    const errorMessage = 'Something went wrong';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
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
    const store = mockStore({});
    store
      .dispatch(actions.reindexSpace(id))
      .then(() => expect(store.getActions()).toEqual(expectedActions));

    expect(axios.post).toHaveBeenCalledWith(MEILI_REINDEX_API + '/space/' + id);
  });
  it('should create actions to reindex instance', () => {
    const resp = { status: 200 };
    axios.post.mockResolvedValue(resp);
    const expectedActions = [
      {
        type: ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Successfully Reindexed',
          time: Date.now(),
        },
      },
    ];
    const store = mockStore({});
    store
      .dispatch(actions.reindex())
      .then(() => expect(store.getActions()).toEqual(expectedActions));

    expect(axios.post).toHaveBeenCalledWith(MEILI_REINDEX_API + '/all');
  });
  it('should create actions to reindex instance without success status', () => {
    const resp = { status: 404 };
    axios.post.mockResolvedValue(resp);
    const expectedActions = [];
    const store = mockStore({});
    store
      .dispatch(actions.reindex())
      .then(() => expect(store.getActions()).toEqual(expectedActions));

    expect(axios.post).toHaveBeenCalledWith(MEILI_REINDEX_API + '/all');
  });
  it('should create actions to reindex instance', () => {
    const errorMessage = 'Something went wrong';
    axios.post.mockRejectedValue(new Error(errorMessage));
    const expectedActions = [
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
    const store = mockStore({});
    store
      .dispatch(actions.reindex())
      .then(() => expect(store.getActions()).toEqual(expectedActions));

    expect(axios.post).toHaveBeenCalledWith(MEILI_REINDEX_API + '/all');
  });
});
