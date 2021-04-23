import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../../actions/users';
import * as types from '../../constants/users';
import { ADD_NOTIFICATION } from '../../constants/notifications';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('axios');
Date.now = jest.fn(() => 1487076708000);

const initialState = {
  details: [],
  loading: true,
};

const user = {
  id: 1,
  created_at: '2020-09-23T06:11:01.39323Z',
  updated_at: '2020-09-25T12:32:46.395603Z',
  deleted_at: null,
  email: 'ross@friends.in',
  first_name: 'Ross',
  last_name: 'Geller',
  birth_date: '2020-09-02T18:02:41+05:30',
  gender: 'male',
  policies: [
    {
      id: 'admin',
      name: 'admin',
      description: '',
    },
  ],
};

describe('users actions', () => {
  it('should create an action to set loading to true', () => {
    const startLoadingAction = {
      type: types.SET_USERS_LOADING,
      payload: true,
    };
    expect(actions.loadingUsers()).toEqual(startLoadingAction);
  });
  it('should create an action to set loading to false', () => {
    const stopLoadingAction = {
      type: types.SET_USERS_LOADING,
      payload: false,
    };
    expect(actions.stopLoading()).toEqual(stopLoadingAction);
  });
  it('should create an action to add users request', () => {
    const data = [user];
    const addRequestAction = {
      type: types.ADD_USERS_REQUEST,
      payload: data,
    };
    expect(actions.addRequest(data)).toEqual(addRequestAction);
  });
  it('should create actions to fetch users success', () => {
    const resp = { data: { nodes: [user] } };
    axios.get.mockResolvedValue(resp);

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
        payload: true,
      },
      {
        type: types.ADD_USERS_REQUEST,
        payload: {
          data: [user],
        },
      },
      {
        type: types.SET_USERS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getUsers())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.USERS_API);
  });
  it('should create actions to fetch user failure', () => {
    const errorMessage = 'Unable to fetch';
    axios.get.mockRejectedValue(new Error(errorMessage));

    const expectedActions = [
      {
        type: types.SET_USERS_LOADING,
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
        type: types.SET_USERS_LOADING,
        payload: false,
      },
    ];

    const store = mockStore({ initialState });
    store
      .dispatch(actions.getUsers())
      .then(() => expect(store.getActions()).toEqual(expectedActions));
    expect(axios.get).toHaveBeenCalledWith(types.USERS_API);
  });
});
